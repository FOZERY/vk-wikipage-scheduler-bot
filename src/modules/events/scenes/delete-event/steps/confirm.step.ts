import dayjs from 'dayjs';
import { Context } from 'vk-io';
import { confirmDeleteKeyboard } from '../../../../../bot/commands/delete/keyboards/confirmDeleteKeyboard.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import { timeRangeToStringOutput } from '../../../../../shared/utils/time-utils.js';
import {
	DeleteEventSceneDependencies,
	DeleteEventSceneState,
} from '../types.js';

export const confirmStep: SceneStepWithDependencies<
	Context,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`	
Вы действительно хотите удалить это событие?
Дата: ${dayjs(context.scene.state.event.date, 'YYYY-MM-DD').format(
				'DD.MM.YYYY'
			)}	
Время: ${timeRangeToStringOutput(
				context.scene.state.event.startTime,
				context.scene.state.event.endTime
			)}
Место: ${context.scene.state.event.place}
Название: ${context.scene.state.event.title}
Организатор: ${context.scene.state.event.organizer || 'не указан'}
`,
			{ keyboard: confirmDeleteKeyboard }
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
			case 'leave': {
				return await context.scene.leave();
			}
			case 'previous': {
				return await context.scene.step.previous();
			}
			default: {
				const result =
					await context.dependencies.eventsController.deleteEventById(
						context.scene.state.event.id!
					);
				if (result.isErr()) {
					console.log(result.error);
					return await context.send('Ошибка сервера.');
				}

				const startDate = dayjs().startOf('month');
				const eventsForRender =
					await context.dependencies.eventsController.getEventsByDateRange(
						{
							startDate: startDate.format('YYYY-MM-DD'),
							endDate: startDate
								.add(1, 'month')
								.add(14, 'day')
								.format('YYYY-MM-DD'),
						}
					);

				if (eventsForRender.isErr()) {
					console.error(eventsForRender.error);
					return await context.send('Ошибка сервиса.');
				}

				const res =
					await context.dependencies.scheduleRenderer.renderSchedule(
						eventsForRender.value
					);

				if (res.isErr()) {
					console.error(res.error);
					return await context.send('Ошибка сервиса.');
				}

				return await context.send('Событие успешно удалено.');
			}
		}
	}
	return await context.scene.leave();
};
