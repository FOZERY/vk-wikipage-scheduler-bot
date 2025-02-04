import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

export function parseTimeString(input: string) {
	const timeRangeRegex = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;
	const singleTimeRegex = /(\d{2}:\d{2})/;

	let startTime, endTime;

	if (timeRangeRegex.test(input)) {
		// Если введен промежуток времени
		const [, rawStartTime, rawEndTime] = input.match(timeRangeRegex)!;

		startTime = dayjs(rawStartTime, 'HH:mm', true);
		endTime = dayjs(rawEndTime, 'HH:mm', true);

		if (!endTime || !startTime) {
			return err('Invalid time');
		}
	} else if (singleTimeRegex.test(input)) {
		// Если введено только время начала
		const [, rawStartTime] = input.match(singleTimeRegex)!;

		startTime = dayjs(rawStartTime, 'HH:mm', true);
		if (!startTime) {
			return err('Invalid time');
		}

		endTime = null;
	} else {
		return err('Invalid type of time');
	}

	return ok({ startTime, endTime });
}
