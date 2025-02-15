import { pino } from 'pino';

export const logger = pino({
	level: process.env.LOG_LEVEL ?? 'info',
	transport: {
		targets: [
			{
				target: '@logtail/pino',
				options: {
					sourceToken: process.env.LOGTAIL_TOKEN,
					options: { endpoint: process.env.LOGTAIL_URL },
				},
			},
			{
				target: 'pino-pretty',
			},
		],
	},
});
