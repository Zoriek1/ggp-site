import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 300000,
  expect: { timeout: 20000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx tsx tests/start-e2e.ts",
    url: "http://127.0.0.1:3100/admin/login",
    timeout: 180000,
    reuseExistingServer: false,
  },
});
