import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/demo.mjs --production",
    url: "http://127.0.0.1:3100",
    env: { DEMO_WEB_PORT: "3100", DEMO_API_PORT: "5100" },
    reuseExistingServer: false,
    timeout: 180000,
  },
});
