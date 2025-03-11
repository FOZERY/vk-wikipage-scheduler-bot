import type { MessageContext } from "vk-io";
import { onlyTextOrKeyboardAllowMessage } from "../../../../shared/messages/onlyTextOrKeyboardAllow.message.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import type { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { parseTimeString } from "../../../../shared/utils/time-utils.js";
import { getTimeKeyboard } from "../../../keyboards/time.keyboard.js";
import type { AddEventSceneDependencies, AddEventSceneState } from "../add-event.scene.js";

export const timeStep: SceneStepWithDependencies<
	MessageContext,
	AddEventSceneState,
	AddEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(context, `User ${context.senderId} -> entered time scene step`, "info");
		return await context.send(
			`		
Введи время в одном из форматов: 
	
1. ЧЧ:ММ - ЧЧ:ММ 
2. ЧЧ:ММ
			
Либо выбери один из вариантов на клавиатуре.
`,
			{
				keyboard: attachTextButtonToKeyboard(getTimeKeyboard(), [
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
		switch (context.messagePayload.command) {
			case "leave": {
				return await context.scene.leave();
			}
			case "previous": {
				return await context.scene.step.previous();
			}
			case "setTime": {
				context.scene.state.event.timeRange = context.messagePayload.timeRange;
				break;
			}
			default: {
				logStep(context, `Unknown command: ${context.messagePayload.command}`, "error");
				throw new Error(`Unknown command: ${context.messagePayload.command}`);
			}
		}
	} else {
		const trimmedText = context.text.trim();

		const parseTimeResult = parseTimeString(trimmedText);

		if (parseTimeResult.isErr()) {
			logStep(
				context,
				`User ${context.senderId} -> entered invalid time`,
				"warn",
				parseTimeResult.error
			);
			return await context.reply("Неверный формат времени.");
		}

		context.scene.state.event.timeRange = {
			startTime: parseTimeResult.value.startTimeString,
			endTime: parseTimeResult.value.endTimeString,
		};
	}

	logStep(context, `User ${context.senderId} -> passed time step`, "info");
	return await context.scene.step.next();
};
