import { db } from '../../db/drizzle/index.js';
import { EventsController } from './events.controller.js';
import { EventsRepositoryImpl } from './infra/drizzle/events.repository.impl.js';

export const eventsRepository = new EventsRepositoryImpl(db);

export const eventsController = new EventsController(eventsRepository, db);
