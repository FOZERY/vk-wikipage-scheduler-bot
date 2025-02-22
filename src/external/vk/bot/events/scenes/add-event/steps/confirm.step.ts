import dayjs from "dayjs";
import { Keyboard, MessageContext } from "vk-io";
import { DatabaseConstraintError } from "../../../../../../../shared/errors.js";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { timeRangeToStringOutput } from "../../../../shared/utils/time-utils.js";
import { getConfirmKeyboard } from "../../../keyboards/confirm.keyboard.js";
import { EventSceneEnum } from "../../../types/events.types.js";
import {
	AddEventSceneDependencies,
	AddEventSceneState,
} from "../add-event.scene.js";

export const confirmStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered confirm scene step`,
			"info"
		);

		const dateFormattedString = dayjs(context.scene.state.event.date)
			.tz()
			.format("DD.MM.YYYY");

		return await context.send(
			`	
Событие, которое вы хотите создать: 	
Дата: ${dateFormattedString}		
Время: ${timeRangeToStringOutput(context.scene.state.event.timeRange)}			
Место: ${context.scene.state.event.place}	
Название: ${context.scene.state.event.title}
Организатор: ${context.scene.state.event.organizer || "Не указан"}
`,
			{
				keyboard: attachTextButtonToKeyboard(getConfirmKeyboard(), [
					{
						label: "Начать заново",
						payload: {
							command: "restartScene",
						},
						color: Keyboard.SECONDARY_COLOR,
					},
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
			case "previous": {
				return await context.scene.step.previous();
			}
			case "leave": {
				return await context.scene.leave();
			}
			case "restartScene": {
				context.scene.reset();
				return await context.scene.enter(EventSceneEnum.addEvent);
			}
			case "confirm": {
				break;
			}
			default: {
				logStep(
					context,
					`Unknown command: ${context.messagePayload.command}`,
					"error"
				);
				throw new Error(
					`Unknown command: ${context.messagePayload.command}`
				);
			}
		}
	} else {
		return await context.reply("Воспользуйся клавиатурой");
	}

	const result = await context.dependencies.eventsService.create({
		date: context.scene.state.event.date,
		place: context.scene.state.event.place,
		timeRange: context.scene.state.event.timeRange,
		organizer: context.scene.state.event.organizer,
		title: context.scene.state.event.title,
		lastUpdaterId: context.senderId,
	});

	if (result.isErr()) {
		if (result.error instanceof DatabaseConstraintError) {
			logStep(
				context,
				`User ${context.senderId} -> database constraint error while creating event`,
				"warn",
				result.error
			);

			return await context.send(
				"Ошибка при создании события: Событие на это время и место уже существует."
			);
		} else {
			logStep(
				context,
				`User ${context.senderId} -> validation error while creating event`,
				"error",
				result.error
			);

			return await context.send("Ошибка сервиса.");
		}
	}

	logStep(context, `User ${context.senderId} -> passed confirm step`, "info");
	await context.send("Событие успешно создано");
	return await context.scene.leave();
};
