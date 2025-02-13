import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

export function convertRussianDateStringToDefaultFormat(dateString: string) {
	const dateRegex =
		/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19\d{2}|20\d{2})$/;

	if (!dateRegex.test(dateString)) {
		return err('Invalid format of input date');
	}

	let date = dayjs(dateString, 'DD.MM.YYYY', true);

	if (!date.isValid()) {
		return err('Invalid format of input date');
	}

	return ok(date.format('YYYY-MM-DD'));
}

export function convertDateStringToRussianFormat(dateString: string) {
	const date = dayjs(dateString, 'YYYY-MM-DD', true);

	if (!date.isValid()) {
		return err('Invalid format of input date');
	}

	return ok(date.format('DD.MM.YYYY'));
}
