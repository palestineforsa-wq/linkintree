import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { STORAGE_STATE_PATH } from "./fixtures";

async function main() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL || !SERVICE) return;

  let fixture: { userId: string } | null = null;
  try {
    const raw = await readFile(
      path.join(".playwright", "fixture.json"),
      "utf8",
    );
    fixture = JSON.parse(raw);
  } catch {
    // Setup didn't complete; nothing to clean.
    return;
  }
  if (!fixture?.userId) return;

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await admin.auth.admin.deleteUser(fixture.userId).catch(() => {});

  // Best-effort cleanup of artifacts. Storage state is fine to leave but
  // tidier to remove between runs.
  await rm(STORAGE_STATE_PATH, { force: true }).catch(() => {});
  await rm(path.join(".playwright", "fixture.json"), { force: true }).catch(
    () => {},
  );
}

export default main;
