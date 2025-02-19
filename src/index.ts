import './shared/dayjs.init.js';

import { setTimeout as sleep } from 'node:timers/promises';
import { getScheduleCronJob } from './external/cron/renderCron.js';
import { logger } from './external/logger/pino.js';
import { VKExtend } from './external/vk/bot/bot.js';
import { addEventCommand } from './external/vk/bot/events/commands/addEvent.command.js';
import { deleteEventCommand } from './external/vk/bot/events/commands/deleteEvent.command.js';
import { updateEventCommand } from './external/vk/bot/events/commands/updateEvent.command.js';
import { addEventScene } from './external/vk/bot/events/scenes/add-event/add-event.scene.js';
import { deleteEventScene } from './external/vk/bot/events/scenes/delete-event/delete-event.scene.js';
import { updateEventScene } from './external/vk/bot/events/scenes/update-event/update-event.scene.js';
import { mainMenuKeyboard } from './external/vk/bot/shared/keyboards/main-menu.keyboard.js';
import { mainMenuMessage } from './external/vk/bot/shared/messages/mainMenu.message.js';
import { onFallbackMessage } from './external/vk/bot/shared/messages/onFallback.message..js';
import { getContextPartForLogging } from './external/vk/bot/shared/utils/logger-messages.js';
import { eventsService } from './modules/events/index.js';

const renderJob = getScheduleCronJob(eventsService);

const vk = new VKExtend({
	token: process.env.LONGPOLL_TOKEN!,
	preventOutbox: true,
	preventChat: true,
	hearEvents: ['message_new'],
	errorHandler: async (error) => {
		logger.fatal(error);
		await gracefulShutdown(true);
	},
});

vk.addScenes([addEventScene, deleteEventScene, updateEventScene]);

vk.hear(
	[{ 'messagePayload.command': 'addEvent' }, { text: '/add' }],
	async (context) => {
		logger.info(
			{ context: getContextPartForLogging(context) },
			`User ${context.senderId} -> send "add_event" command`
		);

		await addEventCommand(context);
	}
);
vk.hear(
	[{ 'messagePayload.command': 'updateEvent' }, { text: '/update' }],

	async (context) => {
		logger.info(
			{ context: getContextPartForLogging(context) },
			`User ${context.senderId} -> send "update_event" command`
		);
		await updateEventCommand(context);
	}
);
vk.hear(
	[{ 'messagePayload.command': 'deleteEvent' }, { text: '/delete' }],
	async (context) => {
		logger.info(
			{ context: getContextPartForLogging(context) },
			`User ${context.senderId} -> send "delete_event" command`
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
			{ context: getContextPartForLogging(context) },
			`User ${context.senderId} -> send "start" command`
		);
		await context.send(mainMenuMessage, {
			keyboard: mainMenuKeyboard,
		});
	}
);

vk.hearOnFallback(async (context) => {
	logger.warn(
		{
			context: getContextPartForLogging(context),
		},
		`User ${context.senderId} -> on fallback executed`
	);
	await context.send(onFallbackMessage, {
		keyboard: mainMenuKeyboard,
	});
});

async function start() {
	renderJob.start();
	logger.info('Cron renderJob started');
	await vk.updates.startPolling();
	logger.info('Polling started');
}

async function gracefulShutdown(withError: boolean) {
	logger.warn('Shutdowning app...');
	await sleep(5000);
	logger.warn('Stopping renderJob');
	renderJob.stop();
	logger.warn('Stopping bot polling...');
	process.exit(withError ? 1 : 0);
}

process.on('uncaughtException', async (error) => {
	logger.fatal(error);
	await gracefulShutdown(true);
});

process.on('unhandledRejection', async (error) => {
	logger.fatal(error);
	await gracefulShutdown(true);
});

process.on('SIGINT', async () => {
	logger.warn(`SIGINT`);
	await gracefulShutdown(false);
});

process.on('SIGTERM', async () => {
	logger.warn('SIGTERM');
	await gracefulShutdown(false);
});

start().catch(async (error) => {
	logger.error(error);
	await gracefulShutdown(true);
});
