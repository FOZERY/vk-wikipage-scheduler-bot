import './bot/init/dayjs-setup.js';

import { createClient } from '@supabase/supabase-js';
import { HearManager } from '@vk-io/hear';
import { SceneContext, SceneManager } from '@vk-io/scenes';
import { SessionManager } from '@vk-io/session';
import { MessageContext, VK } from 'vk-io';
import { createEventCommand } from './bot/commands/create/index.js';
import { sceneCreateEvent } from './bot/commands/create/scenes/createEventScene/index.js';
import { mainMenuKeyboard } from './bot/common/keyboards/mainMenuKeyboard.js';
import { mainMenuMessage } from './bot/common/messages/mainMenuMessage.js';
import { onFallbackMessage } from './bot/common/messages/onFallbackMessage.js';
import { Database } from './db/supabase/supabase.types.js';

export const supabase = createClient<Database>(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_API_KEY as string
);

const vk = new VK({
	token: process.env.LONGPOLL_TOKEN ?? '',
});

export type MessageContextWithScene = MessageContext & {
	scene: SceneContext<any>;
};

const hearManager = new HearManager<MessageContextWithScene>();
const sessionManager = new SessionManager();
const sceneManager = new SceneManager();

vk.updates.on('message', [
	async (context, next) => {
		if (context.isOutbox || context.isChat) {
			return;
		}

		await next();
	},
]);
vk.updates.on('message_new', sessionManager.middleware);
vk.updates.on('message_new', sceneManager.middleware);
vk.updates.on('message_new', sceneManager.middlewareIntercept);
vk.updates.on('message_new', hearManager.middleware);

sceneManager.addScenes([sceneCreateEvent]);

hearManager.hear(
	[{ 'messagePayload.command': 'createEvent' }, { text: '/create' }],
	async (context) => {
		await createEventCommand(context);
	}
);
hearManager.hear(
	[{ 'messagePayload.command': 'updateEvent' }, { text: '/update' }],
	async (context) => {
		// await createEventCommand(context);
	}
);
hearManager.hear(
	[{ 'messagePayload.command': 'deleteEvent' }, { text: '/update' }],
	async (context) => {
		// await createEventCommand(context);
	}
);
hearManager.hear(
	[
		{ 'messagePayload.command': 'start' },
		{ text: '/help' },
		{ text: '/start' },
	],
	async (context) => {
		await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	}
);

hearManager.onFallback(async (context) => {
	await context.send(onFallbackMessage, {
		keyboard: mainMenuKeyboard,
	});
});

vk.updates.start().then(() => console.log('bot started'));
