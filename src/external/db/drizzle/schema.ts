import {
	customType,
	date,
	integer,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';

export type TimeRange = {
	startTime: {
		strict: boolean;
		value: string;
	};
	endTime: {
		strict: boolean;
		value: string;
	};
};

const timeRange = customType<{
	data: TimeRange;
	notNull: false;
	driverData: string;
}>({
	dataType() {
		return 'timerange';
	},
	toDriver(range: TimeRange): string {
		const startTime = range.startTime.strict
			? '[' + range.startTime.value
			: '(' + range.startTime.value;
		const endTime = range.endTime.strict
			? range.endTime.value + ']'
			: range.endTime.value + ')';
		return `${startTime}, ${endTime}`;
	},
	fromDriver(value: string): TimeRange {
		const [startTimeWithBoundary, endTimeWithBoundary] = value.split(',');
		const startTime = {
			strict: startTimeWithBoundary[0] === '[',
			value: startTimeWithBoundary.slice(1),
		};
		const endTime = {
			strict: endTimeWithBoundary.at(-1) === ']',
			value: endTimeWithBoundary.slice(0, -1),
		};
		return {
			startTime,
			endTime,
		};
	},
});

export const eventsTable = pgTable('events', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	title: text('title').notNull(),
	date: date('date').notNull(),
	time_range: timeRange('time_range'),
	organizer: text('organizer'),
	place: text('place').notNull(),
	last_updater_id: integer('last_updater_id').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
});

export type InsertEvent = typeof eventsTable.$inferInsert;
export type SelectEvent = typeof eventsTable.$inferSelect;
