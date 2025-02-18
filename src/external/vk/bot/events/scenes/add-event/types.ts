import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Logger } from 'pino';
import { EventsController } from '../../../../../../modules/events/events.controller.js';

export type AddEventSceneState = {
	date: string; // YYYY-MM-DD in local
	startTime: string | null; // HH:mm:ss
	endTime: string | null; // HH:mm:ss
	place: string;
	organizer: string | null;
	title: string;
};

export type AddEventSceneDependencies = {
	eventsController: EventsController;
	db: PostgresJsDatabase;
	logger: Logger;
};
