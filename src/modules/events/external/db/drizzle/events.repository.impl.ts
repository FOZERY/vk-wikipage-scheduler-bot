import dayjs from "dayjs";
import { and, asc, between, eq, gte, ilike, or, sql } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok, Result } from "neverthrow";
import postgres from "postgres";
import { DrizzleTransctionType } from "../../../../../external/db/drizzle/index.js";
import {
	eventsTable,
	TimeRange,
} from "../../../../../external/db/drizzle/schema.js";
import {
	DatabaseConstraintError,
	DatabaseError,
} from "../../../../../shared/errors.js";
import { Nullable } from "../../../../../shared/types/common.types.js";
import { GetEventsByDateRangeDTO } from "../../../event.dto.js";
import { EventEntity } from "../../../event.entity.js";
import { EventsRepository } from "../../../events.repository.js";

export class EventsRepositoryImpl implements EventsRepository {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async getById(
		id: number,
		tx?: unknown
	): Promise<EventEntity | null> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new Error("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			const event = await connection
				.select()
				.from(eventsTable)
				.where(eq(eventsTable.id, id))
				.limit(1);

			if (event.length === 0) {
				return null;
			}

			const timeRange = event[0].time_range
				? {
						startTime: event[0].time_range.startTime.value,
						endTime: event[0].time_range.endTime.value,
					}
				: null;
			const eventResult = EventEntity.create({
				id: event[0].id,
				date: event[0].date,
				timeRange: timeRange,
				organizer: event[0].organizer,
				place: event[0].place,
				title: event[0].title,
				lastUpdaterId: event[0].last_updater_id,
				createdAt: event[0].created_at || undefined,
				updatedAt: event[0].updated_at || undefined,
			});

			if (eventResult.isErr()) {
				throw eventResult.error;
			}

			return eventResult.value;
		} catch (error) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	public async delete(id: number, tx?: unknown): Promise<void> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new DatabaseError("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			await connection.delete(eventsTable).where(eq(eventsTable.id, id));

			return;
		} catch (error) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	async findEventsByTitleOrDate(
		searchString: string,
		tx?: unknown
	): Promise<EventEntity[]> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new DatabaseError("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		const ftsQuery = searchString.trim().replaceAll(" ", "+") + ":*";

		try {
			const events = await connection
				.select()
				.from(eventsTable)
				.where(
					or(
						sql`fts @@ to_tsquery('russian', ${ftsQuery})`,
						ilike(
							sql<string>`to_char(${eventsTable.date}, 'YYYY-MM-DD')`,
							`${dayjs(searchString, "DD.MM.YYYY").format(
								"YYYY-MM-DD"
							)}%`
						)
					)
				)
				.limit(10)
				.orderBy(asc(eventsTable.date), asc(sql`lower(time_range)`));

			const mappedEvents: EventEntity[] = [];
			for (const event of events) {
				const timeRange = event.time_range
					? {
							startTime: event.time_range.startTime.value,
							endTime: event.time_range.endTime.value,
						}
					: null;
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					timeRange: timeRange,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					lastUpdaterId: event.last_updater_id,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					throw eventResult.error;
				}

				mappedEvents.push(eventResult.value);
			}

			return mappedEvents;
		} catch (error) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	async getEventsByDateRange(
		month: GetEventsByDateRangeDTO,
		tx?: unknown
	): Promise<EventEntity[]> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new DatabaseError("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			const events = await connection
				.select()
				.from(eventsTable)
				.where(
					month.endDate
						? between(
								eventsTable.date,
								month.startDate,
								month.endDate
							)
						: gte(eventsTable.date, month.startDate)
				)
				.orderBy(
					asc(eventsTable.date),
					asc(sql`lower(time_range)`),
					asc(sql`upper(time_range)`)
				);

			const mappedEvents: EventEntity[] = [];
			for (const event of events) {
				const timeRange = event.time_range
					? {
							startTime: event.time_range.startTime.value,
							endTime: event.time_range.endTime.value,
						}
					: null;
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					timeRange: timeRange,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					lastUpdaterId: event.last_updater_id,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					throw eventResult.error;
				}

				mappedEvents.push(eventResult.value);
			}

			return mappedEvents;
		} catch (error) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	// TODO: создать дтошечку?
	async findCollisionsByDateTimePlace(
		dto: {
			date: string;
			timeRange: Nullable<{
				startTime: string;
				endTime: string;
			}>;
			place: string;
			excludeId?: number;
		},
		tx?: unknown
	) {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new DatabaseError("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		const timeRangeSql = dto.timeRange
			? `(${dto.timeRange.startTime},${dto.timeRange.endTime})`
			: undefined;
		let whereConditions = and(
			eq(eventsTable.date, dto.date),
			ilike(eventsTable.place, `%${dto.place}%`),
			dto.timeRange
				? sql`${eventsTable.time_range} && ${timeRangeSql}::timerange`
				: undefined
		);

		try {
			const collisions = await connection
				.select()
				.from(eventsTable)
				.where(whereConditions)
				.limit(1);

			const mappedCollisions: EventEntity[] = [];
			for (const event of collisions) {
				const timeRange = event.time_range
					? {
							startTime: event.time_range.startTime.value,
							endTime: event.time_range.endTime.value,
						}
					: null;
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					timeRange: timeRange,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					lastUpdaterId: event.last_updater_id,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					throw eventResult.error;
				}

				mappedCollisions.push(eventResult.value);
			}

			return mappedCollisions;
		} catch (error) {
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	async create(
		event: EventEntity,
		tx?: unknown
	): Promise<Result<void, DatabaseConstraintError>> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new DatabaseError("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		const time_range: Nullable<TimeRange> = event.timeRange
			? {
					startTime: {
						strict: false,
						value: event.timeRange.startTime,
					},
					endTime: { strict: false, value: event.timeRange.endTime },
				}
			: null;

		try {
			await connection.insert(eventsTable).values({
				date: event.date,
				organizer: event.organizer,
				place: event.place,
				last_updater_id: event.lastUpdaterId,
				time_range: time_range,
				title: event.title,
			});

			return ok(undefined);
		} catch (error) {
			if (error instanceof postgres.PostgresError) {
				// exclude code for overlapping time ranges
				if (error.code === "23P01") {
					return err(
						new DatabaseConstraintError(
							"Overlapping time ranges",
							error.constraint_name!,
							error
						)
					);
				}
			}
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}

	async update(
		event: EventEntity & { id: number },
		tx?: unknown
	): Promise<Result<void, DatabaseConstraintError>> {
		if (tx && !(tx instanceof PgTransaction)) {
			throw new Error("tx is not instanceof PgTransaction");
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		const time_range: Nullable<TimeRange> = event.timeRange
			? {
					startTime: {
						strict: false,
						value: event.timeRange.startTime,
					},
					endTime: { strict: false, value: event.timeRange.endTime },
				}
			: null;

		try {
			await connection
				.update(eventsTable)
				.set({
					date: event.date,
					time_range: time_range,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					last_updater_id: event.lastUpdaterId,
					updated_at: new Date(),
				})
				.where(eq(eventsTable.id, event.id));

			return ok(undefined);
		} catch (error) {
			if (error instanceof postgres.PostgresError) {
				// exclude code for overlapping time ranges
				if (error.code === "23P01") {
					return err(
						new DatabaseConstraintError(
							"Overlapping time ranges",
							error.constraint_name!,
							error
						)
					);
				}
			}
			if (error instanceof Error) {
				throw new DatabaseError(error.message, error);
			}
			throw new DatabaseError("Unknown error", error);
		}
	}
}
