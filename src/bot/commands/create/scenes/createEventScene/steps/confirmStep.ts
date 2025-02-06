import dayjs from 'dayjs';
import { createEvent } from '../../../../../../db/sqlite/queries/createEvent.js';
import { supabase } from '../../../../../../index.js';
import { mainMenuKeyboard } from '../../../../../common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../common/messages/mainMenuMessage.js';
import { createSceneStep } from '../../../../../utils/createSceneStep.js';
import { confirmKeyboard } from '../../../keyboards/confirmKeyboard.js';
import { SceneCreateEventState } from '../index.js';

const formatTime = (startTime: string | null, endTime: string | null) => {
	if (!startTime && !endTime) {
		return 'Не указано';
	}

	if (startTime && !endTime) {
		return startTime;
	}

	return `${startTime} - ${endTime}`;
};

export const confirmStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
		if (context.scene.step.firstTime) {
			return await context.send(
				`
Событие, которое вы хотите создать: 	
Дата: ${dayjs(context.scene.state.date).tz().format('DD.MM.YYYY')}
Время: ${formatTime(
					context.scene.state.time.startTime,
					context.scene.state.time.endTime
				)}			
Место: ${context.scene.state.place}
Название: ${context.scene.state.title}
Организатор: ${context.scene.state.organizer}		
				`,
				{
					keyboard: confirmKeyboard,
				}
			);
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
				case 'confirm': {
					const { error, data } = await supabase
						.from('events')
						.insert({
							date: dayjs(context.scene.state.date)
								.tz()
								.format('YYYY-MM-DD'),
							place: context.scene.state.place,
							start_time: context.scene.state.time.startTime,
							end_time: context.scene.state.time.endTime,
							organizer: context.scene.state.organizer,
							title: context.scene.state.title,
						});
					if (error) {
						console.error(error);
						await context.send('Ошибка базы данных');
					}

					await context.send('Событие успешно создано');
					await context.scene.leave();
					return await context.send(mainMenuMessage, {
						keyboard: mainMenuKeyboard,
					});
				}
				case 'restartScene': {
					context.scene.reset();
					return await context.scene.enter('dateStep');
				}
				default: {
					break;
				}
			}
		}

		return await context.scene.leave();
	}
);
