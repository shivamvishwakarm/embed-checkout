import { defineConfig, devices } from "@playwright/test";

const merchantUrl =
  process.env["NEXT_PUBLIC_MERCHANT_ORIGIN"] ||
  process.env["MERCHANT_ORIGIN"] ||
  "";
const checkoutUrl =
  process.env["NEXT_PUBLIC_CHECKOUT_ORIGIN"] ||
  process.env["CHECKOUT_ORIGIN"] ||
  process.env["NEXT_PUBLIC_CHECKOUT_URL"] ||
  "";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: merchantUrl,
    channel: "chrome",
    headless: true,
  },
  webServer: [
    {
      command: "pnpm --filter @dodo/merchant start",
      url: merchantUrl,
      reuseExistingServer: !process.env["CI"],
      timeout: 30000,
    },
    {
      command: "pnpm --filter @dodo/checkout start",
      url: checkoutUrl,
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
