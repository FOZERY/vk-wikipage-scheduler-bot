import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase.types.js';

export const supabase = createClient<Database>(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_API_KEY as string
);
