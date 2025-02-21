import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import {
	attachTextButtonToKeyboard,
	previousButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { parseTimeString } from '../../../../shared/utils/time-utils.js';
import { getTimeKeyboard } from '../../../keyboards/time.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
	UpdateEventSceneStepNumber,
} from '../update-event.scene.js';

export const updateTimeStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered update-time step`,
			'info'
		);

		return await context.send(
			`		
Введи время в одном из форматов: 
		
1. ЧЧ:ММ - ЧЧ:ММ 
2. ЧЧ:ММ
				
Либо выбери один из вариантов на клавиатуре.`,
			{
				keyboard: attachTextButtonToKeyboard(getTimeKeyboard(), [
					previousButtonOptions,
				]),
			}
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		const payload = context.messagePayload;
		switch (payload.command) {
			case 'previous': {
				return await context.scene.step.go(
					UpdateEventSceneStepNumber.SelectFieldOrConfirm
				);
			}
			case 'setTime': {
				context.scene.state.event.timeRange = payload.timeRange;
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

		context.scene.state.event.timeRange = {
			startTime: result.value.startTimeString,
			endTime: result.value.endTimeString,
		};
	}

	logStep(
		context,
		`User ${context.senderId} -> passed update-time step`,
		'info'
	);
	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
