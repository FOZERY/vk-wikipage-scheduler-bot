export interface FindCollisionsByDateTimePlaceDTO {
	date: string;
	startTime: string | null;
	endTime: string | null;
	place: string;
}

export interface CreateEventDTO {
	date: string;
	place: string;
	title: string;
	startTime: string | null;
	endTime: string | null;
	organizer: string | null;
}

export interface GetEventsByDateRangeDTO {
	startDate: string;
	endDate: string;
}

export interface UpdateEventDTO {
	id: string;
	date: string;
	place: string;
	title: string;
	startTime: string | null;
	endTime: string | null;
	organizer: string | null;
}
