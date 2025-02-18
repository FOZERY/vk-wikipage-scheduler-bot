import { Keyboard } from 'vk-io';

export const getOrganizerKeyboard = () =>
	Keyboard.builder().textButton({
		label: 'Без организатора',
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			command: 'setNoOrganizer',
		},
	});
