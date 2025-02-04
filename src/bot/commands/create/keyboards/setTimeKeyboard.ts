import { Keyboard } from 'vk-io';

// Функция для создания кнопок с временем
const createTimeButtons = (startHour: number, endHour: number) => {
	const buttons = [];
	for (let hour = startHour; hour <= endHour; hour++) {
		const time = `${String(hour).padStart(2, '0')}:00`; // Форматируем время в "HH:00"
		buttons.push(
			Keyboard.textButton({
				label: time,
				payload: { time: { startTime: time, endTime: null } },
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
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'back' },
	}),
	Keyboard.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'quit' },
	}),
]);
