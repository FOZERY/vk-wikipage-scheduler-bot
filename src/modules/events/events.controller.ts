import dayjs from 'dayjs';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { err, ok, Result } from 'neverthrow';
import { ScheduleRenderer } from '../../external/vk/api/wiki/schedule/schedule-renderer.js';
import {
	CreateEventDTO,
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
	UpdateEventDTO,
} from './event.dto.js';
import { EventEntity } from './event.entity.js';
import { EventsRepository } from './events.repository.js';

export class EventsController {
	constructor(
		private readonly scheduleRenderer: ScheduleRenderer,
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
		try {
			await this.db.transaction(async (tx) => {
				const result = await this.eventsRepository.delete(id, tx);

				if (result.isErr()) {
					throw result.error;
				}

				const startOfMonthRange = dayjs().tz().startOf('M');
				const getEventsByDateRangeResult =
					await this.eventsRepository.getEventsByDateRange(
						{
							startDate: startOfMonthRange.format('YYYY-MM-DD'),
						},
						tx
					);

				if (getEventsByDateRangeResult.isErr()) {
					throw getEventsByDateRangeResult.error;
				}

				const eventsForRender = getEventsByDateRangeResult.value;
				const renderResult = await this.scheduleRenderer.renderSchedule(
					eventsForRender
				);

				if (renderResult.isErr()) {
					throw renderResult.error;
				}

				return;
			});
		} catch (error) {
			return err(error);
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
					const getEventsByDateRangeResult =
						await this.eventsRepository.getEventsByDateRange(
							{
								startDate:
									startOfMonthRange.format('YYYY-MM-DD'),
							},
							tx
						);

					if (getEventsByDateRangeResult.isErr()) {
						throw getEventsByDateRangeResult.error;
					}

					const eventsForRender = getEventsByDateRangeResult.value;
					const renderResult =
						await this.scheduleRenderer.renderSchedule(
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

	public async update(eventDTO: UpdateEventDTO) {
		const entityResult = await this.eventsRepository.getById(eventDTO.id);
		if (entityResult.isErr()) {
			return err(entityResult.error);
		}

		const event = entityResult.value;

		if (!event) {
			return err('Event not found');
		}

		try {
			await this.db.transaction(
				async (tx) => {
					const checkCollisionResult =
						await this.eventsRepository.findCollisionsByDateTimePlace(
							{
								date: eventDTO.date,
								place: eventDTO.place,
								endTime: eventDTO.endTime,
								startTime: eventDTO.startTime,
								excludeId: event.id,
							},
							tx
						);

					if (checkCollisionResult.isErr()) {
						throw checkCollisionResult.error;
					}

					if (checkCollisionResult.value.length > 0) {
						throw new Error('Event collision detected');
					}

					const updatePropsResult = Result.combine([
						event.setOrganizer(eventDTO.organizer),
						event.setPlace(eventDTO.place),
						event.setTitle(eventDTO.title),
						event.setDate(eventDTO.date),
						event.setStartTime(eventDTO.startTime),
						event.setEndTime(eventDTO.endTime),
					]);

					if (updatePropsResult.isErr()) {
						throw updatePropsResult.error;
					}

					const updateResult = await this.eventsRepository.update(
						event,
						tx
					);

					if (updateResult.isErr()) {
						throw updateResult.error;
					}

					const startOfMonthRange = dayjs().tz().startOf('M');
					const getEventsByDateRangeResult =
						await this.eventsRepository.getEventsByDateRange(
							{
								startDate:
									startOfMonthRange.format('YYYY-MM-DD'),
							},
							tx
						);

					if (getEventsByDateRangeResult.isErr()) {
						throw getEventsByDateRangeResult.error;
					}

					const renderResult = await this.renderSchedule(
						getEventsByDateRangeResult.value
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

	private async renderSchedule(
		events: EventEntity[]
	): Promise<Result<void, unknown>> {
		const renderResult = await this.scheduleRenderer.renderSchedule(events);

		if (renderResult.isErr()) {
			return err(renderResult.error);
		}

		return ok(undefined);
	}
}
