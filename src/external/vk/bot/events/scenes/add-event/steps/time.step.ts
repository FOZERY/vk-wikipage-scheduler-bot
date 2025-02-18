import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { parseTimeString } from '../../../../shared/utils/time-utils.js';
import { getTimeKeyboard } from '../../../keyboards/time.keyboard.js';
import {
	AddEventSceneDependencies,
	AddEventSceneState,
} from '../add-event.scene.js';

export const timeStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered time scene step`,
			'info'
		);
		return await context.send(
			`		
Введи время в одном из форматов: 
	
1. ЧЧ:ММ - ЧЧ:ММ 
2. ЧЧ:ММ
3. - (если времени нет) 
			
Либо выбери один из вариантов на клавиатуре.
`,
			{
				keyboard: attachTextButtonToKeyboard(getTimeKeyboard(), [
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
		switch (context.messagePayload.command) {
			case 'leave': {
				return await context.scene.leave();
			}
			case 'previous': {
				return await context.scene.step.previous();
			}
			case 'setTime': {
				context.scene.state.startTime =
					context.messagePayload.startTime;
				context.scene.state.endTime = context.messagePayload.endTime;
				break;
			}
			default: {
				logStep(
					context,
					`Unknown command: ${context.messagePayload.command}`,
					'error'
				);
				throw new Error(
					`Unknown command: ${context.messagePayload.command}`
				);
			}
		}
	} else {
		const trimmedText = context.text.trim();

		if (trimmedText === '-') {
			context.scene.state.startTime = null;
			context.scene.state.endTime = null;
		} else {
			const result = parseTimeString(trimmedText);

			if (result.isErr()) {
				logStep(
					context,
					`User ${context.senderId} -> entered invalid time`,
					'warn',
					result.error
				);
				return await context.reply('Неверный формат времени.');
			}

			context.scene.state.startTime = result.value.startTimeString;
			context.scene.state.endTime = result.value.endTimeString;
		}
	}

	logStep(context, `User ${context.senderId} -> passed time step`, 'info');
	return await context.scene.step.next();
};
