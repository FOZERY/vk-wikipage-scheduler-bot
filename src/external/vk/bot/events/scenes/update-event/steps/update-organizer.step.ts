import { MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { getOrganizerKeyboard } from "../../../keyboards/organizer.keyboard.js";
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
	UpdateEventSceneStepNumber,
} from "../update-event.scene.js";

export const updateOrganizerStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered update-organizer step`,
			"info"
		);

		return await context.send(`Введи имя организатора.`, {
			keyboard: attachTextButtonToKeyboard(getOrganizerKeyboard(), [
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
			case "setNoOrganizer": {
				context.scene.state.event.organizer = null;
				break;
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
		const parsedOrganizer = context.text.trim();
		if (parsedOrganizer.length > 255) {
			logStep(
				context,
				`User ${context.senderId} -> too long (>255) organizer`,
				"info"
			);
			return await context.reply(`Слишком длинное имя организатора.`);
		}

		context.scene.state.event.organizer = parsedOrganizer;
	}

	logStep(
		context,
		`User ${context.senderId} -> passed update-organizer step`,
		"info"
	);
	return await context.scene.step.go(
		UpdateEventSceneStepNumber.SelectFieldOrConfirm
	);
};
