/**
 * Merchant-side checkout integration helper.
 * Configures the checkout origin and re-exports SDK types and classes.
 */

// Configure checkout origin from environment variable if set
if (typeof window !== "undefined") {
  const origin = process.env["NEXT_PUBLIC_CHECKOUT_ORIGIN"] || "http://localhost:3001";
  (globalThis as typeof globalThis & { __DODO_CHECKOUT_ORIGIN__?: string }).__DODO_CHECKOUT_ORIGIN__ = origin;
}

export { DodoCheckout } from "@dodo/sdk";
export type {
  DodoCheckoutOptions,
  PaymentErrorCode,
  CloseReason,
  CheckoutSessionSnapshot,
} from "@dodo/sdk";
