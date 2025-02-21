import { Nullable } from '../../shared/types/common.types.js';

export interface FindCollisionsByDateTimePlaceDTO {
	date: string;
	timeRange: Nullable<{ startTime: string; endTime: string | null }>;
	place: string;
	excludeId?: number;
}

export interface CreateEventDTO {
	date: string;
	place: string;
	title: string;
	timeRange: Nullable<{
		startTime: string;
		endTime: Nullable<string>;
	}>;
	organizer: string | null;
	lastUpdaterId: number;
}

export interface GetEventsByDateRangeDTO {
	startDate: string;
	endDate?: string;
}

export interface UpdateEventDTO {
	id: number;
	date: string;
	place: string;
	title: string;
	timeRange: Nullable<{
		startTime: string;
		endTime: Nullable<string>;
	}>;
	organizer: string | null;
	lastUpdaterId: number;
}
