import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { err, ok, Result } from 'neverthrow';
import { Database } from '../../../../db/supabase/supabase.types.js';
import {
	FindCollisionsByDateTimePlaceDTO,
	GetEventsByDateRangeDTO,
} from '../../dto/event.dto.js';
import { EventEntity } from '../../event.entity.js';
import { EventsRepository } from '../../repo/events.repository.js';

export class EventsRepositoryImpl implements EventsRepository {
	constructor(private readonly supabase: SupabaseClient<Database>) {}

	async getMonthEvents(
		dto: GetEventsByDateRangeDTO
	): Promise<Result<EventEntity[], unknown>> {
		const { data, error } = await this.supabase
			.from('events')
			.select('*')
			.gte('date', dto.startDate)
			.lte('date', dto.endDate)
			.order('date', {
				ascending: true,
			})
			.order('start_time', {
				ascending: true,
				nullsFirst: true,
			})
			.order('end_time', {
				ascending: true,
				nullsFirst: true,
			});

		if (error) {
			return err(error);
		}

		try {
			const events = data.map((event) => {
				const res = EventEntity.create({
					id: event.id,
					title: event.title,
					place: event.place,
					organizer: event.organizer,
					startTime: event.start_time,
					endTime: event.end_time,
					createdAt: dayjs(event.created_at).toDate(),
					updatedAt: dayjs(event.updated_at).toDate(),
					date: event.date,
				});

				if (res.isErr()) {
					throw res.error;
				}

				return res.value;
			});

			return ok(events);
		} catch (error) {
			return err(error);
		}
	}

	async create(dto: EventEntity): Promise<Result<void, unknown>> {
		const { error } = await this.supabase.from('events').insert({
			date: dto.date,
			place: dto.place,
			organizer: dto.organizer,
			start_time: dto.startTime,
			end_time: dto.endTime,
			title: dto.title,
		});

		if (error) {
			return err(error);
		}

		return ok(undefined);
	}

	async findCollisionsByDateTimePlace(
		dto: FindCollisionsByDateTimePlaceDTO
	): Promise<Result<EventEntity[], unknown>> {
		let query = this.supabase
			.from('events')
			.select('*')
			.eq('date', dto.date)
			.ilike('place', `%${dto.place}%`)
			.not('start_time', 'is', 'NULL');

		if (!dto.endTime) {
			query = query.or(
				`and(end_time.not.is.null, start_time.lte.${dto.startTime}, end_time.gt.${dto.startTime}), and(end_time.is.null, start_time.eq.${dto.startTime})`
			);
		} else {
			query = query.or(
				`and(end_time.not.is.null, or(and(end_time.gt.${dto.startTime}, start_time.lt.${dto.endTime}), start_time.eq.${dto.startTime}), and(end_time.is.null, start_time.gte.${dto.startTime}, start_time.lt.${dto.endTime}))`
			);
		}
		const { data, error } = await query.limit(1);

		if (error) {
			console.error(error);
			return err(error);
		}

		try {
			const events = data.map((event) => {
				const res = EventEntity.create({
					id: event.id,
					title: event.title,
					place: event.place,
					organizer: event.organizer,
					startTime: event.start_time,
					endTime: event.end_time,
					createdAt: dayjs(event.created_at).toDate(),
					updatedAt: dayjs(event.updated_at).toDate(),
					date: event.date,
				});

				if (res.isErr()) {
					throw res.error;
				}

				return res.value;
			});

			return ok(events);
		} catch (error) {
			return err(error);
		}
	}
}
