import { Keyboard } from 'vk-io';

export const confirmDeleteKeyboard = Keyboard.builder()
	.textButton({
		label: 'Подтвердить',
		payload: {
			command: 'confirm',
		},
		color: Keyboard.POSITIVE_COLOR,
	})
	.row()
	.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'previous' },
	})
	.row()
	.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: 'leave' },
	});
