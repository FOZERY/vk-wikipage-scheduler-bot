import './shared/dayjs.init.js';

import { logger } from './external/logger/pino.js';
import { VKExtend } from './external/vk/bot/bot.js';
import { addEventCommand } from './external/vk/bot/events/commands/addEvent.command.js';
import { deleteEventCommand } from './external/vk/bot/events/commands/deleteEvent.command.js';
import { updateEventCommand } from './external/vk/bot/events/commands/updateEvent.command.js';
import { addEventScene } from './external/vk/bot/events/scenes/add-event/add-event.scene.js';
import { deleteEventScene } from './external/vk/bot/events/scenes/delete-event/delete-event.scene.js';
import { updateEventScene } from './external/vk/bot/events/scenes/update-event/update-event.scene.js';
import { mainMenuKeyboard } from './external/vk/bot/shared/keyboards/mainMenu.keyboard.js';
import { mainMenuMessage } from './external/vk/bot/shared/messages/mainMenu.message.js';
import { onFallbackMessage } from './external/vk/bot/shared/messages/onFallback.message..js';

const vk = new VKExtend({
	token: process.env.LONGPOLL_TOKEN!,
	preventOutbox: true,
	preventChat: true,
	hearEvents: ['message_new'],
});

vk.addScenes([addEventScene, deleteEventScene, updateEventScene]);

vk.hear(
	[{ 'messagePayload.command': 'createEvent' }, { text: '/add' }],
	async (context) => {
		logger.debug(
			context,
			`ADD_EVENT COMMAND from user ${context.senderId}`
		);
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
			`ADD_EVENT COMMAND from user ${context.senderId}`
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
			`UPDATE_EVENT COMMAND from user ${context.senderId}`
		);
		await updateEventCommand(context);
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
			`START COMMAND from user ${context.senderId}`
		);
		await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	}
);

vk.hearOnFallback(async (context) => {
	logger.warn(
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
		`ON_FALLBACK from user ${context.senderId}`
	);
	await context.send(onFallbackMessage, {
		keyboard: mainMenuKeyboard,
	});
});

vk.updates.startPolling().then(() => logger.info('Bot started!'));

process.on('uncaughtException', async (error) => {
	logger.fatal(error);
	await vk.updates.stop();
	process.exit(1);
});
process.on('unhandledRejection', async (error) => {
	logger.fatal(error);
	await vk.updates.stop();
	process.exit(1);
});
