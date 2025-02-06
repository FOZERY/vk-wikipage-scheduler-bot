import { mainMenuKeyboard } from '../../../../../common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../common/messages/mainMenuMessage.js';
import { createSceneStep } from '../../../../../utils/createSceneStep.js';
import { setTitleKeyboard } from '../../../keyboards/setTitleKeyboard.js';
import { SceneCreateEventState } from '../index.js';

export const titleStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
		if (context.scene.step.firstTime) {
			return await context.send(`Введи название события`, {
				keyboard: setTitleKeyboard,
			});
		}

		if (!context.text) {
			return await context.reply(
				`Разрешено вводить только текст, либо пользоваться клавиатурой.`
			);
		}

		if (context.hasMessagePayload) {
			// если ввели с клавиатуры
			switch (context.messagePayload.command) {
				case 'previous': {
					return await context.scene.step.previous();
				}
				case 'leave': {
					await context.scene.leave();
					return await context.send(mainMenuMessage, {
						keyboard: mainMenuKeyboard,
					});
				}
				default: {
					break;
				}
			}
		} else {
			// если ввели текст
			const parsedTitle = context.text.trim();
			if (parsedTitle.length > 255) {
				return await context.reply(
					`Слишком длинное название для события`
				);
			}

			context.scene.state.title = parsedTitle;
		}

		return await context.scene.step.next();
	}
);
