import { db } from "../../external/db/drizzle/index.js";
import { ScheduleService } from "../../external/vk/api/wiki/schedule/schedule-service.js";
import { EventsService } from "./events.service.js";
import { EventsRepositoryImpl } from "./external/db/drizzle/events.repository.impl.js";

const eventsRepository = new EventsRepositoryImpl(db);

const scheduleRenderer = new ScheduleService({
	groupId: Number(process.env.GROUP_ID),
	pageId: Number(process.env.PAGE_ID),
});

export const eventsService = new EventsService(
	scheduleRenderer,
	eventsRepository,
	db
);
