import { EventEntity } from '../../../../../../modules/events/event.entity.js';
import { EventsController } from '../../../../../../modules/events/events.controller.js';
import { ScheduleRenderer } from '../../../../api/wiki/schedule/schedule-renderer.js';

export type DeleteEventSceneState = {
	event: EventEntity;
};

export type DeleteEventSceneDependencies = {
	eventsController: EventsController;
};
