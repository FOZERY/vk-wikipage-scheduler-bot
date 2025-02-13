import { MessageContext } from 'vk-io';
import { ScheduleRenderer } from '../../../../bot/render/renderService.js';
import { db } from '../../../../db/drizzle/index.js';
import { eventsController } from '../../../../domain/events/export.js';
import { mainMenuKeyboard } from '../../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../../shared/messages/mainMenu.message.js';
import { createScene } from '../../../../shared/utils/scene-utils.js';
import { EVENT_SCENE_NAMES } from '../../types/events.types.js';
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
	EVENT_SCENE_NAMES.addEvent,
	[dateStep, timeStep, organizerStep, titleStep, placeStep, confirmStep],
	{
		dependencies: {
			eventsController: eventsController,
			db: db,
			scheduleRenderer: new ScheduleRenderer(Number(process.env.PAGE_ID)),
		},
		leaveHandler: async (context) => {
			return await context.send(mainMenuMessage, {
				keyboard: mainMenuKeyboard,
			});
		},
	}
);
