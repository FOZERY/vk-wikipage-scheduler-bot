import { DatabaseSync } from 'node:sqlite';
import path from 'path';

export const database = new DatabaseSync(
	path.resolve(
		import.meta.dirname,
		'..',
		'..',
		'..',
		'database',
		'storage',
		process.env.NODE_ENV!.trim() === 'production'
			? 'database.db'
			: 'database_test.db'
	)
);
