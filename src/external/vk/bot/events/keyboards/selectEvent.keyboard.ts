import dayjs from 'dayjs';
import { Keyboard } from 'vk-io';
import { EventEntity } from '../../../../../modules/events/event.entity.js';

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
					startTime: event.startTime,
					endTime: event.endTime,
					organizer: event.organizer,
				},
			},
		});
		keyboard.row();
	});
	keyboard.row().textButton({
		label: 'Отмена',
		color: Keyboard.NEGATIVE_COLOR,
		payload: {
			command: 'leave',
		},
	});

	return keyboard;
};
