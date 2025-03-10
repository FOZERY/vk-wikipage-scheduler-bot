import { Keyboard, MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import {
	AddEventSceneDependencies,
	AddEventSceneState,
} from "../add-event.scene.js";

export const titleStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered title scene step`,
			"info"
		);
		return await context.send(
			`
Введи название события
`,
			{
				keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
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
		// если ввели текст
		const parsedTitle = context.text.trim();

		if (parsedTitle.length > 255) {
			logStep(
				context,
				`User ${context.senderId} -> too long (>255) title`,
				"info"
			);
			return await context.reply(`Слишком длинное название для события`);
		}

		context.scene.state.event.title = parsedTitle;
	}

	logStep(context, `User ${context.senderId} -> passed title step`, "info");
	return await context.scene.step.next();
};
