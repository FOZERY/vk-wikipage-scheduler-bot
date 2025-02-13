import { Keyboard } from 'vk-io';

export const leaveKeyabord = Keyboard.builder().textButton({
	label: 'Отмена',
	color: Keyboard.NEGATIVE_COLOR,
	payload: {
		command: 'leave',
	},
});
