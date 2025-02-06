import { mainMenuKeyboard } from '../../../../../common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../common/messages/mainMenuMessage.js';
import { createSceneStep } from '../../../../../utils/createSceneStep.js';
import { parseTimeString } from '../../../../../utils/parseTimeString.js';
import { setTimeKeyboard } from '../../../keyboards/setTimeKeyboard.js';
import { SceneCreateEventState } from '../index.js';

export const timeStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
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
			return await context.reply(
				`Разрешено вводить только текст, либо пользоваться клавиатурой.`
			);
		}

		if (context.hasMessagePayload) {
			switch (context.messagePayload.command) {
				case 'leave': {
					// TODO: прикрепить клаву сюды
					context.scene.leave();
					return await context.send(mainMenuMessage, {
						keyboard: mainMenuKeyboard,
					});
				}
				case 'previous': {
					return await context.scene.step.previous();
				}
				default: {
					context.scene.state.time = context.messagePayload.time;
					break;
				}
			}
		} else {
			const trimmedText = context.text.trim();

			if (trimmedText === '-') {
				context.scene.state.time = {
					startTime: null,
					endTime: null,
				};
			} else {
				const result = parseTimeString(trimmedText);
				console.log(result);
				if (result.isErr()) {
					return await context.reply('Неверный формат времени');
				}
				context.scene.state.time = {
					startTime: result.value.startTimeString,
					endTime: result.value.endTimeString,
				};
			}
		}

		return await context.scene.step.next();
	}
);
