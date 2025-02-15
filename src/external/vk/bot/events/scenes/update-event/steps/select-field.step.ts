import dayjs from 'dayjs';
import { MessageContext } from 'vk-io';
import { logger } from '../../../../../../logger/pino.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { timeRangeToStringOutput } from '../../../../shared/utils/time-utils.js';
import {
	SelectField,
	SelectFieldKeyboardCommand,
	SelectFieldKeyboardPayload,
	selectFieldOrConfirmKeyboard,
} from '../../../keyboards/select-field.keyboard.js';
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
} from '../types.js';
import { UpdateEventSceneStepNumber } from '../update-event.scene.js';

export const selectFieldStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`
Вы выбрали следующее событие:
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

Выберите, что хотите изменить.	
`,
			{ keyboard: selectFieldOrConfirmKeyboard }
		);
	}
	if (!context.text) {
		return await context.reply(
			`Разрешено вводить только текст, либо пользоваться клавиатурой.`
		);
	}
	if (context.hasMessagePayload) {
		const payload = context.messagePayload as SelectFieldKeyboardPayload;
		// если ввели с клавиатуры
		switch (payload.command) {
			case SelectFieldKeyboardCommand.Leave: {
				return await context.scene.leave();
			}
			case SelectFieldKeyboardCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SelectFieldKeyboardCommand.SelectField: {
				const payload =
					context.messagePayload as SelectFieldKeyboardPayload;
				switch (payload.field) {
					case SelectField.Date: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateDate
						);
					}
					case SelectField.Time: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateTime
						);
					}
					case SelectField.Place: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdatePlace
						);
					}
					case SelectField.Title: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateTitle
						);
					}
					case SelectField.Organizer: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateOrganizer
						);
					}
					default: {
						throw new Error(`Unexpected field: ${payload.field}`);
					}
				}
				break;
			}
			case SelectFieldKeyboardCommand.Confirm: {
				const result =
					await context.dependencies.eventsController.update(
						context.scene.state.event
					);

				if (result.isErr()) {
					logger.error(result.error);
					return await context.send('Ошибка сервера');
				}

				await context.send('Событие успешно удалено.');
				return await context.scene.leave();
			}
		}
	} else {
		throw new Error('not implemented');
	}
	return await context.scene.step.next();
};
