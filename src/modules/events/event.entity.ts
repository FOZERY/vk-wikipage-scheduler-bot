import dayjs from 'dayjs';
import { create } from 'domain';
import { err, ok, Result } from 'neverthrow';
import { createValidationError, ValidationError } from '../../shared/errors.js';

export interface EventEntityProps {
	id?: number;
	title: string;
	date: string;
	place: string;
	startTime: string | null;
	endTime: string | null;
	organizer: string | null;
	lastUpdaterId: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export class EventEntity {
	private constructor(private props: EventEntityProps) {}

	public static create(
		props: EventEntityProps
	): Result<EventEntity, ValidationError> {
		if (
			props.startTime &&
			!dayjs(props.startTime, 'HH:mm:ss', true).isValid()
		) {
			return err(
				createValidationError(
					'startTime must be in the format HH:mm:ss',
					props.startTime,
					'HH:mm:ss'
				)
			);
		}
		if (
			props.endTime &&
			!dayjs(props.endTime, 'HH:mm:ss', true).isValid()
		) {
			return err(
				createValidationError(
					'endTime must be in the format HH:mm:ss',
					props.endTime,
					'HH:mm:ss'
				)
			);
		}
		if (
			props.startTime &&
			props.endTime &&
			dayjs(props.startTime).isAfter(dayjs(props.endTime))
		) {
			return err(
				createValidationError(
					'startTime must be before endTime',
					{ startTime: props.startTime, endTime: props.endTime },
					'startTime < endTime'
				)
			);
		}
		if (props.title.length > 255) {
			return err(
				createValidationError(
					'title must be less than 255 characters',
					props.title,
					'< 255'
				)
			);
		}
		if (props.place.length > 255) {
			return err(
				createValidationError(
					'place must be less than 255 characters',
					props.place,
					'< 255'
				)
			);
		}
		if (props.lastUpdaterId.length > 255) {
			return err(
				createValidationError(
					'lastUpdaterId must be less than 255 characters',
					props.lastUpdaterId,
					'< 255'
				)
			);
		}
		if (props.organizer && props.organizer.length > 255) {
			return err(
				createValidationError(
					'organizer must be less than 255 characters',
					props.organizer,
					'< 255'
				)
			);
		}
		if (!dayjs(props.date, 'YYYY-MM-DD', true).isValid()) {
			return err(
				createValidationError(
					'date must be in the format YYYY-MM-DD',
					props.date,
					'YYYY-MM-DD'
				)
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

	get lastUpdaterId(): string {
		return this.props.lastUpdaterId;
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

	public setTitle(title: string): Result<void, ValidationError> {
		if (title.length > 255) {
			return err(
				createValidationError(
					'title must be less than 255 characters',
					title,
					'< 255'
				)
			);
		}
		this.props.title = title;
		return ok(undefined);
	}

	public setDate(date: string): Result<void, ValidationError> {
		if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
			return err(
				createValidationError(
					'date must be in the format YYYY-MM-DD',
					date,
					'YYYY-MM-DD'
				)
			);
		}
		this.props.date = date;
		return ok(undefined);
	}

	public setPlace(place: string): Result<void, ValidationError> {
		if (place.length > 255) {
			return err(
				createValidationError(
					'place must be less than 255 characters',
					place,
					'< 255'
				)
			);
		}
		this.props.place = place;
		return ok(undefined);
	}

	public setStartTime(
		startTime: string | null
	): Result<void, ValidationError> {
		if (startTime && !dayjs(startTime, 'HH:mm:ss', true).isValid()) {
			return err(
				createValidationError(
					'startTime must be in the format HH:mm:ss',
					startTime,
					'HH:mm:ss'
				)
			);
		}
		if (
			startTime &&
			this.props.endTime &&
			dayjs(startTime).isAfter(dayjs(this.props.endTime))
		) {
			return err(
				createValidationError(
					'startTime must be before endTime',
					{
						startTime: startTime,
						endTime: this.props.endTime,
					},
					'startTime < endTime'
				)
			);
		}
		this.props.startTime = startTime;

		return ok(undefined);
	}

	public setEndTime(endTime: string | null): Result<void, ValidationError> {
		if (endTime && !dayjs(endTime, 'HH:mm:ss', true).isValid()) {
			return err(
				createValidationError(
					'endTime must be in the format HH:mm:ss',
					endTime,
					'HH:mm:ss'
				)
			);
		}

		if (
			endTime &&
			this.props.startTime &&
			dayjs(this.props.startTime).isAfter(dayjs(endTime))
		) {
			return err(
				createValidationError(
					'startTime must be before endTime',
					{
						startTime: this.props.startTime,
						endTime,
					},
					'startTime < endTime'
				)
			);
		}
		this.props.endTime = endTime;
		return ok(undefined);
	}

	public setOrganizer(
		organizer: string | null
	): Result<void, ValidationError> {
		if (organizer && organizer.length > 255) {
			return err(
				createValidationError(
					'organizer must be less than 255 characters',
					organizer,
					'< 255'
				)
			);
		}
		this.props.organizer = organizer;
		return ok(undefined);
	}

	public setLastUpdaterId(id: string): Result<void, ValidationError> {
		if (id.length > 255) {
			return err(
				createValidationError(
					'lastUpdaterId must be less than 255 characters',
					id,
					'< 255'
				)
			);
		}
		this.props.lastUpdaterId = id;
		return ok(undefined);
	}
}
