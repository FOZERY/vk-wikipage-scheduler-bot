import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import {
	attachTextButtonToKeyboard,
	previousButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { getPlaceKeyboard } from '../../../keyboards/place.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
	UpdateEventSceneStepNumber,
} from '../update-event.scene.js';

export const updatePlaceStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered update-place step`,
			'info'
		);

		return await context.send(
			`Введи название места события или выбери с клавиатуры.`,
			{
				keyboard: attachTextButtonToKeyboard(getPlaceKeyboard(), [
					previousButtonOptions,
				]),
			}
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		const payload = context.messagePayload;
		switch (payload.command) {
			case 'previous': {
				return await context.scene.step.go(
					UpdateEventSceneStepNumber.SelectFieldOrConfirm
				);
			}
			case 'setPlace': {
				context.scene.state.event.place = payload.place;
				break;
			}
			default: {
				logStep(
					context,
					`Unknown command: ${payload.command}`,
					'error'
				);
				throw new Error('Unknown command');
			}
		}
	} else {
		// если ввели текст
		const parsedText = context.text.trim();
		if (parsedText.length > 255) {
			logStep(
				context,
				`User ${context.senderId} -> too long (>255) place name - ${parsedText}`,
				'info'
			);
			return await context.reply('Слишком длинное название места.');
		}

		context.scene.state.event.place = parsedText;
	}

	logStep(
		context,
		`User ${context.senderId} -> passed update-place step`,
		'info'
	);
	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
