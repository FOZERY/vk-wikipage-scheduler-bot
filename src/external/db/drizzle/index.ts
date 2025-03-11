import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { type PostgresJsQueryResultHKT, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ENV } from "../../../config.js";

const client = postgres(ENV.DATABASE_URL, { prepare: false });
export const db = drizzle({ client });
export type DrizzleDBType = typeof db;
export type DrizzleTransctionType = PgTransaction<
	PostgresJsQueryResultHKT,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;
