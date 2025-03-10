import dayjs from "dayjs";
import { err, ok, Result } from "neverthrow";
import { ValidationError } from "../../shared/errors.js";
import { Nullable } from "../../shared/types/common.types.js";

export interface EventEntityProps {
	id?: number;
	title: string;
	date: string;
	place: string;
	timeRange: Nullable<{
		startTime: string;
		endTime: Nullable<string>;
	}>;
	organizer: Nullable<string>;
	lastUpdaterId: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export type EventEntityTimeRange = Nullable<{
	startTime: string;
	endTime: string;
}>;

export class EventEntity {
	private _id?: number;
	private _title: string;
	private _date: string;
	private _place: string;
	private _timeRange: EventEntityTimeRange;
	private _organizer: Nullable<string>;
	private _lastUpdaterId: number;
	private _createdAt?: Date;
	private _updatedAt?: Date;

	private constructor(props: EventEntityProps) {
		this._id = props.id;
		this._title = props.title;
		this._date = props.date;
		this._place = props.place;
		this._timeRange = props.timeRange
			? {
					startTime: props.timeRange.startTime,
					endTime: props.timeRange.endTime
						? props.timeRange.endTime
						: dayjs(props.timeRange.startTime, "HH:mm:ss")
								.add(15, "minute")
								.format("HH:mm:ss"),
				}
			: null;
		this._organizer = props.organizer;
		this._lastUpdaterId = props.lastUpdaterId;
		this._createdAt = props.createdAt;
		this._updatedAt = props.updatedAt;
	}

	public static create(
		props: EventEntityProps
	): Result<EventEntity, ValidationError> {
		if (
			props.timeRange &&
			!dayjs(props.timeRange.startTime, "HH:mm:ss", true).isValid()
		) {
			return err(
				new ValidationError(
					"startTime must be in the format HH:mm:ss",
					props.timeRange.startTime,
					"HH:mm:ss"
				)
			);
		}
		if (
			props.timeRange &&
			props.timeRange.endTime &&
			!dayjs(props.timeRange.endTime, "HH:mm:ss", true).isValid()
		) {
			return err(
				new ValidationError(
					"endTime must be in the format HH:mm:ss",
					props.timeRange.endTime,
					"HH:mm:ss"
				)
			);
		}
		if (
			props.timeRange &&
			props.timeRange.endTime &&
			dayjs(props.timeRange.startTime).isAfter(
				dayjs(props.timeRange.endTime)
			)
		) {
			return err(
				new ValidationError(
					"startTime must be before endTime",
					{
						startTime: props.timeRange.startTime,
						endTime: props.timeRange.endTime,
					},
					"startTime < endTime"
				)
			);
		}

		if (props.title.length > 255) {
			return err(
				new ValidationError(
					"title must be less than 255 characters",
					props.title,
					"< 255"
				)
			);
		}
		if (props.place.length > 255) {
			return err(
				new ValidationError(
					"place must be less than 255 characters",
					props.place,
					"< 255"
				)
			);
		}
		if (props.lastUpdaterId <= 0) {
			return err(
				new ValidationError(
					"lastUpdaterId must be greater than 0",
					props.lastUpdaterId,
					"> 0"
				)
			);
		}
		if (props.organizer && props.organizer.length > 255) {
			return err(
				new ValidationError(
					"organizer must be less than 255 characters",
					props.organizer,
					"< 255"
				)
			);
		}
		if (!dayjs(props.date, "YYYY-MM-DD", true).isValid()) {
			return err(
				new ValidationError(
					"date must be in the format YYYY-MM-DD",
					props.date,
					"YYYY-MM-DD"
				)
			);
		}

		return ok(new EventEntity(props));
	}

	get id(): number | undefined {
		return this._id;
	}

	get title(): string {
		return this._title;
	}

	get date(): string {
		return this._date;
	}

	get place(): string {
		return this._place;
	}

	get timeRange() {
		return this._timeRange;
	}

	get organizer(): string | null {
		return this._organizer;
	}

	get lastUpdaterId(): number {
		return this._lastUpdaterId;
	}

	get createdAt(): Date | undefined {
		return this._createdAt;
	}

	get updatedAt(): Date | undefined {
		return this._updatedAt;
	}

	public toJSON() {
		return {
			id: this.id,
			title: this.title,
			date: this.date,
			place: this.place,
			timeRange: this.timeRange,
			organizer: this.organizer,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public setTitle(title: string): Result<void, ValidationError> {
		if (title.length > 255) {
			return err(
				new ValidationError(
					"title must be less than 255 characters",
					title,
					"< 255"
				)
			);
		}
		this._title = title;
		return ok(undefined);
	}

	public setDate(date: string): Result<void, ValidationError> {
		if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
			return err(
				new ValidationError(
					"date must be in the format YYYY-MM-DD",
					date,
					"YYYY-MM-DD"
				)
			);
		}
		this._date = date;
		return ok(undefined);
	}

	public setPlace(place: string): Result<void, ValidationError> {
		if (place.length > 255) {
			return err(
				new ValidationError(
					"place must be less than 255 characters",
					place,
					"< 255"
				)
			);
		}
		this._place = place;
		return ok(undefined);
	}

	public setTimeRange(
		timeRange: Nullable<{
			startTime: string;
			endTime: Nullable<string>;
		}>
	): Result<void, ValidationError> {
		if (timeRange === null) {
			this._timeRange = null;
			return ok(undefined);
		}

		if (!dayjs(timeRange.startTime, "HH:mm:ss", true).isValid()) {
			return err(
				new ValidationError(
					"startTime must be in the format HH:mm:ss",
					timeRange.startTime,
					"HH:mm:ss"
				)
			);
		}

		if (
			timeRange.endTime &&
			!dayjs(timeRange.endTime, "HH:mm:ss", true).isValid()
		) {
			return err(
				new ValidationError(
					"endTime must be in the format HH:mm:ss",
					timeRange.endTime,
					"HH:mm:ss"
				)
			);
		}

		if (
			timeRange.endTime &&
			dayjs(timeRange.startTime).isAfter(dayjs(timeRange.endTime))
		) {
			return err(
				new ValidationError(
					"startTime must be before endTime",
					{
						startTime: timeRange.startTime,
						endTime: timeRange.endTime,
					},
					"startTime < endTime"
				)
			);
		}

		if (!timeRange.endTime) {
			timeRange.endTime = dayjs(timeRange.startTime, "HH:mm:ss")
				.add(15, "minutes")
				.format("HH:mm:ss");
		}

		this._timeRange = {
			startTime: timeRange.startTime,
			endTime: timeRange.endTime,
		};

		return ok(undefined);
	}

	public setOrganizer(
		organizer: string | null
	): Result<void, ValidationError> {
		if (organizer && organizer.length > 255) {
			return err(
				new ValidationError(
					"organizer must be less than 255 characters",
					organizer,
					"< 255"
				)
			);
		}
		this._organizer = organizer;
		return ok(undefined);
	}

	public setLastUpdaterId(id: number): Result<void, ValidationError> {
		if (id <= 0) {
			return err(
				new ValidationError(
					"lastUpdaterId must be greater than 0",
					id,
					"> 0"
				)
			);
		}
		this._lastUpdaterId = id;
		return ok(undefined);
	}
}
