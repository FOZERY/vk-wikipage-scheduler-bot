import { Result } from 'neverthrow';
import {
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
} from './event.dto.js';
import { EventEntity } from './event.entity.js';

export interface EventsRepository {
	getById(
		id: number,
		tx?: unknown
	): Promise<Result<EventEntity | null, unknown>>;

	findEventsByTitleOrDate(
		searchString: string,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>>;

	getEventsByDateRange(
		month: GetEventsByDateRangeDTO,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>>;

	findCollisionsByDateTimePlace(
		dto: FindCollisionsByDateTimePlaceDTO,
		tx?: unknown
	): Promise<Result<EventEntity[], unknown>>;

	create(event: EventEntity, tx?: unknown): Promise<Result<void, unknown>>;

	update(event: EventEntity, tx?: unknown): Promise<Result<void, unknown>>;

	delete(id: number, tx?: unknown): Promise<Result<void, unknown>>;
}
