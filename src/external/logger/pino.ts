import { pino, TransportTargetOptions } from 'pino';

const targets: TransportTargetOptions[] = [];

if (process.env.PRETTY_LOGS === 'true') {
	targets.push({
		target: 'pino-pretty',
		options: {
			singleLine: true,
		},
	});
}

if (process.env.LOG_TO_LOGTAIL === 'true') {
	targets.push({
		target: '@logtail/pino',
		options: {
			sourceToken: process.env.LOGTAIL_TOKEN,
			options: { endpoint: process.env.LOGTAIL_URL },
		},
	});
}

export const logger = pino({
	level: process.env.LOG_LEVEL ?? 'info',
	transport: {
		targets: targets,
	},
});
