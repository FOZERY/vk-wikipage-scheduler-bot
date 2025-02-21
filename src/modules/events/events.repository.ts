import { Result } from 'neverthrow';
import { Nullable } from '../../shared/types/common.types.js';
import { GetEventsByDateRangeDTO } from './event.dto.js';
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
	): Promise<Result<EventEntity[], unknown>>;

	create(event: EventEntity, tx?: unknown): Promise<Result<void, unknown>>;

	update(event: EventEntity, tx?: unknown): Promise<Result<void, unknown>>;

	delete(id: number, tx?: unknown): Promise<Result<void, unknown>>;
}
