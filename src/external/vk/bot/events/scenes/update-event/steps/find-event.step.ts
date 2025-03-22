import { Keyboard, type MessageContext } from "vk-io";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import type { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import {
	type SelectEventKeyboardPayload,
	selectEventKeyboard,
} from "../../../keyboards/select-event.keyboard.js";
import type { UpdateEventSceneDependencies, UpdateEventSceneState } from "../update-event.scene.js";

export const findEventStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(context, `User ${context.senderId} -> entered find-event step`, "info");

		return await context.send(
			"Используй сообщение для поиска события, которое хочешь изменить (искать можно по дате, названию, организатору).",
			{
				keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
					{
						label: "Отмена",
						color: Keyboard.NEGATIVE_COLOR,
						payload: { command: "leave" },
					},
				]),
			}
		);
	}
	if (!context.text) {
		return await context.reply(
			"Разрешено вводить только текст, либо пользоваться клавиатурой."
		);
	}
	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		switch (context.messagePayload.command) {
			case "leave": {
				return await context.scene.leave();
			}
			case "selectEvent": {
				const { eventId } = context.messagePayload as SelectEventKeyboardPayload;

				logStep(
					context,
					`User ${context.senderId} -> selected event with id ${eventId}`,
					{
						eventId,
					},
					"info"
				);
				const event = await context.dependencies.eventsService.findEventById(eventId);

				if (!event) {
					return await context.reply("Событие не найдено.");
				}

				context.scene.state.event = {
					id: event.id,
					title: event.title,
					date: event.date,
					place: event.place,
					timeRange: event.timeRange,
					organizer: event.organizer,
					createdAt: event.createdAt,
					updatedAt: event.updatedAt,
					lastUpdaterId: event.lastUpdaterId,
				};
				break;
			}
			default: {
				logStep(
					context,
					`User ${context.senderId} -> unknown command - ${context.messagePayload.command}`,
					"error"
				);
				throw new Error(`Unknown command - ${context.messagePayload.command}`);
			}
		}
	} else {
		// если ввели текст
		const result = await context.dependencies.eventsService.findEventsByTitleOrDate(
			context.text
		);

		if (result.isErr()) {
			logStep(
				context,
				`User ${context.senderId} -> controller findEvents error`,
				"error",
				result.error
			);
			return await context.send("Ошибка сервера.");
		}

		if (result.value.length === 0) {
			return await context.send("События не найдены.");
		}

		return await context.send("Выбери событие для удаления, либо продолжи поиск.", {
			keyboard: attachTextButtonToKeyboard(selectEventKeyboard(result.value), [
				leaveButtonOptions,
			]),
		});
	}

	logStep(context, `User ${context.senderId} -> passed find-event step `, "info");
	return await context.scene.step.next();
};
