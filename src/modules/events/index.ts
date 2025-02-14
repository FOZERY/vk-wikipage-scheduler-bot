import { db } from '../../external/db/drizzle/index.js';
import { ScheduleRenderer } from '../../external/vk/api/wiki/schedule/schedule-renderer.js';
import { EventsController } from './events.controller.js';
import { EventsRepositoryImpl } from './external/db/drizzle/events.repository.impl.js';

const eventsRepository = new EventsRepositoryImpl(db);

const scheduleRenderer = new ScheduleRenderer({
	groupId: Number(process.env.GROUP_ID),
	pageId: Number(process.env.PAGE_ID),
});

export const eventsController = new EventsController(
	scheduleRenderer,
	eventsRepository,
	db
);
