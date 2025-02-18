import './shared/dayjs.init.js';

import { CronJob } from 'cron';
import { logger } from './external/logger/pino.js';
import { ScheduleRenderer } from './external/vk/api/wiki/schedule/schedule-renderer.js';
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
import { eventsController } from './modules/events/index.js';

const vk = new VKExtend({
	token: process.env.LONGPOLL_TOKEN!,
	preventOutbox: true,
	preventChat: true,
	hearEvents: ['message_new'],
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

vk.updates.startPolling().then(() => logger.info('Polling started'));

process.on('uncaughtException', async (error) => {
	logger.fatal(error);
	logger.warn('Stopping polling...');
	await vk.updates.stop();
	process.exit(1);
});

process.on('unhandledRejection', async (error) => {
	logger.fatal(error);
	logger.warn('Stopping polling...');
	await vk.updates.stop();
	process.exit(1);
});
