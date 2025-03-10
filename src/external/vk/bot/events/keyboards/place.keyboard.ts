import { Keyboard } from "vk-io";

export const getPlaceKeyboard = () =>
	Keyboard.builder().textButton({
		label: "Штаб",
		payload: {
			place: "Народный Бульвар, 3А",
			command: "setPlace",
		},
		color: Keyboard.PRIMARY_COLOR,
	});
