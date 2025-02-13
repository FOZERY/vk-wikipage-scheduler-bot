import { MessageContext } from 'vk-io';
import { leaveKeyabord } from '../../../../../bot/commands/delete/keyboards/exitKeyboard.js';
import { selectEventKeyboard } from '../../../../../bot/commands/delete/keyboards/selectEventKeyboard.js';
import { mainMenuKeyboard } from '../../../../../shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from '../../../../../shared/messages/mainMenu.message.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import {
	DeleteEventSceneDependencies,
	DeleteEventSceneState,
} from '../types.js';

export const findEventStep: SceneStepWithDependencies<
	MessageContext,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`Используй сообщение для поиска события, которое хочешь удалить (искать можно по дате, названию, организатору).`,
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
				context.scene.state.event = context.messagePayload.event;
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
