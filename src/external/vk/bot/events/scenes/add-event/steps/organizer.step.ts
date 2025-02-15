import { MessageContext } from 'vk-io';

import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { setOgranizerKeyboard } from '../../../keyboards/setOrganizer.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const placeStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
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
		switch (context.messagePayload.command) {
			case 'previous': {
				return await context.scene.step.previous();
			}
			case 'leave': {
				return await context.scene.leave();
			}
			case 'setNoOrganizer': {
				context.scene.state.organizer = null;
				break;
			}
		}
	} else {
		// если ввели текст
		const parsedOrganizer = context.text.trim();
		if (parsedOrganizer.length > 255) {
			return await context.reply(`Слишком длинное имя организатора.`);
		}

		context.scene.state.organizer = parsedOrganizer;
	}

	return await context.scene.step.next();
};
