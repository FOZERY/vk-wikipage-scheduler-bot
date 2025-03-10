import { MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { getOrganizerKeyboard } from "../../../keyboards/organizer.keyboard.js";
import {
	AddEventSceneDependencies,
	AddEventSceneState,
} from "../add-event.scene.js";

export const placeStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered organizer scene step`,
			"info"
		);
		return await context.send(
			`
Введи имя организатора.
`,
			{
				keyboard: attachTextButtonToKeyboard(getOrganizerKeyboard(), [
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
			case "setNoOrganizer": {
				context.scene.state.event.organizer = null;
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
		`User ${context.senderId} -> passed organizer step`,
		"info"
	);
	return await context.scene.step.next();
};
