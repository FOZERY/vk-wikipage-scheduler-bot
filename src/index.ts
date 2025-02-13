import './shared/utils/dayjs.init.js';

import { HearManager } from '@vk-io/hear';
import { SceneManager } from '@vk-io/scenes';
import { SessionManager } from '@vk-io/session';
import { API, VK } from 'vk-io';

import { addEventCommand } from './modules/events/commands/addEvent.command.js';
import { deleteEventCommand } from './modules/events/commands/deleteEvent.command.js';
import { addEventScene } from './modules/events/scenes/add-event/add-event.scene.js';
import { deleteEventScene } from './modules/events/scenes/delete-event/deleteEvent.scene.js';
import { mainMenuKeyboard } from './shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from './shared/messages/mainMenu.message.js';
import { onFallbackMessage } from './shared/messages/onFallback.message..js';
import { preventChatMiddleware } from './shared/middlewares/preventChat.middleware.js';
import { preventOutboxMiddleware } from './shared/middlewares/preventOutbox.middleware.js';
import { MessageContextWithScene } from './shared/types/context.type.js';

export const vk = new VK({
	token: process.env.LONGPOLL_TOKEN ?? '',
});
export const vkUserApi = new API({
	token: process.env.USER_TOKEN ?? '',
});

const hearManager = new HearManager<MessageContextWithScene>();
const sessionManager = new SessionManager();
const sceneManager = new SceneManager();

vk.updates.on('message', [preventOutboxMiddleware, preventChatMiddleware]);
vk.updates.on('message_new', sessionManager.middleware);
vk.updates.on('message_new', sceneManager.middleware);
vk.updates.on('message_new', sceneManager.middlewareIntercept);
vk.updates.on('message_new', hearManager.middleware);

// TODO: куда-то вынести хз??
sceneManager.addScenes([addEventScene, deleteEventScene]);

hearManager.hear(
	[{ 'messagePayload.command': 'createEvent' }, { text: '/add' }],
	async (context) => {
		await addEventCommand(context);
	}
);
hearManager.hear(
	[{ 'messagePayload.command': 'updateEvent' }, { text: '/update' }],
	async (context) => {
		// await createEventCommand(context);
	}
);
hearManager.hear(
	[{ 'messagePayload.command': 'deleteEvent' }, { text: '/delete' }],
	async (context) => {
		await deleteEventCommand(context);
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
