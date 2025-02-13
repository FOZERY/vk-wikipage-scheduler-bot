import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import { setTitleKeyboard } from '../../../keyboards/setTitle.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const titleStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
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
		switch (context.messagePayload.command) {
			case 'previous': {
				return await context.scene.step.previous();
			}
			case 'leave': {
				return await context.scene.leave();
			}
		}
	} else {
		// если ввели текст
		const parsedTitle = context.text.trim();
		if (parsedTitle.length > 255) {
			return await context.reply(`Слишком длинное название для события`);
		}

		context.scene.state.title = parsedTitle;
	}

	return await context.scene.step.next();
};
