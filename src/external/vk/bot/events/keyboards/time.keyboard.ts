import dayjs from "dayjs";
import { Keyboard } from "vk-io";

// Функция для создания кнопок с временем
const createTimeButtons = (startHour: number, endHour: number) => {
	const buttons = [];
	for (let hour = startHour; hour <= endHour; hour++) {
		const time = dayjs().hour(hour).startOf("h");
		const timeStringLabel = time.format("HH:mm");
		const timeStringPayload = time.format("HH:mm:ss");
		buttons.push(
			Keyboard.textButton({
				label: timeStringLabel,
				payload: {
					command: "setTime",
					timeRange: {
						startTime: timeStringPayload,
						endTime: null,
					},
				},
			})
		);
	}
	return buttons;
};

export const getTimeKeyboard = () =>
	Keyboard.keyboard([
		createTimeButtons(0, 4),
		createTimeButtons(5, 9),
		createTimeButtons(10, 14),
		createTimeButtons(15, 19),
		createTimeButtons(20, 23),
		Keyboard.textButton({
			label: "Без времени",
			color: Keyboard.PRIMARY_COLOR,
			payload: {
				timeRange: null,
				command: "setTime",
			},
		}),
	]);
