import { ScheduleRenderer } from '../../../../bot/render/renderService.js';
import { EventEntity } from '../../../../domain/events/event.entity.js';
import { EventsController } from '../../../../domain/events/events.controller.js';

export type DeleteEventSceneState = {
	event: EventEntity;
};

export type DeleteEventSceneDependencies = {
	eventsController: EventsController;
	scheduleRenderer: ScheduleRenderer;
};
