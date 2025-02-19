import {
	date,
	integer,
	pgTable,
	text,
	time,
	timestamp,
} from 'drizzle-orm/pg-core';

export const eventsTable = pgTable('events', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	title: text('title').notNull(),
	date: date('date').notNull(),
	start_time: time('start_time'),
	end_time: time('end_time'),
	organizer: text('organizer'),
	place: text('place').notNull(),
	last_updater_id: text('last_updater_id').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
});

export type InsertEvent = typeof eventsTable.$inferInsert;
export type SelectEvent = typeof eventsTable.$inferSelect;
