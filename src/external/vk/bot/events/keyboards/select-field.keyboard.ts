import { Keyboard } from 'vk-io';

export enum SelectField {
	Date = 'date',
	Time = 'time',
	Place = 'place',
	Title = 'title',
	Organizer = 'organizer',
}

export enum SelectFieldKeyboardCommand {
	SelectField = 'selectField',
	Previous = 'previous',
	Leave = 'leave',
	Confirm = 'confirm',
}

export type SelectFieldKeyboardPayload = {
	command: string;
	field: SelectField;
};

export const selectFieldOrConfirmKeyboard = Keyboard.builder()
	.textButton({
		label: 'Дату',
		color: Keyboard.PRIMARY_COLOR,
		payload: { command: 'selectField', field: SelectField.Date },
	})
	.textButton({
		label: 'Время',
		color: Keyboard.PRIMARY_COLOR,
		payload: { command: 'selectField', field: SelectField.Time },
	})
	.row()
	.textButton({
		label: 'Место',
		color: Keyboard.PRIMARY_COLOR,
		payload: { command: 'selectField', field: SelectField.Place },
	})
	.textButton({
		label: 'Название',
		color: Keyboard.PRIMARY_COLOR,
		payload: { command: 'selectField', field: SelectField.Title },
	})
	.row()
	.textButton({
		label: 'Организатора',
		color: Keyboard.PRIMARY_COLOR,
		payload: { command: 'selectField', field: SelectField.Organizer },
	})
	.row()
	.textButton({
		label: 'Подтвердить',
		color: Keyboard.POSITIVE_COLOR,
		payload: { command: 'confirm' },
	});
