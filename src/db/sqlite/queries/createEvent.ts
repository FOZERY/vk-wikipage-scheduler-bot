import { err, ok, Result } from 'neverthrow';
import { database } from '../index.js';
export interface CreateEventDTO {
	title: string;
	date: string;
	startTime: string | null;
	endTime: string | null;
	organizer: string | null;
	place: string;
}

export function createEvent(event: CreateEventDTO): Result<void, unknown> {
	try {
		const query = database.prepare(
			'INSERT INTO events(title, date, start_time, end_time, organizer, place) VALUES($title, $date, $startTime, $endTime, $organizer, $place)'
		);

		query.run({
			$title: event.title,
			$date: event.date,
			$startTime: event.startTime,
			$endTime: event.endTime,
			$place: event.place,
			$organizer: event.organizer,
		});
		return ok(undefined);
	} catch (error) {
		return err(error);
	}
}
