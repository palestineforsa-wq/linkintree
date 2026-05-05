import { defineConfig, devices } from "@playwright/test";
import { STORAGE_STATE_PATH } from "./tests/e2e/fixtures";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /\.spec\.ts$/,
  fullyParallel: false, // golden-path tests share the fixture user; serial.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    storageState: STORAGE_STATE_PATH,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "pnpm build && pnpm start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 180_000,
      }
    : {
        // Local: reuse the running dev server on :3000 if it's up; otherwise
        // start it. Lets developers run e2e against their HMR session.
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
