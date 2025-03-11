import type { MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import { convertRussianDateStringToDefaultFormat } from "../../../../shared/utils/date-utils.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import type { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { getDateKeyboard } from "../../../keyboards/date.keyboard.js";
import type { AddEventSceneDependencies, AddEventSceneState } from "../add-event.scene.js";

export const dateStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(context, `User ${context.senderId} -> entered date scene step`, "info");
		return await context.send(
			`
Введи дату в формате ДД.ММ.ГГГГ или выбери один из вариантов на клавиатуре.
			`,
			{
				keyboard: attachTextButtonToKeyboard(getDateKeyboard(), leaveButtonOptions),
			}
		);
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		switch (context.messagePayload.command) {
			case "leave": {
				return await context.scene.leave();
			}
			case "setDate": {
				context.scene.state.event.date = context.messagePayload.date;
				break;
			}
			default: {
				logStep(context, `Unknown command: ${context.messagePayload.command}`, "error");
				throw new Error(`Unknown command: ${context.messagePayload.command}`);
			}
		}
	} else {
		// если ввели текст
		const trimmedText = context.text.trim();

		const result = convertRussianDateStringToDefaultFormat(trimmedText);
		if (result.isErr()) {
			logStep(
				context,
				`User ${context.senderId} -> entered invalid date`,
				"warn",
				result.error
			);
			return await context.reply("Неправильный формат даты.");
		}

		context.scene.state.event.date = result.value;
	}

	logStep(context, `User ${context.senderId} -> passed date step`, "info");
	return await context.scene.step.next();
};
