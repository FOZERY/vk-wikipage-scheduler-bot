import { MessageContext } from 'vk-io';
import { eventsController } from '../../../../../../modules/events/index.js';
import { mainMenuKeyboard } from '../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../shared/utils/scene-utils.js';
import { EVENT_SCENE_NAMES } from '../../types/events.types.js';
import { findEventStep } from './steps/find-event.step.js';
import { selectFieldStep } from './steps/select-field.step.js';
import { updateDateStep } from './steps/update-date.step.js';
import { updateOrganizerStep } from './steps/update-organizer.step.js';
import { updatePlaceStep } from './steps/update-place.step.js';
import { updateTimeStep } from './steps/update-time.step.js';
import { updateTitleStep } from './steps/update-title.step.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from './types.js';

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
	EVENT_SCENE_NAMES.updateEvent,
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
			eventsController: eventsController,
		},
		leaveHandler: async (context) => {
			return await context.send(mainMenuMessage, {
				keyboard: mainMenuKeyboard,
			});
		},
	}
);
