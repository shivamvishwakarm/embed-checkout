import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    headless: true,
  },
  webServer: [
    {
      command: "pnpm --filter @dodo/merchant start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env["CI"],
      timeout: 30000,
    },
    {
      command: "pnpm --filter @dodo/checkout start",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env["CI"],
      timeout: 30000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],
});
