import { MessageContext } from 'vk-io';
import { onlyTextOrKeyboardAllowMessage } from '../../../../shared/messages/onlyTextOrKeyboardAllow.message.js';
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from '../../../../shared/utils/keyboard-utils.js';
import { logStep } from '../../../../shared/utils/logger-messages.js';
import { SceneStepWithDependencies } from '../../../../shared/utils/scene-utils.js';
import { getPlaceKeyboard } from '../../../keyboards/place.keyboard.js';
import { AddEventSceneDependencies, AddEventSceneState } from '../types.js';

export const organizerStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered place scene step`,
			'info'
		);
		return await context.send(
			`
Введи название места события или выбери с клавиатуры.

/previous - назад
/leave - отмена	
`,
			{
				keyboard: attachTextButtonToKeyboard(getPlaceKeyboard(), [
					previousButtonOptions,
					leaveButtonOptions,
				]),
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
			case 'setPlace': {
				context.scene.state.place = context.messagePayload.place;
				break;
			}
			default: {
				logStep(context, 'Unknown command', 'error');
				throw new Error('Unknown command');
			}
		}
	} else {
		// если ввели текст
		const parsedText = context.text.trim();

		if (parsedText.toLowerCase() === '/previous') {
			return await context.scene.step.previous();
		}

		if (parsedText.toLowerCase() === '/leave') {
			return await context.scene.leave();
		}

		if (parsedText.length > 255) {
			logStep(
				context,
				`User ${context.senderId} -> too long (>255) place name - ${parsedText}`,
				'info'
			);
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
		logStep(
			context,
			`User ${context.senderId} -> error in eventsController`,
			'error',
			result.error
		);
		return await context.send('Ошибка сервиса.');
	}

	if (result.value.length > 0) {
		logStep(
			context,
			`User ${context.senderId} -> place is already taken`,
			'info'
		);
		return await context.reply(
			`Это место и время уже заняты другим событием: "${result.value[0].title}".`
		);
	}

	logStep(context, `User ${context.senderId} -> passed place step`, 'info');
	return await context.scene.step.next();
};
