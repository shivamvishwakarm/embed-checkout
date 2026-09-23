import type { PaymentInput, PaymentAttempt, PaymentResult } from "./payment-types";
import { createPaymentError } from "./payment-errors";

const TEST_CARD_NUMBERS = {
  success: "4242424242424242",
  decline: "4000000000000002",
  retry: "4000000000000341",
};

function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function createAttemptId(): string {
  const randomPart =
    typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `pa_${randomPart}`;
}

export class DeterministicFakePaymentEngine {
  private attemptCount = 0;
  private readonly attempts: PaymentAttempt[] = [];

  getAttemptHistory(): PaymentAttempt[] {
    return [...this.attempts];
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }

  async charge(input: PaymentInput): Promise<PaymentResult> {
    const attemptId = createAttemptId();
    this.attemptCount += 1;

    const attempt: PaymentAttempt = {
      id: attemptId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.attempts.push(attempt);

    await new Promise((resolve) => setTimeout(resolve, 850));

    const normalizedCard = normalizeCardNumber(input.cardNumber);
    const missingCardData = !normalizedCard || normalizedCard.length < 12;
    const invalidCvv = input.cvv.trim().length < 3;
    const expiryIsEmpty = input.expiry.trim().length === 0;

    if (missingCardData || invalidCvv || expiryIsEmpty) {
      const error = createPaymentError("INVALID_CARD");
      const finishedAttempt: PaymentAttempt = {
        ...attempt,
        status: "failed",
        finishedAt: new Date().toISOString(),
        code: error.code,
        message: error.message,
      };
      this.attempts[this.attempts.length - 1] = finishedAttempt;

      return {
        ok: false,
        attemptId,
        status: "failed",
        error,
        message: error.message,
      };
    }

    if (normalizedCard === TEST_CARD_NUMBERS.success) {
      const finishedAttempt: PaymentAttempt = {
        ...attempt,
        status: "succeeded",
        finishedAt: new Date().toISOString(),
      };
      this.attempts[this.attempts.length - 1] = finishedAttempt;

      return {
        ok: true,
        attemptId,
        status: "succeeded",
        message: "Payment processed successfully.",
      };
    }

    if (normalizedCard === TEST_CARD_NUMBERS.decline) {
      const error = createPaymentError("PAYMENT_DECLINED");
      const finishedAttempt: PaymentAttempt = {
        ...attempt,
        status: "declined",
        finishedAt: new Date().toISOString(),
        code: error.code,
        message: error.message,
      };
      this.attempts[this.attempts.length - 1] = finishedAttempt;

      return {
        ok: false,
        attemptId,
        status: "declined",
        error,
        message: error.message,
      };
    }

    if (normalizedCard === TEST_CARD_NUMBERS.retry) {
      const shouldSucceed = this.attemptCount > 1;

      if (shouldSucceed) {
        const finishedAttempt: PaymentAttempt = {
          ...attempt,
          status: "succeeded",
          finishedAt: new Date().toISOString(),
        };
        this.attempts[this.attempts.length - 1] = finishedAttempt;

        return {
          ok: true,
          attemptId,
          status: "succeeded",
          message: "Payment processed successfully after retry.",
        };
      }

      const error = createPaymentError("PAYMENT_DECLINED");
      const finishedAttempt: PaymentAttempt = {
        ...attempt,
        status: "declined",
        finishedAt: new Date().toISOString(),
        code: error.code,
        message: error.message,
      };
      this.attempts[this.attempts.length - 1] = finishedAttempt;

      return {
        ok: false,
        attemptId,
        status: "declined",
        error,
        message: error.message,
      };
    }

    const error = createPaymentError("UNKNOWN_ERROR");
    const finishedAttempt: PaymentAttempt = {
      ...attempt,
      status: "failed",
      finishedAt: new Date().toISOString(),
      code: error.code,
      message: error.message,
    };
    this.attempts[this.attempts.length - 1] = finishedAttempt;

    return {
      ok: false,
      attemptId,
      status: "failed",
      error,
      message: error.message,
    };
  }
}
