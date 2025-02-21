import dayjs from 'dayjs';
import { Keyboard } from 'vk-io';
import { EventEntity } from '../../../../../modules/events/event.entity.js';
import { ViewEvent } from '../../shared/types/common.types.js';

export type SelectEventKeyboardPayload = {
	command: string;
	event: ViewEvent;
};

export const selectEventKeyboard = (events: EventEntity[]) => {
	const keyboard = Keyboard.builder();

	events = events.slice(0, 5);
	events.forEach((event) => {
		let label = `${dayjs(event.date, 'YYYY-MM-DD').format(
			'DD.MM.YYYY'
		)} - ${event.title}, ${event.place}`;
		label = label.length > 40 ? label.slice(0, 37) + '...' : label;

		keyboard.textButton({
			label: label,
			color: Keyboard.POSITIVE_COLOR,
			payload: {
				command: 'selectEvent',
				event: {
					id: event.id,
					title: event.title,
					date: event.date,
					place: event.place,
					timeRange: event.timeRange,
					organizer: event.organizer,
					lastUpdaterId: event.lastUpdaterId,
				},
			} as SelectEventKeyboardPayload,
		});
		keyboard.row();
	});

	return keyboard;
};
