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
			return err('Invalid time type');
		}

		if (startTime.diff(endTime) > 0) {
			return err(`startTime can't be more than endTime`);
		}

		startTimeString = startTime.format('HH:mm:ss');
		endTimeString = endTime.format('HH:mm:ss');
	} else if (singleTimeRegex.test(input)) {
		// Если введено только время начала
		const [, rawStartTime] = input.match(singleTimeRegex)!;

		const startTime = dayjs(rawStartTime, 'HH:mm', true);
		if (!startTime.isValid()) {
			return err('Invalid time type');
		}

		startTimeString = startTime.format('HH:mm:ss');
		endTimeString = null;
	} else {
		return err('Invalid time type');
	}

	return ok({ startTimeString, endTimeString });
}

export function timeRangeToStringOutput(
	startTime: string | null,
	endTime: string | null
): string {
	if (!startTime) {
		return 'Не указано';
	}

	if (!endTime) {
		return dayjs(startTime, 'HH:mm:ss').format('HH:mm');
	}

	return `${dayjs(startTime, 'HH:mm:ss').format('HH:mm')} - ${dayjs(
		endTime,
		'HH:mm:ss'
	).format('HH:mm')}`;
}
