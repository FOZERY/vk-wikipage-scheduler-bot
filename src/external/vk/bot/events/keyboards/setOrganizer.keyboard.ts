import { Keyboard } from 'vk-io';

export enum SetOrganizerKeyboardPayloadCommand {
	SetNoOrganizer = 'setNoOrganizer',
	Leave = 'leave',
	Previous = 'previous',
}

export type SetOrganizerKeyboardPayload = {
	command: SetOrganizerKeyboardPayloadCommand;
};

export const setOgranizerKeyboard = Keyboard.builder()
	.textButton({
		label: 'Без организатора',
		color: Keyboard.PRIMARY_COLOR,
		payload: {
			command: SetOrganizerKeyboardPayloadCommand.SetNoOrganizer,
		},
	})
	.row()
	.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetOrganizerKeyboardPayloadCommand.Previous },
	})
	.row()
	.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetOrganizerKeyboardPayloadCommand.Leave },
	});
