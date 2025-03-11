import type { Result } from "neverthrow";
import type { DatabaseConstraintError } from "../../shared/errors.js";
import type { Nullable } from "../../shared/types/common.types.js";
import type { GetEventsByDateRangeDTO } from "./event.dto.js";
import type { EventEntity } from "./event.entity.js";

export interface EventsRepository {
	getById(id: number, tx?: unknown): Promise<EventEntity | null>;

	findEventsByTitleOrDate(searchString: string, tx?: unknown): Promise<EventEntity[]>;

	getEventsByDateRange(month: GetEventsByDateRangeDTO, tx?: unknown): Promise<EventEntity[]>;

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
	): Promise<EventEntity[]>;

	create(event: EventEntity, tx?: unknown): Promise<Result<void, DatabaseConstraintError>>;

	update(event: EventEntity, tx?: unknown): Promise<Result<void, DatabaseConstraintError>>;

	delete(id: number, tx?: unknown): Promise<void>;
}
