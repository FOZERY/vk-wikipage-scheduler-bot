import { MessageContext } from 'vk-io';

import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { parseTimeString } from '../../../../shared/utils/time-utils.js';
import { setTimeKeyboard } from '../../../keyboards/setTime.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const timeStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`		
Введи время в одном из форматов: 
	
1. ЧЧ:ММ - ЧЧ:ММ 
2. ЧЧ:ММ
3. - (если времени нет) 
			
Либо выбери один из вариантов на клавиатуре.`,
			{ keyboard: setTimeKeyboard }
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
			default: {
				context.scene.state.startTime =
					context.messagePayload.startTime;
				context.scene.state.endTime = context.messagePayload.endTime;
				break;
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
				if (result.error === 'Invalid time type') {
					return await context.reply('Неверный формат времени.');
				} else
					return await context.reply(
						'Время начала события не может быть больше времени окончания.'
					);
			}

			context.scene.state.startTime = result.value.startTimeString;
			context.scene.state.endTime = result.value.endTimeString;
		}
	}

	return await context.scene.step.next();
};
