import { Keyboard } from 'vk-io';

export enum SetTitleKeyboardPayloadCommand {
	Previous = 'previous',
	Leave = 'leave',
}

export type SetTitleKeyboardPayload = {
	command: SetTitleKeyboardPayloadCommand;
};

export const setTitleKeyboard = Keyboard.builder()
	.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetTitleKeyboardPayloadCommand.Previous },
	})
	.row()
	.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetTitleKeyboardPayloadCommand.Leave },
	});
