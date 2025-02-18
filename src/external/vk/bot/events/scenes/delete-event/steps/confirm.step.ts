import dayjs from 'dayjs';
import { Context } from 'vk-io';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { timeRangeToStringOutput } from '../../../../shared/utils/time-utils.js';
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
		}
	}

	const result = await context.dependencies.eventsController.deleteEventById(
		context.scene.state.event.id!
	);

	if (result.isErr()) {
		console.log(result.error);
		return await context.send('Ошибка сервера.');
	}

	await context.send('Событие успешно удалено.');
	return await context.scene.leave();
};
