// Shared fixture metadata between globalSetup, globalTeardown, and tests.
// Stored in process env (set by globalSetup); a JSON file would also work
// but env keeps tests deterministic without a temp-file dependency.

import path from "node:path";
import { randomUUID } from "node:crypto";

export const STORAGE_STATE_PATH = path.join(
  ".playwright",
  "auth.json",
);

export const FIXTURE_USER_KEY = "PLAYWRIGHT_FIXTURE_USER_ID";
export const FIXTURE_EMAIL_KEY = "PLAYWRIGHT_FIXTURE_EMAIL";
export const FIXTURE_PASSWORD_KEY = "PLAYWRIGHT_FIXTURE_PASSWORD";
export const FIXTURE_USERNAME_KEY = "PLAYWRIGHT_FIXTURE_USERNAME";

export function generateFixtureCredentials() {
  const slug = randomUUID().slice(0, 8);
  return {
    email: `e2e_${slug}@playwright.test`,
    password: `Test_${randomUUID()}`,
    username: `e2e_${slug}`,
  };
}

export function readFixture() {
  const userId = process.env[FIXTURE_USER_KEY];
  const email = process.env[FIXTURE_EMAIL_KEY];
  const password = process.env[FIXTURE_PASSWORD_KEY];
  const username = process.env[FIXTURE_USERNAME_KEY];
  if (!userId || !email || !password || !username) {
    throw new Error(
      "Fixture creds missing. Did global-setup run? Check tests/e2e/global-setup.ts.",
    );
  }
  return { userId, email, password, username };
}
