import { createClient } from '@supabase/supabase-js';
import { Queue } from './supabase-queue.types.js';

export const supabaseQueue = createClient<Queue>(
	process.env.SUPABASE_URL ?? '',
	process.env.SUPABASE_API_KEY ?? '',
	{
		db: {
			schema: 'pgmq_public',
		},
	}
);
