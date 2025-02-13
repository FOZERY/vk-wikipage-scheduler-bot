import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { convertRussianDateStringToDefaultFormat } from '../../../../../shared/utils/date-utils.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import { setDateKeyboard } from '../../../keyboards/setDate.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const dateStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
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
			case 'leave': {
				return await context.scene.leave();
			}
			default: {
				context.scene.state.date = context.messagePayload.date;
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

		context.scene.state.date = result.value;
	}

	return await context.scene.step.next();
};
