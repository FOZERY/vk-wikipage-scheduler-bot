import dayjs from "dayjs";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Result, err, ok } from "neverthrow";
import type { Logger } from "pino";
import { logger } from "../../external/logger/pino.js";
import type { ScheduleService } from "../../external/vk/api/wiki/schedule/schedule-service.js";
import { DatabaseConstraintError, ValidationError } from "../../shared/errors.js";
import type {
	CreateEventDTO,
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
	UpdateEventDTO,
} from "./event.dto.js";
import { EventEntity } from "./event.entity.js";
import type { EventsRepository } from "./events.repository.js";

export class EventsService {
	private logger: Logger;

	constructor(
		private readonly scheduleService: ScheduleService,
		private readonly eventsRepository: EventsRepository,
		private readonly db: PostgresJsDatabase
	) {
		this.logger = logger.child({ context: "events-service" });
	}

	public async findEventById(id: number): Promise<EventEntity | null> {
		this.logger.info(`EventsService -> findEventById with id '${id}' executed`);

		const event = await this.eventsRepository.getById(id);

		return event;
	}

	public async findEventsByTitleOrDate(searchString: string) {
		this.logger.info(
			`EventsService -> findEventsByTitleOrDate with searchString '${searchString}' executed`
		);

		const events = await this.eventsRepository.findEventsByTitleOrDate(searchString);

		return ok(events);
	}

	public async deleteEventById(id: number) {
		this.logger.info(`EventsService -> deleteEventById with id '${id}' executed`);

		await this.db.transaction(async (tx) => {
			await this.eventsRepository.delete(id, tx);
			await this.renderScheduleFromCurrentMonth(tx);
		});

		return ok(undefined);
	}

	public async getEventsByDateRange(dto: GetEventsByDateRangeDTO) {
		this.logger.info(
			`EventsService -> getEventsByDateRange with startDate '${dto.startDate}' and endDate '${dto.endDate}' executed`
		);
		if (!dayjs(dto.startDate, "YYYY-MM-DD", true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> getEventsByDateRange Validation error: startDate '${dto.startDate}' must be in the format YYYY-MM-DD`
			);
			return err(
				new ValidationError(
					"Validation error: startDate must be in the format YYYY-MM-DD",
					dto.startDate,
					"YYYY-MM-DD"
				)
			);
		}

		if (dto.endDate && !dayjs(dto.endDate, "YYYY-MM-DD", true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> getEventsByDateRange Validation error: endDate '${dto.endDate}' must be in the format YYYY-MM-DD`
			);
			return err(
				new ValidationError(
					"Validation error: endDate must be in the format YYYY-MM-DD",
					dto.endDate,
					"YYYY-MM-DD"
				)
			);
		}

		const events = await this.eventsRepository.getEventsByDateRange({
			startDate: dto.startDate,
			endDate: dto.endDate,
		});

		return ok(events);
	}

	public async findCollisionsInSchedule(dto: FindCollisionsByDateTimePlaceDTO) {
		// Validate date
		if (!dayjs(dto.date, "YYYY-MM-DD", true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: date ${dto.date} must be in the format YYYY-MM-DD`
			);
			return err(
				new ValidationError(
					"Validation error: date must be in the format YYYY-MM-DD",
					dto.date,
					"YYYY-MM-DD"
				)
			);
		}

		// Validate startTime if provided
		if (dto.timeRange && !dayjs(dto.timeRange.startTime, "HH:mm:ss", true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: startTime ${dto.timeRange.startTime} must be in the format HH:mm:ss`
			);
			return err(
				new ValidationError(
					"Validation error: startTime must be in the format HH:mm:ss",
					dto.timeRange.startTime,
					"HH:mm:ss"
				)
			);
		}

		// Validate endTime if provided
		if (dto.timeRange?.endTime && !dayjs(dto.timeRange.endTime, "HH:mm:ss", true).isValid()) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: endTime ${dto.timeRange.endTime} must be in the format HH:mm:ss`
			);
			return err(
				new ValidationError(
					"Validation error: endTime must be in the format HH:mm:ss",
					dto.timeRange.endTime,
					"HH:mm:ss"
				)
			);
		}

		// If both startTime and endTime are provided, ensure startTime is before endTime
		if (
			dto.timeRange?.endTime &&
			dayjs(dto.timeRange.startTime).isAfter(dayjs(dto.timeRange.endTime))
		) {
			this.logger.warn(
				{ dto },
				`EventsService -> findCollisionsInSchedule Validation error: startTime ${dto.timeRange.startTime} must be before ${dto.timeRange.endTime}`
			);
			return err(
				new ValidationError(
					"Validation error: startTime must be before endTime",
					{
						startTime: dto.timeRange.startTime,
						endTime: dto.timeRange.endTime,
					},
					"startTime < endTime"
				)
			);
		}

		if (dto.timeRange && dto.timeRange.endTime === null) {
			dto.timeRange.endTime = dayjs(dto.timeRange.startTime, "HH:mm:ss")
				.add(15, "minute")
				.format("HH:mm:ss");
		}

		const events =
			// @ts-ignore
			await this.eventsRepository.findCollisionsByDateTimePlace(dto);

		return ok(events);
	}

	public async create(
		dto: CreateEventDTO
	): Promise<Result<void, DatabaseConstraintError | ValidationError>> {
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
							"EventsService -> create: EventEntity create error"
						);
						throw entityResult.error;
					}

					const createResult = await this.eventsRepository.create(entityResult.value, tx);

					if (createResult.isErr()) {
						throw createResult.error;
					}

					await this.renderScheduleFromCurrentMonth(tx);
				},
				{ isolationLevel: "read committed" }
			);

			return ok(undefined);
		} catch (error) {
			if (error instanceof DatabaseConstraintError || error instanceof ValidationError) {
				return err(error);
			}

			throw error;
		}
	}

	public async update(
		dto: UpdateEventDTO
	): Promise<Result<void, DatabaseConstraintError | ValidationError | "Event not found">> {
		const eventOrNull = await this.eventsRepository.getById(dto.id);

		if (!eventOrNull) {
			// TODO: придумать че тут
			return err("Event not found");
		}

		try {
			await this.db.transaction(
				async (tx) => {
					const updatePropsResult = Result.combine([
						eventOrNull.setOrganizer(dto.organizer),
						eventOrNull.setPlace(dto.place),
						eventOrNull.setTitle(dto.title),
						eventOrNull.setDate(dto.date),
						eventOrNull.setTimeRange(dto.timeRange),
						eventOrNull.setLastUpdaterId(dto.lastUpdaterId),
					]);

					if (updatePropsResult.isErr()) {
						throw updatePropsResult.error;
					}

					const updateResult = await this.eventsRepository.update(eventOrNull, tx);

					if (updateResult.isErr()) {
						throw updateResult.error;
					}

					await this.renderScheduleFromCurrentMonth(tx);

					return;
				},
				{ isolationLevel: "read committed" }
			);

			return ok(undefined);
		} catch (error) {
			if (error instanceof DatabaseConstraintError || error instanceof ValidationError) {
				return err(error);
			}

			throw error;
		}
	}

	public async renderScheduleFromCurrentMonth(tx?: unknown): Promise<void> {
		const startOfRange = dayjs().tz().startOf("M");
		const events = await this.eventsRepository.getEventsByDateRange(
			{
				startDate: startOfRange.format("YYYY-MM-DD"),
			},
			tx
		);

		await this.scheduleService.renderSchedule(events);

		return;
	}
}
