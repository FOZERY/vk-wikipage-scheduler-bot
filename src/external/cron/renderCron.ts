import { CronJob } from "cron";
import type { EventsService } from "../../modules/events/events.service.js";
import { logger } from "../logger/pino.js";

const clogger = logger.child({
	context: "schedule-cron",
});

export function getScheduleCronJob(eventsService: EventsService) {
	return CronJob.from({
		cronTime: "0 0 * * *",
		onTick: async () => {
			await eventsService.renderScheduleFromCurrentMonth();

			clogger.info("schedule-cron job -> executed");
		},
		timeZone: "Europe/Moscow",
		unrefTimeout: true,
		waitForCompletion: true,
		errorHandler: (error) => {
			clogger.error(error);
		},
	});
}
