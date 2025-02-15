import dayjs, { Dayjs } from 'dayjs';
import { Keyboard } from 'vk-io';

export enum SetTimeKeyboardPayloadCommand {
	SetTime = 'setTime',
	Leave = 'leave',
	Previous = 'previous',
}

export type SetTimeKeyboardPayload = {
	command: SetTimeKeyboardPayloadCommand;
	startTime: string | null;
	endTime: string | null;
};

// Функция для создания кнопок с временем
const createTimeButtons = (startHour: number, endHour: number) => {
	const buttons = [];
	for (let hour = startHour; hour <= endHour; hour++) {
		const time = dayjs().hour(hour).startOf('h');
		const timeStringLabel = time.format('HH:mm');
		const timeStringPayload = time.format('HH:mm:ss');
		buttons.push(
			Keyboard.textButton({
				label: timeStringLabel,
				payload: {
					command: SetTimeKeyboardPayloadCommand.SetTime,
					startTime: timeStringPayload,
					endTime: null,
				} as SetTimeKeyboardPayload,
			})
		);
	}
	return buttons;
};

export const setTimeKeyboard = Keyboard.keyboard([
	createTimeButtons(0, 4),
	createTimeButtons(5, 9),
	createTimeButtons(10, 14),
	createTimeButtons(15, 19),
	createTimeButtons(20, 23),
	Keyboard.textButton({
		label: 'Без времени',
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			startTime: null,
			endTime: null,
			command: SetTimeKeyboardPayloadCommand.SetTime,
		} as SetTimeKeyboardPayload,
	}),
	Keyboard.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetTimeKeyboardPayloadCommand.Previous },
	}),
	Keyboard.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetTimeKeyboardPayloadCommand.Leave },
	}),
]);
