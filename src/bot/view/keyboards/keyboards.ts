import { Keyboard } from 'vk-io';

export const menuKeyboard = Keyboard.builder()
	.textButton({
		label: 'Добавить в расписание',
		color: Keyboard.POSITIVE_COLOR,
		payload: {
			command: 'add',
		},
	})
	.row()
	.textButton({
		label: 'Изменить расписание',
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			command: 'change',
		},
	})
	.row()
	.textButton({
		label: 'Удалить из расписания',
		color: Keyboard.NEGATIVE_COLOR,
		payload: {
			command: 'delete',
		},
	})
	.row()
	.urlButton({
		label: 'Перейти к расписанию',
		url: 'https://www.google.com/',
	});
