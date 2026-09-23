import { describe, expect, it } from "vitest";
import { PAYMENT_ERROR_MESSAGES, createPaymentError, isPaymentErrorCode } from "../src/errors";
import type { PaymentErrorCode } from "../src/types";

describe("errors", () => {
  const allCodes: PaymentErrorCode[] = [
    "INVALID_CONFIGURATION",
    "CHECKOUT_LOAD_TIMEOUT",
    "CHECKOUT_INITIALIZATION_FAILED",
    "PAYMENT_DECLINED",
    "PAYMENT_FAILED",
    "CHECKOUT_CANCELLED",
    "UNKNOWN_ERROR",
  ];

  it("contains messages for all known error codes", () => {
    for (const code of allCodes) {
      expect(PAYMENT_ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof PAYMENT_ERROR_MESSAGES[code]).toBe("string");
      expect(PAYMENT_ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    }
  });

  describe("createPaymentError", () => {
    it("creates an error object with default message", () => {
      const err = createPaymentError("PAYMENT_DECLINED");
      expect(err).toEqual({
        code: "PAYMENT_DECLINED",
        message: PAYMENT_ERROR_MESSAGES.PAYMENT_DECLINED,
      });
    });

    it("creates an error object with custom override message", () => {
      const customMsg = "Card expired or invalid cvv";
      const err = createPaymentError("PAYMENT_DECLINED", customMsg);
      expect(err).toEqual({
        code: "PAYMENT_DECLINED",
        message: customMsg,
      });
    });
  });

  describe("isPaymentErrorCode", () => {
    it("returns true for known error codes", () => {
      for (const code of allCodes) {
        expect(isPaymentErrorCode(code)).toBe(true);
      }
    });

    it("returns false for unknown codes", () => {
      expect(isPaymentErrorCode("NON_EXISTENT_CODE")).toBe(false);
      expect(isPaymentErrorCode("")).toBe(false);
    });
  });
});
