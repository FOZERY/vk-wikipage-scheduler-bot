import assert from "node:assert";
import dayjs from "dayjs";
import { type Context, Keyboard } from "vk-io";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import type { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { timeRangeToStringOutput } from "../../../../shared/utils/time-utils.js";
import type { DeleteEventSceneDependencies, DeleteEventSceneState } from "../delete-event.scene.js";

export const confirmStep: SceneStepWithDependencies<
	Context,
	DeleteEventSceneState,
	DeleteEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(context, `User ${context.senderId} -> entered confirm step`, "info");

		return await context.send(
			`		
Ты действительно хочешь удалить это событие?
Дата: ${dayjs(context.scene.state.event.date, "YYYY-MM-DD").format("DD.MM.YYYY")}	
Время: ${timeRangeToStringOutput(context.scene.state.event.timeRange)}
Место: ${context.scene.state.event.place}
Название: ${context.scene.state.event.title}
Организатор: ${context.scene.state.event.organizer || "не указан"}
`,
			{
				keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
					{
						label: "Удалить",
						color: Keyboard.POSITIVE_COLOR,
						payload: { command: "deleteEvent" },
					},
					previousButtonOptions,
					leaveButtonOptions,
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
			case "previous": {
				return await context.scene.step.previous();
			}
			case "deleteEvent": {
				break;
			}
			default: {
				logStep(context, `User ${context.senderId} -> unknown command`, "error");
				throw new Error("Unknown command");
			}
		}
	} else {
		// если ввели текст
		return await context.reply("Воспользуйся клавиатурой.");
	}

	assert(
		typeof context.scene.state.event.id === "number",
		"Event ID must be defined and be a number"
	);
	const result = await context.dependencies.eventsService.deleteEventById(
		context.scene.state.event.id
	);

	if (result.isErr()) {
		logStep(
			context,
			`User ${context.senderId} -> error while deleting event`,
			"error",
			result.error
		);
		return await context.send("Ошибка сервера.");
	}

	await context.send("Событие успешно удалено.");

	logStep(context, `User ${context.senderId} -> passed confirm step`, "info");
	return await context.scene.leave();
};
