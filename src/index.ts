import './bot/init/dayjs-setup.js';

import { HearManager } from '@vk-io/hear';
import { SceneContext, SceneManager } from '@vk-io/scenes';
import { SessionManager } from '@vk-io/session';
import { MessageContext, VK } from 'vk-io';
import { createEventCommand } from './bot/commands/create/index.js';
import { sceneCreateEvent } from './bot/commands/create/scenes/createEventScene/index.js';
import { menuKeyboard } from './bot/view/keyboards/keyboards.js';
import {
	helpMessage,
	onFallbackMessage,
} from './bot/view/messages/messages.js';

const vk = new VK({
	token: process.env.LONGPOLL_TOKEN ?? '',
});

export type MessageContextWithScene = MessageContext & {
	scene: SceneContext<any>;
};

const hearManager = new HearManager<MessageContextWithScene>();
const sceneManager = new SceneManager();

sceneManager.addScenes([sceneCreateEvent]);

const sessionManager = new SessionManager();

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

hearManager.hear('/create', async (context) => {
	await createEventCommand(context);
});
hearManager.hear('/help', async (context) => {
	await context.send(helpMessage, {
		keyboard: menuKeyboard,
	});
});
hearManager.onFallback(async (context) => {
	await context.send(onFallbackMessage, {
		keyboard: menuKeyboard,
	});
});

vk.updates.start().then(() => console.log('bot started'));
