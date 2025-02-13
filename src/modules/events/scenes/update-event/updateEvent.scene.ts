import { db } from '../../../../../db/drizzle/index.js';
import { EventsController } from '../../../../../domain/events/events.controller.js';
import { EventsRepositoryImpl } from '../../../../../domain/events/infra/drizzle/events.repository.impl.js';
import { mainMenuKeyboard } from '../../../../../shared/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../shared/messages/mainMenuMessage.js';
import { createScene } from '../../../../../shared/utils/createScene.js';
import { parseDateString } from '../../../../../shared/utils/parseDateString.js';
import { leaveKeyabord } from '../../../../commands/delete/keyboards/exitKeyboard.js';
import { selectEventKeyboard } from '../../../../commands/delete/keyboards/selectEventKeyboard.js';
import { setDateKeyboard } from '../../keyboards/setDate.keyboard.js';

export const addEventScene = createScene(
	'addEventScene',
	[
		async (context) => {
			if (context.scene.step.firstTime) {
				return await context.send(
					`Используй сообщение для поиска события, которое хочешь изменить. (искать можно по дате, названию, организатору)`,
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
						await context.scene.leave();
						return await context.send(mainMenuMessage, {
							keyboard: mainMenuKeyboard,
						});
					}
					default: {
						context.scene.state.event =
							context.messagePayload.event;
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
		},
	],
	{
		eventsController: new EventsController(
			new EventsRepositoryImpl(db),
			db
		),
	}
);
