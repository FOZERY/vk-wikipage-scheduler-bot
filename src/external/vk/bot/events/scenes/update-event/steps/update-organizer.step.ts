import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import {
	setOgranizerKeyboard,
	SetOrganizerKeyboardPayload,
	SetOrganizerKeyboardPayloadCommand,
} from '../../../keyboards/setOrganizer.keyboard.js';
import { SetPlaceKeyboardPayload } from '../../../keyboards/setPlace.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const updateOrganizerStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(`Введи имя организатора.`, {
			keyboard: setOgranizerKeyboard,
		});
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		const payload = context.messagePayload as SetOrganizerKeyboardPayload;
		switch (payload.command) {
			case SetOrganizerKeyboardPayloadCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SetOrganizerKeyboardPayloadCommand.Leave: {
				return await context.scene.leave();
			}
			case SetOrganizerKeyboardPayloadCommand.SetNoOrganizer: {
				context.scene.state.event.organizer = null;
				break;
			}
		}
	} else {
		// если ввели текст
		const parsedOrganizer = context.text.trim();
		if (parsedOrganizer.length > 255) {
			return await context.reply(`Слишком длинное имя организатора.`);
		}

		context.scene.state.event.organizer = parsedOrganizer;
	}

	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
