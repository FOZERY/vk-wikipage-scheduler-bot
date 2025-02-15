import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { convertRussianDateStringToDefaultFormat } from '../../../../shared/utils/date-utils.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import {
	setDateKeyboard,
	SetDateKeyboardCommand,
	SetDateKeyboardPayload,
} from '../../../keyboards/setDate.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const updateDateStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`Введи дату в формате ДД.ММ.ГГГГ или выбери один из вариантов на клавиатуре.`,
			{ keyboard: setDateKeyboard }
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		switch (context.messagePayload.command) {
			case SetDateKeyboardCommand.Leave: {
				return await context.scene.leave();
			}
			case SetDateKeyboardCommand.SetDate: {
				const payload =
					context.messagePayload as SetDateKeyboardPayload;
				context.scene.state.event.date = payload.date;
				break;
			}
		}
	} else {
		// если ввели текст
		const trimmedText = context.text.trim();
		const result = convertRussianDateStringToDefaultFormat(trimmedText);
		if (result.isErr()) {
			return await context.reply('Неправильный формат даты.');
		}

		context.scene.state.event.date = result.value;
	}

	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
