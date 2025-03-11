import { Keyboard } from "vk-io";
import { ENV } from "../../../../../config.js";

export const mainMenuKeyboard = Keyboard.builder()
	.textButton({
		label: "Добавить в расписание",
		color: Keyboard.POSITIVE_COLOR,
		payload: {
			command: "addEvent",
		},
	})
	.row()
	.textButton({
		label: "Изменить расписание",
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			command: "updateEvent",
		},
	})
	.row()
	.textButton({
		label: "Удалить из расписания",
		color: Keyboard.NEGATIVE_COLOR,
		payload: {
			command: "deleteEvent",
		},
	})
	.row()
	.urlButton({
		label: "Перейти к расписанию",
		url: ENV.PAGE_URL,
	});
