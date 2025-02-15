import { UpdateEventDTO } from '../../../../../../modules/events/event.dto.js';
import { EventsController } from '../../../../../../modules/events/events.controller.js';

export type UpdateEventSceneState = {
	event: UpdateEventDTO;
};

export type UpdateEventSceneDependencies = {
	eventsController: EventsController;
};
