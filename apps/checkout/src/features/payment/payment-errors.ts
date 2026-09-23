import type { PaymentError, PaymentErrorCode } from "./payment-types";

export const PAYMENT_ERROR_MESSAGES: Record<PaymentErrorCode, string> = {
  PAYMENT_DECLINED:
    "Your card was declined. Please review the details or try a different card.",
  INVALID_CARD:
    "The card details look invalid. Please check the card number, expiry, and security code.",
  UNKNOWN_ERROR:
    "We could not process this payment right now. Please try again in a moment.",
};

export function getPaymentErrorMessage(code: PaymentErrorCode): string {
  return PAYMENT_ERROR_MESSAGES[code];
}

export function createPaymentError(
  code: PaymentErrorCode,
  overrideMessage?: string,
): PaymentError {
  return {
    code,
    message: overrideMessage ?? PAYMENT_ERROR_MESSAGES[code],
    retryable: true,
  };
}
