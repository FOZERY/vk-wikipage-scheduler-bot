import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

export function parseTimeString(input: string) {
	const timeRangeRegex = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;
	const singleTimeRegex = /(\d{2}:\d{2})/;

	let startTimeString, endTimeString: string | null;

	if (timeRangeRegex.test(input)) {
		// Если введен промежуток времени
		const [, rawStartTime, rawEndTime] = input.match(timeRangeRegex)!;

		const startTime = dayjs(rawStartTime, 'HH:mm', true);
		const endTime = dayjs(rawEndTime, 'HH:mm', true);

		if (!endTime.isValid() || !startTime.isValid()) {
			return err('Invalid time');
		}

		startTimeString = startTime.format('HH:mm');
		endTimeString = endTime.format('HH:mm');
	} else if (singleTimeRegex.test(input)) {
		// Если введено только время начала
		const [, rawStartTime] = input.match(singleTimeRegex)!;

		const startTime = dayjs(rawStartTime, 'HH:mm', true);
		if (!startTime.isValid()) {
			return err('Invalid time');
		}

		startTimeString = startTime.format('HH:mm');
		endTimeString = null;
	} else {
		return err('Invalid type of time');
	}

	return ok({ startTimeString, endTimeString });
}
