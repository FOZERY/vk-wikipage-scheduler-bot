export interface EventModel {
	id?: number;
	title: string;
	date: string;
	place: string;
	start_time: string | null;
	end_time: string | null;
	organizer: string | null;
	created_at: number;
	updated_at: number;
}
