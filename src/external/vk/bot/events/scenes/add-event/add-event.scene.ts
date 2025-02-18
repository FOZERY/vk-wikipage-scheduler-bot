import { MessageContext } from 'vk-io';
import { eventsController } from '../../../../../../modules/events/index.js';
import { db } from '../../../../../db/drizzle/index.js';
import { logger } from '../../../../../logger/pino.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { getContextPartForLogging } from '../../../shared/utils/logger-messages.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EventSceneEnum } from '../../types/events.types.js';
import {
	confirmStep,
	dateStep,
	organizerStep,
	placeStep,
	timeStep,
	titleStep,
} from './steps/index.js';
import { AddEventSceneDependencies, AddEventSceneState } from './types.js';

export const addEventScene = createScene<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
>(
	EventSceneEnum.addEvent,
	[dateStep, timeStep, organizerStep, titleStep, placeStep, confirmStep],
	{
		dependencies: {
			eventsController: eventsController,
			db: db,
			logger: logger.child({
				scene: 'add-event',
			}),
		},
		leaveHandler: async (context) => {
			context.dependencies.logger.info(
				{
					context: getContextPartForLogging(context),
				},
				'LEAVE ADD_EVENT SCENE'
			);
			return await context.send(mainMenuMessage, {
				keyboard: mainMenuKeyboard,
			});
		},
	}
);
