import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import { SceneStepWithDependencies } from '../../../../../shared/utils/scene-utils.js';
import { setPlaceKeyboard } from '../../../keyboards/setPlace.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const organizerStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		return await context.send(
			`Введи название места события или выбери с клавиатуры.`,
			{ keyboard: setPlaceKeyboard }
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
			default: {
				context.scene.state.place = context.messagePayload.place;
			}
		}
	} else {
		// если ввели текст
		const parsedText = context.text.trim();
		if (parsedText.length > 255) {
			return await context.reply('Слишком длинное название места.');
		}

		context.scene.state.place = parsedText;
	}

	const result =
		await context.dependencies.eventsController.findCollisionsInSchedule({
			date: context.scene.state.date,
			startTime: context.scene.state.startTime,
			endTime: context.scene.state.endTime,
			place: context.scene.state.place,
		});

	if (result.isErr()) {
		console.log(result.error);
		return await context.send('Ошибка сервиса.');
	}

	if (result.value.length > 0) {
		return await context.reply(
			`Это место и время уже заняты другим событием: "${result.value[0].title}".`
		);
	}

	return await context.scene.step.next();
};
