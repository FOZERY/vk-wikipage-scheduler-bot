import dayjs from 'dayjs';
import { parseDateString } from '../../../../../utils/parseDateString.js';
import { createSceneStep } from '../../../../../utils/utils.js';
import { setDateKeyboard } from '../../../keyboards/setDateKeyboard.js';
import { SceneCreateEventState } from '../index.js';

export const dateStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
		if (context.scene.step.firstTime) {
			return await context.send(
				`Введи дату в формате ДД.ММ.ГГГГ или выбери один из вариантов на клавиатуре.`,
				{ keyboard: setDateKeyboard }
			);
		}

		if (!context.text) {
			return await context.reply(
				`Разрешено вводить только текст, либо пользоваться клавиатурой.`
			);
		}

		if (context.hasMessagePayload) {
			switch (context.messagePayload.command) {
				case 'quit': {
					return await context.scene.leave();
				}
				default: {
					context.scene.state.date = context.messagePayload.date;
					break;
				}
			}
		} else {
			const trimmedText = context.text.trim();
			const result = parseDateString(trimmedText);
			if (result.isErr()) {
				return await context.reply('Неправильный формат даты.');
			}

			context.scene.state.date = result.value;
		}

		return await context.scene.step.next();
	}
);
