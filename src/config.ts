import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	LONGPOLL_TOKEN: z.string(),
	USER_TOKEN: z.string(),
	GROUP_ID: z.coerce.number(),
	PAGE_ID: z.coerce.number(),
	PAGE_URL: z.string().url(),
	DATABASE_URL: z.string().url(),
	SUPABASE_URL: z.string().url(),
	SUPABASE_API_KEY: z.string(),
	LOGTAIL_TOKEN: z.string(),
	LOGTAIL_URL: z.string().url(),
	LOG_TO_LOGTAIL: z.boolean(),
});

export const ENV = envSchema.parse(process.env);
