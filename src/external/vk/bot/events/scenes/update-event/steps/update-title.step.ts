import { Keyboard, MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
	UpdateEventSceneStepNumber,
} from "../update-event.scene.js";

export const updateTitleStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered update-title step`,
			"info"
		);

		return await context.send(`Введи название события`, {
			keyboard: attachTextButtonToKeyboard(Keyboard.builder(), [
				previousButtonOptions,
			]),
		});
	}

	if (!context.text) {
		return await context.reply(onlyTextOrKeyboardAllowMessage);
	}

	if (context.hasMessagePayload) {
		// если ввели с клавиатуры
		const payload = context.messagePayload;
		switch (payload.command) {
			case "previous": {
				return await context.scene.step.go(
					UpdateEventSceneStepNumber.SelectFieldOrConfirm
				);
			}
			default: {
				logStep(
					context,
					`Unknown command: ${payload.command}`,
					"error"
				);
				throw new Error("Unknown command");
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

	logStep(
		context,
		`User ${context.senderId} -> passed update-title step`,
		"info"
	);
	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
