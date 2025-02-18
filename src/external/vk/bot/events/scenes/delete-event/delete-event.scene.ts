import { MessageContext } from 'vk-io';
import { eventsController } from '../../../../../../modules/events/index.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EventSceneEnum } from '../../types/events.types.js';
import { confirmStep } from './steps/confirm.step.js';
import { findEventStep } from './steps/find-event.step.js';
import {
	DeleteEventSceneDependencies,
	DeleteEventSceneState,
} from './types.js';

export const deleteEventScene = createScene<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
>(EventSceneEnum.deleteEvent, [findEventStep, confirmStep], {
	dependencies: {
		eventsController: eventsController,
	},
	leaveHandler: async (context) => {
		return await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	},
});
