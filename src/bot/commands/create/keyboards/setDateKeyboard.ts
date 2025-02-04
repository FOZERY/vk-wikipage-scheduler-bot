import dayjs from 'dayjs';
import 'dayjs/locale/ru	';
import { Keyboard } from 'vk-io';

export const setDateKeyboard = (() => {
	const keyboard = Keyboard.builder();

	let now = dayjs().startOf('D');
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			keyboard.textButton({
				label: now.locale('ru').format('DD.MM.YY'),
				color: Keyboard.POSITIVE_COLOR,
				payload: {
					date: now,
				},
			});
			now = now.add(1, 'day');
		}
		keyboard.row();
	}
	keyboard.textButton({
		label: `Отмена`,
		color: Keyboard.NEGATIVE_COLOR,
		payload: {
			command: `quit`,
		},
	});

	return keyboard;
})();
