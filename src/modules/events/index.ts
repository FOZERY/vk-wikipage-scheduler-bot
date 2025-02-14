import { db } from '../../external/db/drizzle/index.js';
import { EventsController } from './events.controller.js';
import { EventsRepositoryImpl } from './external/db/drizzle/events.repository.impl.js';

export const eventsRepository = new EventsRepositoryImpl(db);

export const eventsController = new EventsController(eventsRepository, db);
