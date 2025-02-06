import dayjs, { Dayjs } from 'dayjs';
import { Keyboard } from 'vk-io';

type TimePayload = {
	time: {
		startTime: string | null;
		endTime: string | null;
	};
};

// Функция для создания кнопок с временем
const createTimeButtons = (startHour: number, endHour: number) => {
	const buttons = [];
	for (let hour = startHour; hour <= endHour; hour++) {
		const time = dayjs().hour(hour).startOf('h');
		const timeString = time.format('HH:mm');
		buttons.push(
			Keyboard.textButton({
				label: timeString,
				payload: {
					time: { startTime: timeString, endTime: null },
				} as TimePayload,
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
		payload: { time: { startTime: null, endTime: null } } as TimePayload,
	}),
	Keyboard.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'previous' },
	}),
	Keyboard.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'leave' },
	}),
]);
