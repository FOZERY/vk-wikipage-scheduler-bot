import { MessageContext } from 'vk-io';
import { leaveKeyabord } from '../../../../shared/keyboards/leave.keyboard.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import {
	selectEventKeyboard,
	SelectEventKeyboardPayload,
} from '../../../keyboards/selectEvent.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';

export const findEventStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`Используй сообщение для поиска события, которое хочешь изменить (искать можно по дате, названию, организатору).`,
			{ keyboard: leaveKeyabord }
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
			default: {
				const { event } =
					context.messagePayload as SelectEventKeyboardPayload;
				context.scene.state.event = event;
			}
		}
	} else {
		// если ввели текст
		const result =
			await context.dependencies.eventsController.findEventsByTitleOrDate(
				context.text
			);
		if (result.isErr()) {
			console.log(result.error);
			return await context.send('Ошибка сервера.');
		}
		if (result.value.length === 0) {
			return await context.send('События не найдены.');
		}
		return await context.send(
			'Выбери событие для удаления, либо продолжи поиск.',
			{
				keyboard: selectEventKeyboard(result.value),
			}
		);
	}
	return await context.scene.step.next();
};
