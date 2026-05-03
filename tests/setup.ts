// Loaded before every test file. Pulls .env.local so RLS suite has creds.
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" }); // fallback
