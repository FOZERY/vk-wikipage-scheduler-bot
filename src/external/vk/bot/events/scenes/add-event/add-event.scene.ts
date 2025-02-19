import { Logger } from 'pino';
import { MessageContext } from 'vk-io';
import { EventsService } from '../../../../../../modules/events/events.service.js';
import { eventsService } from '../../../../../../modules/events/index.js';
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

export type AddEventSceneState = {
	date: string; // YYYY-MM-DD in local
	startTime: string | null; // HH:mm:ss
	endTime: string | null; // HH:mm:ss
	place: string;
	organizer: string | null;
	title: string;
	creatorId: string;
};

export type AddEventSceneDependencies = {
	eventsService: EventsService;
	logger: Logger;
};

export const addEventScene = createScene<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
>(
	EventSceneEnum.addEvent,
	[dateStep, timeStep, organizerStep, titleStep, placeStep, confirmStep],
	{
		dependencies: {
			eventsService: eventsService,
			logger: logger.child({
				scene: 'add-event',
			}),
		},
		leaveHandler: async (context) => {
			context.dependencies.logger.info(
				{
					context: getContextPartForLogging(context),
				},
				`User ${context.senderId} -> left add-event scene`
			);
			return await context.send(mainMenuMessage, {
				keyboard: mainMenuKeyboard,
			});
		},
	}
);
