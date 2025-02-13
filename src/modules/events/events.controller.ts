import dayjs from 'dayjs';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { err, ok } from 'neverthrow';
import { ScheduleRenderer } from '../../external/vk/schedule/schedule-renderer.js';
import {
	CreateEventDTO,
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
	UpdateEventDTO,
} from './dto/event.dto.js';
import { EventEntity } from './event.entity.js';
import { EventsRepository } from './repo/events.repository.js';

export class EventsController {
	constructor(
		private readonly eventsRepository: EventsRepository,
		private readonly db: PostgresJsDatabase
	) {}

	public async findEventsByTitleOrDate(searchString: string) {
		const result = await this.eventsRepository.findEventsByTitleOrDate(
			searchString
		);

		if (result.isErr()) {
			return err(result.error);
		}

		return ok(result.value);
	}

	public async deleteEventById(id: number) {
		const result = await this.eventsRepository.delete(id);

		if (result.isErr()) {
			return err(result.error);
		}

		return ok(undefined);
	}

	public async getEventsByDateRange(dto: GetEventsByDateRangeDTO) {
		if (!dayjs(dto.startDate, 'YYYY-MM-DD', true).isValid()) {
			return err(
				new Error(
					'Validation error: startDate must be in the format YYYY-MM-DD'
				)
			);
		}

		if (!dayjs(dto.endDate, 'YYYY-MM-DD', true).isValid()) {
			return err(
				new Error(
					'Validation error: endDate must be in the format YYYY-MM-DD'
				)
			);
		}

		const res = await this.eventsRepository.getEventsByDateRange({
			startDate: dto.startDate,
			endDate: dto.endDate,
		});

		if (res.isErr()) {
			return err(res.error);
		}

		return ok(res.value);
	}

	public async findCollisionsInSchedule(
		dto: FindCollisionsByDateTimePlaceDTO
	) {
		// Validate date
		if (!dayjs(dto.date, 'YYYY-MM-DD', true).isValid()) {
			return err(
				new Error(
					'Validation error: date must be in the format YYYY-MM-DD'
				)
			);
		}

		// Validate startTime if provided
		if (
			dto.startTime &&
			!dayjs(dto.startTime, 'HH:mm:ss', true).isValid()
		) {
			return err(
				new Error(
					'Validation error: startTime must be in the format HH:mm:ss'
				)
			);
		}

		// Validate endTime if provided
		if (dto.endTime && !dayjs(dto.endTime, 'HH:mm:ss', true).isValid()) {
			return err(
				new Error(
					'Validation error: endTime must be in the format HH:mm:ss'
				)
			);
		}

		// If both startTime and endTime are provided, ensure startTime is before endTime
		if (
			dto.startTime &&
			dto.endTime &&
			dayjs(dto.startTime).isAfter(dayjs(dto.endTime))
		) {
			return err(
				new Error('Validation error: startTime must be before endTime')
			);
		}

		const result =
			await this.eventsRepository.findCollisionsByDateTimePlace(dto);

		if (result.isErr()) {
			return err(result.error);
		}

		return ok(result.value);
	}

	public async create(event: CreateEventDTO) {
		const entityResult = EventEntity.create(event);
		if (entityResult.isErr()) {
			return err(entityResult.error);
		}

		try {
			await this.db.transaction(
				async (tx) => {
					const checkCollisionResult =
						await this.eventsRepository.findCollisionsByDateTimePlace(
							{
								date: event.date,
								place: event.place,
								endTime: event.endTime,
								startTime: event.startTime,
							},
							tx
						);

					if (checkCollisionResult.isErr()) {
						throw checkCollisionResult.error;
					}

					if (checkCollisionResult.value.length > 0) {
						throw new Error('Event collision detected');
					}

					const createResult = await this.eventsRepository.create(
						entityResult.value,
						tx
					);

					if (createResult.isErr()) {
						throw createResult.error;
					}

					const startOfMonthRange = dayjs().tz().startOf('M');
					const endOfMonthRange = startOfMonthRange
						.add(1, 'month')
						.add(14, 'day');
					const getEventsByDateRangeResult =
						await this.eventsRepository.getEventsByDateRange({
							startDate: startOfMonthRange.format('YYYY-MM-DD'),
							endDate: endOfMonthRange.format('YYYY-MM-DD'),
						});

					if (getEventsByDateRangeResult.isErr()) {
						throw getEventsByDateRangeResult.error;
					}

					const eventsForRender = getEventsByDateRangeResult.value;
					const scheduleRenderer = new ScheduleRenderer(54554866);
					const renderResult = await scheduleRenderer.renderSchedule(
						eventsForRender
					);

					if (renderResult.isErr()) {
						throw renderResult.error;
					}

					return;
				},
				{ isolationLevel: 'serializable' }
			);

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}

	public async update(event: UpdateEventDTO) {}
}
