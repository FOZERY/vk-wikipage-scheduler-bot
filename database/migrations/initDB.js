import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync(
	path.resolve(
		import.meta.dirname,
		"..",
		"storage",
		process.env.NODE_ENV.trim() === "production"
			? "database.db"
			: "database_test.db"
	)
);

database.exec(`
	CREATE TABLE IF NOT EXISTS events 
	(id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	date TEXT NOT NULL,
	start_time TEXT,
	end_time TEXT,
	organizer TEXT,
	place TEXT,	
	created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

database.exec(`
	CREATE TABLE IF NOT EXISTS admitted_users
	(id INTEGER PRIMARY KEY AUTOINCREMENT,
	vk_user_id INTEGER UNIQUE)`);
