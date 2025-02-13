import dayjs from 'dayjs';
import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import { timeRangeToStringOutput } from '../../../../../shared/utils/time-utils.js';
import { confirmKeyboard } from '../../../keyboards/confirm.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const confirmStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		const dateFormattedString = dayjs(context.scene.state.date)
			.tz()
			.format('DD.MM.YYYY');

		return await context.send(
			`	
Событие, которое вы хотите создать: 	
Дата: ${dateFormattedString}	
Время: ${timeRangeToStringOutput(
				context.scene.state.startTime,
				context.scene.state.endTime
			)}			
Место: ${context.scene.state.place}	
Название: ${context.scene.state.title}
Организатор: ${context.scene.state.organizer || 'Не указан'}				
			`,
			{
				keyboard: confirmKeyboard,
			}
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		switch (context.messagePayload.command) {
			case 'previous': {
				return await context.scene.step.previous();
			}
			case 'leave': {
				return await context.scene.leave();
			}
			case 'restartScene': {
				context.scene.reset();
				return await context.scene.enter('dateStep');
			}
			case 'confirm': {
				break;
			}
		}
	} else {
		const trimmedText = context.text.trim();
		if (!trimmedText.toLowerCase().includes('подтвердить')) {
			return await context.reply(
				'Для подтверждения создания события напишите "Подтвердить".'
			);
		}
	}

	const result = await context.dependencies.eventsController.create({
		date: context.scene.state.date,
		place: context.scene.state.place,
		startTime: context.scene.state.startTime,
		endTime: context.scene.state.endTime,
		organizer: context.scene.state.organizer,
		title: context.scene.state.title,
	});

	if (result.isErr()) {
		console.error(result.error);
		await context.send('Ошибка сервиса.');
	}

	const startDate = dayjs().startOf('month');
	const eventsForRender =
		await context.dependencies.eventsController.getEventsByDateRange({
			startDate: startDate.format('YYYY-MM-DD'),
			endDate: startDate
				.add(1, 'month')
				.add(14, 'day')
				.format('YYYY-MM-DD'),
		});

	if (eventsForRender.isErr()) {
		console.error(eventsForRender.error);
		return await context.send('Ошибка сервиса.');
	}

	const res = await context.dependencies.scheduleRenderer.renderSchedule(
		eventsForRender.value
	);

	if (res.isErr()) {
		console.error(res.error);
		return await context.send('Ошибка сервиса.');
	}

	await context.send('Событие успешно создано');

	return await context.scene.leave();
};
