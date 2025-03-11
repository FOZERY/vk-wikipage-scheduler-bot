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

export function logStep(context: Context, message: string, level: Level, error?: unknown): void;
export function logStep(
	context: Context,
	message: string,
	data: Record<string, unknown>,
	level: Level,
	error?: unknown
): void;
export function logStep(
	context: Context,
	message: string,
	dataOrLevel: Record<string, unknown> | Level,
	levelOrError?: Level | unknown,
	maybeError?: unknown
) {
	const isExtendedVersion = typeof dataOrLevel === "object";
	const level = isExtendedVersion ? (levelOrError as Level) : (dataOrLevel as Level);
	const error = isExtendedVersion ? maybeError : levelOrError;
	const data = isExtendedVersion ? (dataOrLevel as Record<string, unknown>) : undefined;

	const logObject: Record<string, unknown> = {
		context: {
			...getContextPartForLogging(context),
			scene: {
				stepId: context.scene.step.stepId,
				state: context.scene.state,
			},
		},
	};

	if (error !== undefined) {
		logObject.error = error;
	}

	if (data !== undefined) {
		logObject.data = data;
	}

	context.dependencies.logger[level](logObject, message);
}
