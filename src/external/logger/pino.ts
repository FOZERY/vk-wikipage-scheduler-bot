import { type TransportTargetOptions, pino } from "pino";

function serializeError(error: Error) {
	return {
		message: error.message,
		stack: error.stack,
		name: error.name,
		...(error as any),
	};
}

const targets: TransportTargetOptions[] = [];

if (process.env.PRETTY_LOGS === "true") {
	targets.push({
		target: "pino-pretty",
		options: {
			singleLine: true,
		},
	});
}

if (process.env.LOG_TO_LOGTAIL === "true") {
	targets.push({
		target: "@logtail/pino",
		options: {
			sourceToken: process.env.LOGTAIL_TOKEN,
			options: { endpoint: process.env.LOGTAIL_URL },
		},
	});
}

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	transport: {
		targets: targets,
	},
	serializers: {
		err: (err: Error) => {
			// Если err не является экземпляром Error, возвращаем как есть
			if (!(err instanceof Error)) {
				return err;
			}
			return serializeError(err);
		},
		error: (err: Error) => {
			// Дублируем для поля error, так как оба варианта используются
			if (!(err instanceof Error)) {
				return err;
			}
			return serializeError(err);
		},
	},
});
