import dayjs from 'dayjs';
import { Keyboard } from 'vk-io';

export enum SetDateKeyboardCommand {
	SetDate = 'setDate',
	Leave = 'leave',
}

export type SetDateKeyboardPayload = {
	date: string;
	command: string;
};

export const setDateKeyboard = (() => {
	const keyboard = Keyboard.builder();

	let now = dayjs().tz().startOf('D');
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			keyboard.textButton({
				label: now.format('DD.MM.YY'),
				color: Keyboard.POSITIVE_COLOR,
				payload: {
					command: SetDateKeyboardCommand.SetDate,
					date: now.format('YYYY-MM-DD'),
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
			command: SetDateKeyboardCommand.Leave,
		},
	});

	return keyboard;
})();
