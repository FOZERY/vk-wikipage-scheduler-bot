import dayjs from 'dayjs';
import {
	and,
	asc,
	between,
	eq,
	gt,
	gte,
	ilike,
	isNotNull,
	isNull,
	lt,
	lte,
	ne,
	or,
	sql,
} from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { err, ok, Result } from 'neverthrow';
import { DrizzleTransctionType } from '../../../../../external/db/drizzle/index.js';
import { eventsTable } from '../../../../../external/db/drizzle/schema.js';
import {
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
} from '../../../event.dto.js';
import { EventEntity } from '../../../event.entity.js';
import { EventsRepository } from '../../../events.repository.js';

export class EventsRepositoryImpl implements EventsRepository {
	constructor(private readonly db: PostgresJsDatabase) {}

	public async getById(
		id: number,
		tx?: unknown
	): Promise<Result<EventEntity | null, unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			const event = await connection
				.select()
				.from(eventsTable)
				.where(eq(eventsTable.id, id))
				.limit(1);

			if (event.length === 0) {
				return ok(null);
			}

			const eventResult = EventEntity.create({
				id: event[0].id,
				date: event[0].date,
				startTime: event[0].start_time,
				endTime: event[0].end_time,
				organizer: event[0].organizer,
				place: event[0].place,
				title: event[0].title,
				createdAt: event[0].created_at || undefined,
				updatedAt: event[0].updated_at || undefined,
			});

			if (eventResult.isErr()) {
				return err(eventResult.error);
			}

			return ok(eventResult.value);
		} catch (error) {
			return err(error);
		}
	}

	public async delete(
		id: number,
		tx?: unknown
	): Promise<Result<void, unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			await connection.delete(eventsTable).where(eq(eventsTable.id, id));

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}

	async findEventsByTitleOrDate(
		searchString: string,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		const ftsQuery = searchString.trim().replaceAll(' ', '+') + ':*';

		try {
			const events = await connection
				.select()
				.from(eventsTable)
				.where(
					or(
						sql`fts @@ to_tsquery('russian', ${ftsQuery})`,
						ilike(
							sql<string>`to_char(${eventsTable.date}, 'YYYY-MM-DD')`,
							`${dayjs(searchString, 'DD.MM.YYYY').format(
								'YYYY-MM-DD'
							)}%`
						)
					)
				)
				.limit(10)
				.orderBy(asc(eventsTable.date), asc(eventsTable.start_time));

			const mappedEvents: EventEntity[] = [];
			for (const event of events) {
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					startTime: event.start_time,
					endTime: event.end_time,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					return err(eventResult.error);
				}

				mappedEvents.push(eventResult.value);
			}

			return ok(mappedEvents);
		} catch (error) {
			return err(error);
		}
	}

	async getEventsByDateRange(
		month: GetEventsByDateRangeDTO,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
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
					asc(eventsTable.start_time),
					asc(eventsTable.end_time)
				);

			const mappedEvents: EventEntity[] = [];
			for (const event of events) {
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					startTime: event.start_time,
					endTime: event.end_time,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					return err(eventResult.error);
				}

				mappedEvents.push(eventResult.value);
			}

			return ok(mappedEvents);
		} catch (error) {
			return err(error);
		}
	}

	async findCollisionsByDateTimePlace(
		dto: FindCollisionsByDateTimePlaceDTO,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		let whereConditions = and(
			eq(eventsTable.date, dto.date),
			ilike(eventsTable.place, `%${dto.place}%`),
			isNotNull(eventsTable.start_time)
		);

		if (dto.excludeId) {
			whereConditions = and(
				whereConditions,
				ne(eventsTable.id, dto.excludeId)
			);
		}

		/*
		 * Вообще здесь можно сделать и через time range postgres type, но как будто бы слишком накладно??
		 */
		if (!dto.endTime) {
			// Случай, когда endTime не указано в DTO (одномоментное событие)
			whereConditions = and(
				whereConditions,
				or(
					and(
						isNotNull(eventsTable.end_time),
						lte(eventsTable.start_time, dto.startTime!), // dto.startTime! - уверены, что startTime есть, т.к. проверяли isNotNull
						gt(eventsTable.end_time, dto.startTime!) // dto.startTime! - уверены, что startTime есть, т.к. проверяли isNotNull
					),
					and(
						isNull(eventsTable.end_time),
						eq(eventsTable.start_time, dto.startTime!) // dto.startTime! - уверены, что startTime есть, т.к. проверяли isNotNull
					)
				)
			);
		} else {
			// Случай, когда endTime указано в DTO (диапазон событий)
			whereConditions = and(
				whereConditions,
				or(
					and(
						isNotNull(eventsTable.end_time),
						or(
							and(
								gt(eventsTable.end_time, dto.startTime!), // dto.startTime! - уверены, что startTime есть
								lt(eventsTable.start_time, dto.endTime)
							),
							eq(eventsTable.start_time, dto.startTime!) // dto.startTime! - уверены, что startTime есть
						)
					),
					and(
						isNull(eventsTable.end_time),
						gte(eventsTable.start_time, dto.startTime!), // dto.startTime! - уверены, что startTime есть
						lt(eventsTable.start_time, dto.endTime)
					)
				)
			);
		}

		try {
			const collisions = await connection
				.select()
				.from(eventsTable)
				.where(whereConditions)
				.limit(1);

			const mappedCollisions: EventEntity[] = [];
			for (const event of collisions) {
				const eventResult = EventEntity.create({
					id: event.id,
					date: event.date,
					startTime: event.start_time,
					endTime: event.end_time,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					createdAt: event.created_at || undefined,
					updatedAt: event.updated_at || undefined,
				});

				if (eventResult.isErr()) {
					return err(eventResult.error);
				}

				mappedCollisions.push(eventResult.value);
			}

			return ok(mappedCollisions);
		} catch (error) {
			return err(error);
		}
	}

	async create(
		event: EventEntity,
		tx?: unknown
	): Promise<Result<void, unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		try {
			await connection.insert(eventsTable).values({
				date: event.date,
				end_time: event.endTime,
				organizer: event.organizer,
				place: event.place,
				start_time: event.startTime,
				title: event.title,
			});

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}

	async update(
		event: EventEntity,
		tx?: unknown
	): Promise<Result<void, unknown>> {
		if (tx && !(tx instanceof PgTransaction)) {
			return err('tx is not instanceof PgTransaction');
		}

		const connection = (tx as DrizzleTransctionType) ?? this.db;

		if (!event.id) {
			return err('Event id is required');
		}

		try {
			await connection
				.update(eventsTable)
				.set({
					date: event.date,
					start_time: event.startTime,
					end_time: event.endTime,
					organizer: event.organizer,
					place: event.place,
					title: event.title,
					updated_at: new Date(),
				})
				.where(eq(eventsTable.id, event.id));
			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}
}
