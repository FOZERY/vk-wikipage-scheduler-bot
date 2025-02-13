import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';
import { EventEntity } from '../../domain/events/event.entity.js';
import { vkUserApi } from '../../index.js';
import { timeRangeToStringOutput } from '../../shared/utils/time-utils.js';

export class ScheduleRenderer {
	constructor(private readonly pageId: number) {}

	private generateSchedule(events: EventEntity[]): string {
		let newSchedule = events.reduce((acc, event) => {
			return `${acc}|-\n| ${dayjs(event.date).format(
				'DD.MM.YYYY'
			)}\n| ${timeRangeToStringOutput(
				event.startTime,
				event.endTime
			)}\n| ${event.title}\n| ${event.place}\n| ${
				event.organizer ?? 'Не указано'
			}\n`;
		}, '');
		newSchedule = `{|\n${newSchedule}|}`;
		return newSchedule;
	}

	public async renderSchedule(events: EventEntity[]) {
		try {
			const schedule = this.generateSchedule(events);

			await vkUserApi.pages.save({
				text: schedule,
				page_id: this.pageId,
				group_id: 224730953,
			});

			return ok(undefined);
		} catch (error) {
			return err(error);
		}
	}
}
