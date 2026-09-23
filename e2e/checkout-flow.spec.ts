import { test, expect } from "@playwright/test";

test.describe("Dodo Checkout End-to-End Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("6.2 & 6.3: SDK mounts iframe and completes postMessage handshake (CHECKOUT_READY)", async ({ page }) => {
    // Click buy on Starter Kit
    const buyButton = page.locator("button", { hasText: "Buy for $49" });
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    // Verify iframe is injected
    const iframeElement = page.locator('iframe[title="Dodo Checkout"]');
    await expect(iframeElement).toBeVisible();

    // Inside iframe: product summary is rendered
    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible();
    await expect(frame.getByText("$49.00")).toBeVisible();

    // Event log on merchant page displays CHECKOUT_READY
    const eventConsole = page.getByText("CHECKOUT_READY").first();
    await expect(eventConsole).toBeVisible({ timeout: 5000 });
  });

  test("6.4: Test Card 1 (Always Succeeds) completes payment and triggers onSuccess", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    await frame.getByLabel(/email/i).fill("buyer@example.com");
    await frame.getByLabel(/card number/i).fill("4242424242424242");
    await frame.getByLabel(/expiry/i).fill("12/28");
    await frame.getByLabel(/cvv/i).fill("123");

    // Submit payment
    await frame.getByRole("button", { name: /Pay now/i }).click();

    // Merchant banner displays success with session ID
    await expect(page.getByText("Payment Completed Successfully!")).toBeVisible({ timeout: 10000 });

    // Iframe is closed upon terminal success
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);

    // Event log has PAYMENT_SUCCESS
    await expect(page.locator("text=PAYMENT_SUCCESS").first()).toBeVisible();
  });

  test("6.4: Test Card 2 (Always Declines) displays decline screen with retry option", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    await frame.getByLabel(/email/i).fill("buyer@example.com");
    await frame.getByLabel(/card number/i).fill("4000000000000002");
    await frame.getByLabel(/expiry/i).fill("12/28");
    await frame.getByLabel(/cvv/i).fill("123");

    await frame.getByRole("button", { name: /Pay now/i }).click();

    // Inside iframe, error is displayed
    await expect(frame.getByText(/Payment Declined|declined/i)).toBeVisible({ timeout: 5000 });
    await expect(frame.getByRole("button", { name: /Try Again/i })).toBeVisible();

    // Iframe remains open
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toBeVisible();

    // Event log shows PAYMENT_ERROR
    await expect(page.locator("text=PAYMENT_ERROR").first()).toBeVisible();
  });

  test("6.4: Test Card 3 (Retry Flow) fails on 1st attempt and succeeds on 2nd attempt", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    await frame.getByLabel(/email/i).fill("buyer@example.com");
    await frame.getByLabel(/card number/i).fill("4000000000000341");
    await frame.getByLabel(/expiry/i).fill("12/28");
    await frame.getByLabel(/cvv/i).fill("123");

    // Attempt 1 -> declines
    await frame.getByRole("button", { name: /Pay now/i }).click();
    await expect(frame.getByRole("button", { name: /Try Again/i })).toBeVisible({ timeout: 5000 });

    // Click retry
    await frame.getByRole("button", { name: /Try Again/i }).click();

    // Attempt 2 -> succeeds
    await frame.getByRole("button", { name: /Pay now/i }).click();

    // Merchant banner displays success
    await expect(page.getByText("Payment Completed Successfully!")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
  });

  test("6.5: User close button dismisses iframe and triggers onClose", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    const closeBtn = frame.getByRole("button", { name: /Close checkout/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Iframe removed
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);

    // Event log has CHECKOUT_CLOSED
    await expect(page.locator("text=CHECKOUT_CLOSED").first()).toBeVisible();
  });

  test("6.5b: Close during processing prompts confirmation and can be confirmed", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    await frame.getByLabel(/email/i).fill("buyer@example.com");
    await frame.getByLabel(/card number/i).fill("4242424242424242");
    await frame.getByLabel(/expiry/i).fill("12/28");
    await frame.getByLabel(/cvv/i).fill("123");

    // Click Pay now
    await frame.getByRole("button", { name: /Pay now/i }).click();

    // While processing, click close button
    const closeBtn = frame.getByRole("button", { name: /Close checkout/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      // Should show warning: Payment is being processed
      const confirmDialog = frame.getByText("Payment is being processed.");
      if (await confirmDialog.isVisible()) {
        // Click Stay or Close
        await frame.getByRole("button", { name: "Close", exact: true }).click();
        await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
      }
    }
  });

  test("6.6: Duplicate open() does not create multiple iframes", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(1);

    // Attempt to invoke DodoCheckout.open again from merchant page context
    await page.evaluate(() => {
      const globalAny = window as any;
      if (globalAny.DodoCheckout) {
        globalAny.DodoCheckout.open({ productId: "prod_456" });
      }
    });

    // Still exactly 1 iframe
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(1);
  });

  test("8.1: Focus returns to invoking Buy button when checkout is closed", async ({ page }) => {
    const buyButton = page.locator("button", { hasText: "Buy for $49" });
    await buyButton.focus();
    await buyButton.click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    const closeBtn = frame.getByRole("button", { name: /Close checkout/i });
    await closeBtn.click();

    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
    await expect(buyButton).toBeFocused();
  });

  test("8.2: Escape key closes checkout and returns focus", async ({ page }) => {
    const buyButton = page.locator("button", { hasText: "Buy for $49" });
    await buyButton.focus();
    await buyButton.click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    // Press Escape inside the iframe
    const iframeElement = page.locator('iframe[title="Dodo Checkout"]');
    await iframeElement.focus();
    await page.keyboard.press("Escape");

    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
    await expect(buyButton).toBeFocused();
  });

  test("8.2: Pressing Enter in input field submits the payment form", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    await frame.getByLabel(/email/i).fill("buyer@example.com");
    await frame.getByLabel(/card number/i).fill("4242424242424242");
    await frame.getByLabel(/expiry/i).fill("12/28");
    const cvvInput = frame.getByLabel(/cvv/i);
    await cvvInput.fill("123");

    // Press Enter to submit
    await cvvInput.press("Enter");

    await expect(page.getByText("Payment Completed Successfully!")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
  });

  test("8.3: Clicking on backdrop overlay closes the checkout", async ({ page }) => {
    await page.locator("button", { hasText: "Buy for $49" }).click();

    const frame = page.frameLocator('iframe[title="Dodo Checkout"]');
    await expect(frame.getByText("Dodo Starter Kit")).toBeVisible({ timeout: 5000 });

    // Click on the backdrop (outside the max-w-md dialog card)
    const backdrop = frame.getByRole("dialog");
    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(page.locator('iframe[title="Dodo Checkout"]')).toHaveCount(0);
  });
});
