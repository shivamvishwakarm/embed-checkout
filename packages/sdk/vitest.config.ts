import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    env: {
      NEXT_PUBLIC_CHECKOUT_ORIGIN: "https://checkout.dodo.example.com",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
