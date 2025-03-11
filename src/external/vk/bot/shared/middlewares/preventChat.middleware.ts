import type { MessageContext } from "vk-io";

export async function preventChatMiddleware(context: MessageContext, next: () => Promise<unknown>) {
	if (context.isChat) {
		return;
	}

	await next();
}
