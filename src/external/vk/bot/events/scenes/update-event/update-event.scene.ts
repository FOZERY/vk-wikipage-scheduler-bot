import { Logger } from 'pino';
import { MessageContext } from 'vk-io';
import { UpdateEventDTO } from '../../../../../../modules/events/event.dto.js';
import { EventsService } from '../../../../../../modules/events/events.service.js';
import { eventsService } from '../../../../../../modules/events/index.js';
import { logger } from '../../../../../logger/pino.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { ViewEvent } from '../../../shared/types/common.types.js';
import { getContextPartForLogging } from '../../../shared/utils/logger-messages.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EventSceneEnum } from '../../types/events.types.js';
import {
	findEventStep,
	selectFieldStep,
	updateDateStep,
	updateOrganizerStep,
	updatePlaceStep,
	updateTimeStep,
	updateTitleStep,
} from './steps/index.js';

export type UpdateEventSceneState = {
	event: ViewEvent;
};

export type UpdateEventSceneDependencies = {
	eventsService: EventsService;
	logger: Logger;
};

export enum UpdateEventSceneStepNumber {
	FindEvent = 0,
	SelectFieldOrConfirm = 1,
	UpdateDate = 2,
	UpdateTime = 3,
	UpdatePlace = 4,
	UpdateOrganizer = 5,
	UpdateTitle = 6,
}

export const updateEventScene = createScene<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
>(
	EventSceneEnum.updateEvent,
	[
		findEventStep,
		selectFieldStep,
		updateDateStep,
		updateTimeStep,
		updatePlaceStep,
		updateOrganizerStep,
		updateTitleStep,
	],
	{
		dependencies: {
			eventsService: eventsService,
			logger: logger.child({
				scene: 'update-event',
			}),
		},
		leaveHandler: async (context) => {
			context.dependencies.logger.info(
				{
					context: getContextPartForLogging(context),
				},
				`User ${context.senderId} -> left update-event scene`
			);
			return await context.send(mainMenuMessage, {
				keyboard: mainMenuKeyboard,
			});
		},
	}
);
