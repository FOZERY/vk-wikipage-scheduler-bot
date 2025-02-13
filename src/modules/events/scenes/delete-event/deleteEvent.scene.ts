import { MessageContext } from 'vk-io';
import { db } from '../../../../db/drizzle/index.js';
import { EventsController } from '../../../../domain/events/events.controller.js';
import { EventsRepositoryImpl } from '../../../../domain/events/infra/drizzle/events.repository.impl.js';
import { mainMenuKeyboard } from '../../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../../shared/utils/scene-utils.js';
import { EVENT_SCENE_NAMES } from '../../types/events.types.js';
import { confirmStep } from './steps/confirm.step.js';
import { findEventStep } from './steps/findEvent.step.js';
import {
	DeleteEventSceneDependencies,
	DeleteEventSceneState,
} from './types.js';
import { ScheduleRenderer } from '../../../../bot/render/renderService.js';
import { eventsController } from '../../../../domain/events/export.js';

export const deleteEventScene = createScene<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
>(EVENT_SCENE_NAMES.deleteEvent, [findEventStep, confirmStep], {
	dependencies: {	
		eventsController: eventsController,	
		scheduleRenderer: new ScheduleRenderer();
	},
	leaveHandler: async (context) => {
		return await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	},
});
