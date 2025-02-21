import dayjs from 'dayjs';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { err, ok, Result } from 'neverthrow';
import { Logger } from 'pino';
import { logger } from '../../external/logger/pino.js';
import { ScheduleService } from '../../external/vk/api/wiki/schedule/schedule-service.js';
import {
	CreateEventDTO,
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
	UpdateEventDTO,
} from './event.dto.js';
import { EventEntity } from './event.entity.js';
import { EventsRepository } from './events.repository.js';

export class EventCollisionError extends Error {
	public collisionEvent: EventEntity;

	constructor(message: string, collisionEvent: EventEntity) {
		super(message);
		this.name = 'CollisionError';
		this.collisionEvent = collisionEvent;
	}
}

export class EventsService {
	private logger: Logger;

	constructor(
		private readonly scheduleService: ScheduleService,
		private readonly eventsRepository: EventsRepository,
		private readonly db: PostgresJsDatabase
	) {
		this.logger = logger.child({ context: 'events-service' });
	}

	public async findEventsByTitleOrDate(searchString: string) {
		this.logger.info(
			`EventsService -> findEventsByTitleOrDate with searchString '${searchString}' executed`
		);
		const result = await this.eventsRepository.findEventsByTitleOrDate(
			searchString
		);

		if (result.isErr()) {
			this.logger.info(
				result.error,
				`ERROR in EventsService -> findEventsByTitleOrDate with searchString '${searchString}'`
			);
			return err(result.error);
		}

		return ok(result.value);
	}

	public async deleteEventById(id: number) {
		this.logger.info(
			`EventsService -> deleteEventById with id '${id}' executed`
		);
		try {
			await this.db.transaction(async (tx) => {
				const result = await this.eventsRepository.delete(id, tx);

				if (result.isErr()) {
					throw result.error;
				}

				const renderResult = await this.renderScheduleFromCurrentMonth(
					tx
				);

				if (renderResult.isErr()) {
					throw renderResult.error;
				}

				return;
			});
		} catch (error) {
			this.logger.error(
				error,
				`EventsService -> deleteEventById with id '${id}' has error`
			);
			return err(error);
		}

		return ok(undefined);
	}

	public async getEventsByDateRange(dto: GetEventsByDateRangeDTO) {
		this.logger.info(
			`EventsService -> getEventsByDateRange with startDate '${dto.startDate}' and endDate '${dto.endDate}' executed`
		);
		if (!dayjs(dto.startDate, 'YYYY-MM-DD', true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> getEventsByDateRange Validation error: startDate '${dto.startDate}' must be in the format YYYY-MM-DD`
			);
			return err(
				new Error(
					'Validation error: startDate must be in the format YYYY-MM-DD'
				)
			);
		}

		if (dto.endDate && !dayjs(dto.endDate, 'YYYY-MM-DD', true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> getEventsByDateRange Validation error: endDate '${dto.endDate}' must be in the format YYYY-MM-DD`
			);
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
			this.logger.warn(
				{ error: res.error, dto: dto },
				`EventsService -> getEventsByDateRange with startDate '${dto.startDate}' and endDate '${dto.endDate}' has error`
			);
			return err(res.error);
		}

		return ok(res.value);
	}

	public async findCollisionsInSchedule(
		dto: FindCollisionsByDateTimePlaceDTO
	) {
		// Validate date
		if (!dayjs(dto.date, 'YYYY-MM-DD', true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: date ${dto.date} must be in the format YYYY-MM-DD`
			);
			return err(
				new Error(
					'Validation error: date must be in the format YYYY-MM-DD'
				)
			);
		}

		// Validate startTime if provided
		if (
			dto.timeRange &&
			!dayjs(dto.timeRange.startTime, 'HH:mm:ss', true).isValid()
		) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: startTime ${dto.timeRange.startTime} must be in the format HH:mm:ss`
			);
			return err(
				new Error(
					'Validation error: startTime must be in the format HH:mm:ss'
				)
			);
		}

		// Validate endTime if provided
		if (
			dto.timeRange &&
			dto.timeRange.endTime &&
			!dayjs(dto.timeRange.endTime, 'HH:mm:ss', true).isValid()
		) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: endTime ${dto.timeRange.endTime} must be in the format HH:mm:ss`
			);
			return err(
				new Error(
					'Validation error: endTime must be in the format HH:mm:ss'
				)
			);
		}

		// If both startTime and endTime are provided, ensure startTime is before endTime
		if (
			dto.timeRange &&
			dto.timeRange.endTime &&
			dayjs(dto.timeRange.startTime).isAfter(dayjs(dto.timeRange.endTime))
		) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: startTime ${dto.timeRange.startTime} must be before ${dto.timeRange.endTime}`
			);
			return err(
				new Error('Validation error: startTime must be before endTime')
			);
		}

		if (dto.timeRange && dto.timeRange.endTime === null) {
			dto.timeRange.endTime = dayjs(dto.timeRange.startTime, 'HH:mm:ss')
				.add(15, 'minute')
				.format('HH:mm:ss');
		}

		const result =
			// @ts-ignore
			await this.eventsRepository.findCollisionsByDateTimePlace(dto);

		if (result.isErr()) {
			this.logger.error({ dto, error: result.error });
			return err(result.error);
		}

		return ok(result.value);
	}

	public async create(dto: CreateEventDTO) {
		try {
			await this.db.transaction(
				async (tx) => {
					const entityResult = EventEntity.create({
						date: dto.date,
						place: dto.place,
						title: dto.title,
						organizer: dto.organizer,
						timeRange: dto.timeRange,
						lastUpdaterId: dto.lastUpdaterId,
					});

					if (entityResult.isErr()) {
						this.logger.error(
							entityResult.error,
							'EventsService -> create: EventEntity create error'
						);
						throw new Error('EventEntity create error', {
							cause: entityResult.error,
						});
					}

					const createResult = await this.eventsRepository.create(
						entityResult.value,
						tx
					);

					if (createResult.isErr()) {
						throw createResult.error;
					}

					const renderResult =
						await this.renderScheduleFromCurrentMonth(tx);
					if (renderResult.isErr()) {
						throw renderResult.error;
					}

					return;
				},
				{ isolationLevel: 'read committed' }
			);

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}

	public async update(dto: UpdateEventDTO) {
		const entityResult = await this.eventsRepository.getById(dto.id);
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
					const updatePropsResult = Result.combine([
						event.setOrganizer(dto.organizer),
						event.setPlace(dto.place),
						event.setTitle(dto.title),
						event.setDate(dto.date),
						event.setTimeRange(dto.timeRange),
						event.setLastUpdaterId(dto.lastUpdaterId),
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

					const renderResult =
						await this.renderScheduleFromCurrentMonth(tx);
					if (renderResult.isErr()) {
						throw renderResult.error;
					}

					return;
				},
				{ isolationLevel: 'read committed' }
			);

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}

	public async renderScheduleFromCurrentMonth(
		tx?: unknown
	): Promise<Result<void, unknown>> {
		const startOfRange = dayjs().tz().startOf('M');
		const getEventsByDateRangeResult =
			await this.eventsRepository.getEventsByDateRange(
				{
					startDate: startOfRange.format('YYYY-MM-DD'),
				},
				tx
			);

		if (getEventsByDateRangeResult.isErr()) {
			return err(getEventsByDateRangeResult.error);
		}

		const renderResult = await this.scheduleService.renderSchedule(
			getEventsByDateRangeResult.value
		);

		if (renderResult.isErr()) {
			return err(renderResult.error);
		}

		return ok(undefined);
	}
}
