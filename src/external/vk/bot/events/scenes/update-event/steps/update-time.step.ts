import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { convertRussianDateStringToDefaultFormat } from '../../../../shared/utils/date-utils.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { parseTimeString } from '../../../../shared/utils/time-utils.js';
import {
	setDateKeyboard,
	SetDateKeyboardCommand,
	SetDateKeyboardPayload,
} from '../../../keyboards/setDate.keyboard.js';
import {
	setTimeKeyboard,
	SetTimeKeyboardPayload,
	SetTimeKeyboardPayloadCommand,
} from '../../../keyboards/setTime.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const updateTimeStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
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
		const payload = context.messagePayload as SetTimeKeyboardPayload;
		switch (payload.command) {
			case SetTimeKeyboardPayloadCommand.Leave: {
				return await context.scene.leave();
			}
			case SetTimeKeyboardPayloadCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SetTimeKeyboardPayloadCommand.SetTime: {
				context.scene.state.event.startTime = payload.startTime;
				context.scene.state.event.endTime = payload.endTime;
				break;
			}
		}
	} else {
		const trimmedText = context.text.trim();

		if (trimmedText === '-') {
			context.scene.state.event.startTime = null;
			context.scene.state.event.endTime = null;
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

			context.scene.state.event.startTime = result.value.startTimeString;
			context.scene.state.event.endTime = result.value.endTimeString;
		}
	}

	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
