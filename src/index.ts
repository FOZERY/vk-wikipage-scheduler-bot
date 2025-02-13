import { startBot } from './external/vk/bot/index.js';

async function start() {
	await startBot(process.env.LONGPOLL_TOKEN!);
}

start();
