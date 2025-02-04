import { parseTimeString } from '../../../../../utils/parseTimeString.js';
import {
	createSceneStep,
	isKeyboardAction,
} from '../../../../../utils/utils.js';
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

		if (isKeyboardAction(context)) {
			switch (context.messagePayload.command) {
				case 'quit': {
					// TODO: прикрепить клаву сюды
					return await context.scene.leave();
				}
				case 'back': {
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
				if (result.isErr()) {
					return await context.reply('Неверный формат времени');
				}
				context.scene.state.time = {
					startTime: result.value.startTime,
					endTime: result.value.endTime,
				};
			}
		}

		console.log(context.scene.state);

		return await context.scene.step.next();
	}
);
