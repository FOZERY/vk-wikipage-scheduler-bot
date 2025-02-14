import './shared/dayjs.init.js';

import { logger } from './external/logger/pino.js';
import { VKExtend } from './external/vk/bot/bot.js';
import { addEventCommand } from './external/vk/bot/events/commands/addEvent.command.js';
import { deleteEventCommand } from './external/vk/bot/events/commands/deleteEvent.command.js';
import { addEventScene } from './external/vk/bot/events/scenes/add-event/add-event.scene.js';
import { deleteEventScene } from './external/vk/bot/events/scenes/delete-event/deleteEvent.scene.js';
import { mainMenuKeyboard } from './external/vk/bot/shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from './external/vk/bot/shared/messages/mainMenu.message.js';
import { onFallbackMessage } from './external/vk/bot/shared/messages/onFallback.message..js';

const vk = new VKExtend({
	token: process.env.LONGPOLL_TOKEN!,
	preventOutbox: true,
	preventChat: true,
	hearEvents: ['message_new'],
});

vk.addScenes([addEventScene, deleteEventScene]);

vk.hear(
	[{ 'messagePayload.command': 'createEvent' }, { text: '/add' }],
	async (context) => {
		logger.info(
			{
				eventType: context.eventType,
				event: context.eventText,
				msgPayload: context.messagePayload,
				text: context.text,
				user: {
					id: context.senderId,
					clientInfo: context.clientInfo,
				},
				createdAt: context.createdAt,
				updatedAt: context.updatedAt,
			},
			`ADD_EVENT COMMAND FROM USER ${context.senderId}`
		);
		await addEventCommand(context);
	}
);
vk.hear(
	[{ 'messagePayload.command': 'updateEvent' }, { text: '/update' }],

	async (context) => {
		logger.info(
			{
				eventType: context.eventType,
				event: context.eventText,
				msgPayload: context.messagePayload,
				text: context.text,
				user: {
					id: context.senderId,
					clientInfo: context.clientInfo,
				},
				createdAt: context.createdAt,
				updatedAt: context.updatedAt,
			},
			'UPDATE_EVENT'
		);
		// await createEventCommand(context);
	}
);
vk.hear(
	[{ 'messagePayload.command': 'deleteEvent' }, { text: '/delete' }],
	async (context) => {
		logger.info(
			{
				eventType: context.eventType,
				event: context.eventText,
				msgPayload: context.messagePayload,
				text: context.text,
				user: {
					id: context.senderId,
					clientInfo: context.clientInfo,
				},
				createdAt: context.createdAt,
				updatedAt: context.updatedAt,
			},
			'DELETE_EVENT'
		);
		await deleteEventCommand(context);
	}
);
vk.hear(
	[
		{ 'messagePayload.command': 'start' },
		{ text: '/help' },
		{ text: '/start' },
	],
	async (context) => {
		logger.info(
			{
				eventType: context.eventType,
				event: context.eventText,
				msgPayload: context.messagePayload,
				text: context.text,
				user: {
					id: context.senderId,
					clientInfo: context.clientInfo,
				},
				createdAt: context.createdAt,
				updatedAt: context.updatedAt,
			},
			'START Command Initialized'
		);
		await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	}
);
vk.hearOnFallback(async (context) => {
	logger.info(
		{
			eventType: context.eventType,
			event: context.eventText,
			msgPayload: context.messagePayload,
			text: context.text,
			user: {
				id: context.senderId,
				clientInfo: context.clientInfo,
			},
			createdAt: context.createdAt,
			updatedAt: context.updatedAt,
		},
		'ON_FALLBACK event'
	);
	await context.send(onFallbackMessage, {
		keyboard: mainMenuKeyboard,
	});
});

vk.updates.startPolling().then(() => console.log('Bot started!'));
