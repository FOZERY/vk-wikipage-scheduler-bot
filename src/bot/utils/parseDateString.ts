import dayjs from 'dayjs';
import { err, ok, Result } from 'neverthrow';
import { TZ_DEFAULT } from '../init/dayjs-setup.js';

export function parseDateString(
	dateString: string
): Result<Date, 'Invalid format of date string' | 'Invalid format of date'> {
	const dateRegex =
		/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/;

	if (!dateRegex.test(dateString)) {
		return err('Invalid format of date string');
	}

	let date = dayjs(dateString, 'DD.MM.YYYY', true);

	if (!date.isValid()) {
		return err('Invalid format of date');
	}

	date = date.tz(TZ_DEFAULT, true);

	return ok(date.toDate());
}
