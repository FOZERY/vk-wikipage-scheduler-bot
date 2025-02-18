import { Logger } from 'pino';
import { MessageContext } from 'vk-io';
import { EventEntity } from '../../../../../../modules/events/event.entity.js';
import { EventsController } from '../../../../../../modules/events/events.controller.js';
import { eventsController } from '../../../../../../modules/events/index.js';
import { logger } from '../../../../../logger/pino.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { getContextPartForLogging } from '../../../shared/utils/logger-messages.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EventSceneEnum } from '../../types/events.types.js';
import { confirmStep, findEventStep } from './steps/index.js';

export type DeleteEventSceneState = {
	event: EventEntity;
};

export type DeleteEventSceneDependencies = {
	eventsController: EventsController;
	logger: Logger;
};

export const deleteEventScene = createScene<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
>(EventSceneEnum.deleteEvent, [findEventStep, confirmStep], {
	dependencies: {
		eventsController: eventsController,
		logger: logger.child({
			scene: 'delete-event',
		}),
	},
	leaveHandler: async (context) => {
		context.dependencies.logger.info(
			{
				context: getContextPartForLogging(context),
			},
			`User ${context.senderId} -> left delete-event scene`
		);
		return await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	},
});
