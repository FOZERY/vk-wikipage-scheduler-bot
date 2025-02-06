import { err, ok } from 'neverthrow';
import { database } from '../index.js';
import { EventModel } from '../models/event.model.js';

export interface CheckEventCollisionPayload {
	date: string;
	time: {
		startTime: string | null;
		endTime: string | null;
	};
	place: string;
}

export function getEventCollisionByDateTimePlace(
	payload: CheckEventCollisionPayload
) {
	try {
		const query = database.prepare(`
		SELECT * FROM events 
		WHERE date = $date
		AND lower(place) LIKE $place
        AND start_time IS NOT NULL
        AND $startTime IS NOT NULL
		AND (
			(
				$endTime IS NULL 
				AND (
					(end_time IS NOT NULL AND start_time <= $startTime AND $startTime < end_time) 
					OR 
					(end_time IS NULL AND start_time = $startTime)
				)
			)
			OR 
			(
				$endTime IS NOT NULL 
				AND (
					(end_time IS NOT NULL AND ($startTime < end_time AND $endTime > start_time OR $startTime = start_time))
					OR
					(end_time IS NULL AND $startTime <= start_time AND $endTime > start_time)
				)
			)
		)
		LIMIT 1`);

		const placeFormatted = `%${payload.place.toLowerCase()}%`;

		const events = query.all({
			$date: payload.date,
			$startTime: payload.time.startTime,
			$endTime: payload.time.endTime,
			$place: placeFormatted,
		}) as EventModel[];
		return ok(events);
	} catch (error) {
		return err(error);
	}
}
