import { mainMenuKeyboard } from '../../../../../common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../common/messages/mainMenuMessage.js';
import { createSceneStep } from '../../../../../utils/createSceneStep.js';
import { setOgranizerKeyboard } from '../../../keyboards/setOrganizerKeyboard.js';
import { SceneCreateEventState } from '../index.js';

export const organizerStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
		if (context.scene.step.firstTime) {
			return await context.send(`Введи имя организатора`, {
				keyboard: setOgranizerKeyboard,
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
			const parsedOrganizer = context.text.trim();
			if (parsedOrganizer.length > 255) {
				return await context.reply(`Слишком длинное имя организатора`);
			}

			context.scene.state.organizer = parsedOrganizer;
		}

		return await context.scene.step.next();
	}
);
