import { Keyboard, MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const titleStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered title scene step`,
			'info'
		);
		return await context.send(
			`
Введи название события

/previous - назад
/leave - отмена`,
			{
				keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
					previousButtonOptions,
					leaveButtonOptions,
				]),
			}
		);
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
			default: {
				logStep(context, 'Unknown command', 'error');
				throw new Error('Unknown command');
			}
		}
	} else {
		// если ввели текст
		const parsedTitle = context.text.trim();

		if (parsedTitle === '/previous') {
			return await context.scene.step.previous();
		}

		if (parsedTitle === '/leave') {
			return await context.scene.leave();
		}

		if (parsedTitle.length > 255) {
			logStep(
				context,
				`User ${context.senderId} -> too long (>255) title`,
				'info'
			);
			return await context.reply(`Слишком длинное название для события`);
		}

		context.scene.state.title = parsedTitle;
	}

	logStep(context, `User ${context.senderId} -> passed title step`, 'info');
	return await context.scene.step.next();
};
