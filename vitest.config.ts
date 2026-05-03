import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/rls/**/*.test.ts",
      "lib/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    globals: false,
    setupFiles: ["tests/setup.ts"],
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
