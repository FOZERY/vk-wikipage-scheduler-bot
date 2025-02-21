import { Nullable } from '../../../../../shared/types/common.types.js';

export type ViewTimeRange = Nullable<{
	startTime: string; // "HH:mm:ss"
	endTime: Nullable<string>; // "HH:mm:ss"
}>;

export type ViewEvent = {
	id?: number;
	date: string;
	place: string;
	title: string;
	timeRange: ViewTimeRange;
	organizer: Nullable<string>;
	lastUpdaterId: number;
	updatedAt?: Date;
	createdAt?: Date;
};
