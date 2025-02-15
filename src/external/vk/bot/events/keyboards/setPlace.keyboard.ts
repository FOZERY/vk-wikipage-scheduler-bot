import { Keyboard } from 'vk-io';

export enum SetPlaceKeyboardPayloadCommand {
	SetPlace = 'setPlace',
	Leave = 'leave',
	Previous = 'previous',
}

export type SetPlaceKeyboardPayload = {
	command: SetPlaceKeyboardPayloadCommand;
	place: string;
};

export const setPlaceKeyboard = Keyboard.builder()
	.textButton({
		label: 'Штаб',
		payload: {
			place: 'Народный Бульвар, 3А',
			command: SetPlaceKeyboardPayloadCommand.SetPlace,
		},
		color: Keyboard.PRIMARY_COLOR,
	})
	.row()
	.textButton({
		label: 'Назад',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetPlaceKeyboardPayloadCommand.Previous },
	})
	.row()
	.textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: { command: SetPlaceKeyboardPayloadCommand.Leave },
	});
