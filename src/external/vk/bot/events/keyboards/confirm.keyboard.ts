import { Keyboard } from "vk-io";

export const getConfirmKeyboard = () =>
	Keyboard.builder().textButton({
		label: "Подтвердить",
		payload: {
			command: "confirm",
		},
		color: Keyboard.POSITIVE_COLOR,
	});

// export const confirmKeyboard = Keyboard.builder()
// 	.textButton({
// 		label: 'Подтвердить',
// 		payload: {
// 			command: 'confirm',
// 		},
// 		color: Keyboard.POSITIVE_COLOR,
// 	})
// 	.row()
// 	.textButton({
// 		label: 'Начать заново',
// 		payload: {
// 			command: 'restartScene',
// 		},
// 		color: Keyboard.NEGATIVE_COLOR,
// 	})
// 	.row()
// 	.textButton({
// 		label: 'Назад',
// 		color: Keyboard.NEGATIVE_COLOR,
// 		payload: { command: 'previous' },
// 	})
// 	.row()
// 	.textButton({
// 		label: 'Отмена',
// 		color: Keyboard.NEGATIVE_COLOR,
// 		payload: { command: 'leave' },
// 	});
