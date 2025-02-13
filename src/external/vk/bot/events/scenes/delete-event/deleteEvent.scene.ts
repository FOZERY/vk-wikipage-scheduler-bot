import { MessageContext } from 'vk-io';
import { EventsController } from '../../../../../../modules/events/events.controller.js';
import { eventsController } from '../../../../../../modules/events/export.js';
import { EventsRepositoryImpl } from '../../../../../../modules/events/external/db/drizzle/events.repository.impl.js';
import { db } from '../../../../../db/drizzle/index.js';
import { scheduleRenderer } from '../../../../schedule/index.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EVENT_SCENE_NAMES } from '../../types/events.types.js';
import { confirmStep } from './steps/confirm.step.js';
import { findEventStep } from './steps/findEvent.step.js';
import {
	DeleteEventSceneDependencies,
	DeleteEventSceneState,
} from './types.js';

export const deleteEventScene = createScene<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
>(EVENT_SCENE_NAMES.deleteEvent, [findEventStep, confirmStep], {
	dependencies: {
		eventsController: eventsController,
		scheduleRenderer: scheduleRenderer,
	},
	leaveHandler: async (context) => {
		return await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	},
});
