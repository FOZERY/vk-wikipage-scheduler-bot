import dayjs from "dayjs";
import type { EventEntity } from "../../../../../modules/events/event.entity.js";
import { timeRangeToStringOutput } from "../../../bot/shared/utils/time-utils.js";
import { vkUserApi } from "../../../vk-user-api.js";

export type ScheduleRendererConfig = {
	pageId: number;
	groupId: number;
};

export class ScheduleService {
	constructor(private readonly config: ScheduleRendererConfig) {}

	public async renderSchedule(events: EventEntity[]): Promise<void> {
		const schedule = this.generateSchedule(events);

		await vkUserApi.pages.save({
			text: schedule,
			page_id: this.config.pageId,
			group_id: this.config.groupId,
		});

		return;
	}

	private generateSchedule(events: EventEntity[]): string {
		let newSchedule = events.reduce((acc, event) => {
			return `${acc}|-\n| ${dayjs(event.date).format(
				"DD.MM.YYYY"
			)}\n| ${timeRangeToStringOutput(event.timeRange)}\n| ${
				event.title
			}\n| ${event.place}\n| ${event.organizer ?? "-"}\n`;
		}, "");
		newSchedule = `{|\n${newSchedule}|}`;
		return newSchedule;
	}
}
