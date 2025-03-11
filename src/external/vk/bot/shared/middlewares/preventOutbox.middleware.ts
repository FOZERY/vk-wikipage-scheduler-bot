import type { MessageContext } from "vk-io";

export async function preventOutboxMiddleware(
	context: MessageContext,
	next: () => Promise<unknown>
) {
	if (context.isOutbox) {
		return;
	}

	await next();
}
