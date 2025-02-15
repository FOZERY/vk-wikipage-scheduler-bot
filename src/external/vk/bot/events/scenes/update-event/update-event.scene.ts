import { MessageContext } from 'vk-io';
import { eventsController } from '../../../../../../modules/events/index.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EVENT_SCENE_NAMES } from '../../types/events.types.js';
import { findEventStep } from './steps/find-event.step.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from './types.js';

export const updateEventScene = createScene<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
>(EVENT_SCENE_NAMES.updateEvent, [findEventStep], {
	dependencies: {
		eventsController: eventsController,
	},
	leaveHandler: async (context) => {
		return await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	},
});
