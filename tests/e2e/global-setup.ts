import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  FIXTURE_EMAIL_KEY,
  FIXTURE_PASSWORD_KEY,
  FIXTURE_USERNAME_KEY,
  FIXTURE_USER_KEY,
  STORAGE_STATE_PATH,
  generateFixtureCredentials,
} from "./fixtures";

// Creates a fixture user once per Playwright run, signs them in via the UI,
// and persists session cookies to STORAGE_STATE_PATH. Tests reuse the
// storage so each test starts authenticated without a login round-trip.

async function main() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!URL || !SERVICE) {
    throw new Error(
      "global-setup requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const creds = generateFixtureCredentials();
  const { data, error } = await admin.auth.admin.createUser({
    email: creds.email,
    password: creds.password,
    email_confirm: true,
    user_metadata: { username: creds.username },
  });
  if (error || !data.user) {
    throw new Error(`fixture user creation failed: ${error?.message}`);
  }
  const userId = data.user.id;

  // Sign in via UI so middleware-issued cookies are correctly captured.
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${SITE}/login`, { waitUntil: "networkidle" });
  // LoginForm is Suspense-wrapped; pre-hydration a submit would GET-submit
  // and leak the password into the URL. Wait for the button before filling.
  await page.getByRole("button", { name: /log in/i }).waitFor();
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await Promise.all([
    page.waitForURL("**/dashboard", { timeout: 60_000 }),
    page.getByRole("button", { name: /log in/i }).click(),
  ]);

  await mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  // Stash creds for the teardown step.
  process.env[FIXTURE_USER_KEY] = userId;
  process.env[FIXTURE_EMAIL_KEY] = creds.email;
  process.env[FIXTURE_PASSWORD_KEY] = creds.password;
  process.env[FIXTURE_USERNAME_KEY] = creds.username;
  // Also write to a sidecar file so globalTeardown (separate process) can read.
  await writeFile(
    path.join(".playwright", "fixture.json"),
    JSON.stringify({
      userId,
      email: creds.email,
      password: creds.password,
      username: creds.username,
    }),
    "utf8",
  );
  // Mirror into env vars so test-time process.env reads work too.
  return undefined;
}

export default main;
