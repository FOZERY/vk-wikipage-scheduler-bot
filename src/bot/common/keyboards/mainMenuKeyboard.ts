import { Keyboard } from 'vk-io';

export const mainMenuKeyboard = Keyboard.builder()
	.textButton({
		label: 'Добавить в расписание',
		color: Keyboard.POSITIVE_COLOR,
		payload: {
			command: 'createEvent',
		},
	})
	.row()
	.textButton({
		label: 'Изменить расписание',
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			command: 'updateEvent',
		},
	})
	.row()
	.textButton({
		label: 'Удалить из расписания',
		color: Keyboard.NEGATIVE_COLOR,
		payload: {
			command: 'deleteEvent',
		},
	})
	.row()
	.urlButton({
		label: 'Перейти к расписанию',
		url: 'https://www.google.com/',
	});
