import { Keyboard, MessageContext } from 'vk-io';
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import {
	selectEventKeyboard,
	SelectEventKeyboardPayload,
} from '../../../keyboards/select-event.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../update-event.scene.js';

export const findEventStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered find-event step`,
			'info'
		);

		return await context.send(
			`Используй сообщение для поиска события, которое хочешь изменить (искать можно по дате, названию, организатору).`,
			{
				keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
					{
						label: 'Отмена',
						color: Keyboard.NEGATIVE_COLOR,
						payload: { command: 'leave' },
					},
				]),
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
			case 'leave': {
				return await context.scene.leave();
			}
			case 'selectEvent': {
				const { event } =
					context.messagePayload as SelectEventKeyboardPayload;
				context.scene.state.event = {
					...event,
					lastUpdaterId: String(context.senderId),
				};
				break;
			}
			default: {
				logStep(
					context,
					`User ${context.senderId} -> unknown command - ${context.messagePayload.command}`,
					'error'
				);
				throw new Error(
					`Unknown command - ${context.messagePayload.command}`
				);
			}
		}
	} else {
		// если ввели текст
		const result =
			await context.dependencies.eventsService.findEventsByTitleOrDate(
				context.text
			);

		if (result.isErr()) {
			logStep(
				context,
				`User ${context.senderId} -> controller findEvents error`,
				'error',
				result.error
			);
			return await context.send('Ошибка сервера.');
		}

		if (result.value.length === 0) {
			return await context.send('События не найдены.');
		}

		return await context.send(
			'Выбери событие для удаления, либо продолжи поиск.',
			{
				keyboard: attachTextButtonToKeyboard(
					selectEventKeyboard(result.value),
					[leaveButtonOptions]
				),
			}
		);
	}

	logStep(
		context,
		`User ${context.senderId} -> passed find-event step `,
		'info'
	);
	return await context.scene.step.next();
};
