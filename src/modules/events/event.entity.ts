import dayjs from 'dayjs';
import { err, ok, Result } from 'neverthrow';

export interface EventEntityProps {
	id?: number;
	title: string;
	date: string;
	place: string;
	startTime: string | null;
	endTime: string | null;
	organizer: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export class EventEntity {
	private constructor(private props: EventEntityProps) {}

	public static create(props: EventEntityProps): Result<EventEntity, Error> {
		if (
			props.startTime &&
			!dayjs(props.startTime, 'HH:mm:ss', true).isValid()
		) {
			return err(
				Error(
					'Validation error: startTime must be in the format HH:mm:ss'
				)
			);
		}
		if (
			props.endTime &&
			!dayjs(props.endTime, 'HH:mm:ss', true).isValid()
		) {
			return err(
				Error(
					'Validation error: endTime must be in the format HH:mm:ss'
				)
			);
		}
		if (
			props.startTime &&
			props.endTime &&
			dayjs(props.startTime).isAfter(dayjs(props.endTime))
		) {
			return err(
				Error('Validation error: startTime must be before endTime')
			);
		}
		if (props.title.length > 255) {
			return err(
				Error(
					'Validation error: title must be less than 255 characters'
				)
			);
		}
		if (props.place.length > 255) {
			return err(
				Error(
					'Validation error: place must be less than 255 characters'
				)
			);
		}
		if (props.organizer && props.organizer.length > 255) {
			return err(
				Error(
					'Validation error: organizer must be less than 255 characters'
				)
			);
		}
		if (!dayjs(props.date, 'YYYY-MM-DD', true).isValid()) {
			return err(
				Error('Validation error: date must be in the format YYYY-MM-DD')
			);
		}
		return ok(new EventEntity(props));
	}

	get id(): number | undefined {
		return this.props.id;
	}

	get title(): string {
		return this.props.title;
	}

	get date(): string {
		return this.props.date;
	}

	get place(): string {
		return this.props.place;
	}

	get startTime(): string | null {
		return this.props.startTime;
	}

	get endTime(): string | null {
		return this.props.endTime;
	}

	get organizer(): string | null {
		return this.props.organizer;
	}

	get createdAt(): Date | undefined {
		return this.props.createdAt;
	}

	get updatedAt(): Date | undefined {
		return this.props.updatedAt;
	}

	public toJSON() {
		return {
			id: this.id,
			title: this.title,
			date: this.date,
			place: this.place,
			startTime: this.startTime,
			endTime: this.endTime,
			organizer: this.organizer,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public setTitle(title: string): Result<void, Error> {
		if (title.length > 255) {
			return err(
				Error(
					'Validation error: title must be less than 255 characters'
				)
			);
		}
		this.props.title = title;
		return ok(undefined);
	}

	public setDate(date: string): Result<void, Error> {
		if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
			return err(
				Error('Validation error: date must be in the format YYYY-MM-DD')
			);
		}
		this.props.date = date;
		return ok(undefined);
	}

	public setPlace(place: string): Result<void, Error> {
		if (place.length > 255) {
			return err(
				Error(
					'Validation error: place must be less than 255 characters'
				)
			);
		}
		this.props.place = place;
		return ok(undefined);
	}

	public setStartTime(startTime: string | null): Result<void, Error> {
		if (startTime && !dayjs(startTime, 'HH:mm:ss', true).isValid()) {
			return err(
				Error(
					'Validation error: startTime must be in the format HH:mm:ss'
				)
			);
		}
		if (
			startTime &&
			this.props.endTime &&
			dayjs(startTime).isAfter(dayjs(this.props.endTime))
		) {
			return err(
				Error('Validation error: startTime must be before endTime')
			);
		}
		this.props.startTime = startTime;
		return ok(undefined);
	}

	public setEndTime(endTime: string | null): Result<void, Error> {
		if (endTime && !dayjs(endTime, 'HH:mm:ss', true).isValid()) {
			return err(
				Error(
					'Validation error: endTime must be in the format HH:mm:ss'
				)
			);
		}
		if (
			endTime &&
			this.props.startTime &&
			dayjs(this.props.startTime).isAfter(dayjs(endTime))
		) {
			return err(
				Error('Validation error: startTime must be before endTime')
			);
		}
		this.props.endTime = endTime;
		return ok(undefined);
	}

	public setOrganizer(organizer: string | null): Result<void, Error> {
		if (organizer && organizer.length > 255) {
			return err(
				Error(
					'Validation error: organizer must be less than 255 characters'
				)
			);
		}
		this.props.organizer = organizer;
		return ok(undefined);
	}
}
