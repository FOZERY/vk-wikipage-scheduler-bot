import dayjs from "dayjs";
import { Keyboard } from "vk-io";
import type { EventEntity } from "../../../../../modules/events/event.entity.js";

export type SelectEventKeyboardPayload = {
	command: string;
	eventId: number;
};

export const selectEventKeyboard = (events: EventEntity[]) => {
	const keyboard = Keyboard.builder();

	events.slice(0, 5).forEach((event) => {
		let label = `${dayjs(event.date, "YYYY-MM-DD").format(
			"DD.MM.YYYY"
		)} - ${event.title}, ${event.place}`;
		label = label.length > 40 ? `${label.slice(0, 37)}...` : label;

		keyboard.textButton({
			label: label,
			color: Keyboard.POSITIVE_COLOR,
			payload: {
				command: "selectEvent",
				eventId: event.id,
			} as SelectEventKeyboardPayload,
		});
		keyboard.row();
	});

	return keyboard;
};
