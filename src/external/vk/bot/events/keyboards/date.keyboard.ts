import dayjs from 'dayjs';
import { Keyboard } from 'vk-io';

export const getDateKeyboard = () => {
	const keyboard = Keyboard.builder();

	let now = dayjs().tz().startOf('D');
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			keyboard.textButton({
				label: now.format('DD.MM.YY'),
				color: Keyboard.POSITIVE_COLOR,
				payload: {
					command: 'setDate',
					date: now.format('YYYY-MM-DD'),
				},
			});
			now = now.add(1, 'day');
		}
		keyboard.row();
	}

	return keyboard;
};
