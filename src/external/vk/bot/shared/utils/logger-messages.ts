import type { Level } from "pino";
import type { Context } from "vk-io";

export function getContextPartForLogging(context: Context) {
	return {
		eventType: context.eventType,
		event: context.eventText,
		msgPayload: context.messagePayload,
		text: context.text,
		senderId: context.senderId,
		clientInfo: context.clientInfo,
		chatId: context.chatId,
		createdAt: context.createdAt,
		updatedAt: context.updatedAt,
	};
}

export function logStep(context: Context, message: string, level: Level, error?: unknown) {
	context.dependencies.logger[level](
		{
			error: error,
			context: {
				...getContextPartForLogging(context),
				scene: {
					stepId: context.scene.step.stepId,
					state: context.scene.state,
				},
			},
		},
		message
	);
}
