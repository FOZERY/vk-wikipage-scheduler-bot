import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { convertRussianDateStringToDefaultFormat } from '../../../../shared/utils/date-utils.js';
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { getDateKeyboard } from '../../../keyboards/date.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const dateStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered date scene step`,
			'info'
		);
		return await context.send(
			`
Введи дату в формате ДД.ММ.ГГГГ или выбери один из вариантов на клавиатуре.

/leave - отмена
			`,
			{
				keyboard: attachTextButtonToKeyboard(
					getDateKeyboard(),
					leaveButtonOptions
				),
			}
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		switch (context.messagePayload.command) {
			case 'leave': {
				return await context.scene.leave();
			}
			case 'setDate': {
				context.scene.state.date = context.messagePayload.date;
				break;
			}
			default: {
				logStep(context, 'Unknown command in date step', 'error');
				throw new Error('Unknown command');
			}
		}
	} else {
		// если ввели текст
		const trimmedText = context.text.trim();

		if (trimmedText.toLowerCase() === '/leave') {
			return await context.scene.leave();
		}

		const result = convertRussianDateStringToDefaultFormat(trimmedText);
		if (result.isErr()) {
			logStep(
				context,
				`User ${context.senderId} -> entered invalid date`,
				'warn',
				result.error
			);
			return await context.reply('Неправильный формат даты.');
		}

		context.scene.state.date = result.value;
	}

	logStep(context, `User ${context.senderId} -> passed date step`, 'info');
	return await context.scene.step.next();
};
