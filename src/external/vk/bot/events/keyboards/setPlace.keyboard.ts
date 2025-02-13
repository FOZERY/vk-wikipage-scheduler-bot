import { Keyboard } from 'vk-io';

export const setPlaceKeyboard = Keyboard.builder()
	.textButton({
		label: 'Штаб',
		payload: {
			place: 'Народный Бульвар, 3А',
		},
		color: Keyboard.PRIMARY_COLOR,
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
