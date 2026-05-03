import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

declare global {
  var __pg: ReturnType<typeof postgres> | undefined;
}

const queryClient =
  global.__pg ??
  postgres(connectionString ?? "postgres://localhost/postgres", {
    prepare: false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") global.__pg = queryClient;

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
