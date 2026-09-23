import type { PaymentErrorCode } from "./types";

export const PAYMENT_ERROR_MESSAGES: Record<PaymentErrorCode, string> = {
  INVALID_CONFIGURATION: "Checkout is not configured correctly.",
  CHECKOUT_LOAD_TIMEOUT: "The checkout did not finish loading in time.",
  CHECKOUT_INITIALIZATION_FAILED: "The checkout failed to initialize.",
  PAYMENT_DECLINED: "Your card was declined. Please try another card.",
  PAYMENT_FAILED: "The payment could not be completed.",
  CHECKOUT_CANCELLED: "The checkout was cancelled.",
  UNKNOWN_ERROR: "Something went wrong while processing your payment.",
};

export function createPaymentError(
  code: PaymentErrorCode,
  message?: string,
): { code: PaymentErrorCode; message: string } {
  return {
    code,
    message: message ?? PAYMENT_ERROR_MESSAGES[code],
  };
}

export function isPaymentErrorCode(value: string): value is PaymentErrorCode {
  return value in PAYMENT_ERROR_MESSAGES;
}
