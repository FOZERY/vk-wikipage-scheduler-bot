import { IKeyboardTextButtonOptions, Keyboard, KeyboardBuilder } from 'vk-io';

export enum NavigationButtonsCommand {
	Previous = 'previous',
	Leave = 'leave',
}

export const previousButtonOptions: IKeyboardTextButtonOptions = {
	label: `Назад`,
	color: Keyboard.NEGATIVE_COLOR,
	payload: {
		command: NavigationButtonsCommand.Previous,
	},
};

export const leaveButtonOptions: IKeyboardTextButtonOptions = {
	label: `Отмена`,
	color: Keyboard.NEGATIVE_COLOR,
	payload: {
		command: NavigationButtonsCommand.Leave,
	},
};

export function attachTextButtonToKeyboard(
	keyboard: KeyboardBuilder,
	buttonOptions: IKeyboardTextButtonOptions[] | IKeyboardTextButtonOptions
) {
	if (Array.isArray(buttonOptions)) {
		buttonOptions.forEach((buttonOption) =>
			keyboard.row().textButton(buttonOption)
		);
	} else {
		keyboard.row().textButton(buttonOptions);
	}

	return keyboard;
}
