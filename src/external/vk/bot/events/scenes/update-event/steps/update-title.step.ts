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
	setTitleKeyboard,
	SetTitleKeyboardPayload,
	SetTitleKeyboardPayloadCommand,
} from '../../../keyboards/setTitle.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const updateTitleStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(`Введи название события`, {
			keyboard: setTitleKeyboard,
		});
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		const payload = context.messagePayload as SetTitleKeyboardPayload;
		switch (payload.command) {
			case SetTitleKeyboardPayloadCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SetTitleKeyboardPayloadCommand.Leave: {
				return await context.scene.leave();
			}
		}
	} else {
		// если ввели текст
		const parsedTitle = context.text.trim();
		if (parsedTitle.length > 255) {
			return await context.reply(`Слишком длинное название для события`);
		}

		context.scene.state.event.title = parsedTitle;
	}

	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
