import dayjs from 'dayjs';
import { getEventCollisionByDateTimePlace } from '../../../../../../db/sqlite/queries/getEventCollisionByDateTimePlace.js';
import { supabase } from '../../../../../../index.js';
import { mainMenuKeyboard } from '../../../../../common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from '../../../../../common/messages/mainMenuMessage.js';
import { createSceneStep } from '../../../../../utils/createSceneStep.js';
import { setPlaceKeyboard } from '../../../keyboards/setPlaceKeyboard.js';
import { SceneCreateEventState } from '../index.js';

export const placeStep = createSceneStep<SceneCreateEventState>(
	async (context) => {
		if (context.scene.step.firstTime) {
			return await context.send(
				`Введи название места события или выбери с клавиатуры`,
				{ keyboard: setPlaceKeyboard }
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
				default: {
					context.scene.state.place = context.messagePayload.place;
				}
			}
		} else {
			// если ввели текст
			const parsedText = context.text.trim();
			context.scene.state.place = parsedText;
		}

		let query = supabase
			.from('events')
			.select('*')
			.eq(
				'date',
				dayjs(context.scene.state.date).tz().format('YYYY-MM-DD')
			)
			.ilike('place', `%${context.scene.state.place}%`)
			.not('start_time', 'is', 'NULL');

		if (!context.scene.state.time.endTime) {
			query = query.or(
				`and(end_time.not.is.null, start_time.lte.${context.scene.state.time.startTime}, end_time.gt.${context.scene.state.time.startTime}), and(end_time.is.null, start_time.eq.${context.scene.state.time.startTime})`
			);
		} else {
			query = query.or(
				`and(end_time.not.is.null, or(and(end_time.gt.${context.scene.state.time.startTime}, start_time.lt.${context.scene.state.time.endTime}), start_time.eq.${context.scene.state.time.startTime}), and(end_time.is.null, start_time.gte.${context.scene.state.time.startTime}, start_time.lt.${context.scene.state.time.endTime}))`
			);
		}
		query = query.limit(1);

		const { error, data } = await query;
		if (error) {
			console.log(error);
			return await context.send('Ошибка базы данных');
		}

		if (data.length > 0) {
			return await context.send(
				`Это время и место уже заняты другим событием:\n"${data[0].title}"`
			);
		}

		return await context.scene.step.next();
	}
);
