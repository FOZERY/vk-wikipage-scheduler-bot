import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { getPlaceKeyboard } from '../../../keyboards/place.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const updatePlaceStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`Введи название места события или выбери с клавиатуры.`,
			{ keyboard: getPlaceKeyboard() }
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		const payload = context.messagePayload as SetPlaceKeyboardPayload;
		switch (payload.command) {
			case SetPlaceKeyboardPayloadCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SetPlaceKeyboardPayloadCommand.Leave: {
				return await context.scene.leave();
			}
			case SetPlaceKeyboardPayloadCommand.SetPlace: {
				context.scene.state.event.place = payload.place;
			}
		}
	} else {
		// если ввели текст
		const parsedText = context.text.trim();
		if (parsedText.length > 255) {
			return await context.reply('Слишком длинное название места.');
		}

		context.scene.state.event.place = parsedText;
	}

	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
