import { Keyboard } from 'vk-io';

export const setOgranizerKeyboard = Keyboard.builder()
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
