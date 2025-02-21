import { Logger } from 'pino';
import { MessageContext } from 'vk-io';
import { EventsService } from '../../../../../../modules/events/events.service.js';
import { eventsService } from '../../../../../../modules/events/index.js';
import { logger } from '../../../../../logger/pino.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { ViewEvent } from '../../../shared/types/common.types.js';
import { getContextPartForLogging } from '../../../shared/utils/logger-messages.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EventSceneEnum } from '../../types/events.types.js';
import { confirmStep, findEventStep } from './steps/index.js';

export type DeleteEventSceneState = {
	event: ViewEvent;
};

export type DeleteEventSceneDependencies = {
	eventsService: EventsService;
	logger: Logger;
};

export const deleteEventScene = createScene<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
>(EventSceneEnum.deleteEvent, [findEventStep, confirmStep], {
	dependencies: {
		eventsService: eventsService,
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
