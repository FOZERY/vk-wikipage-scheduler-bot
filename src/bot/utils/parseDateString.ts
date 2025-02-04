import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

export function parseDateString(dateString: string) {
	const dateRegex =
		/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/;

	if (!dateRegex.test(dateString)) {
		return err('Invalid format of date string');
	}

	return ok(dayjs(dateString, 'DD.MM.YYYY'));
}
