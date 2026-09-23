import { describe, expect, it } from "vitest";
import {
  CHECKOUT_MESSAGE_TYPES,
  HOST_MESSAGE_TYPES,
  PROTOCOL_VERSION,
  isMessageLike,
  type CheckoutCloseMessage,
  type CheckoutClosedMessage,
  type CheckoutInitMessage,
  type CheckoutReadyMessage,
  type PaymentErrorMessage,
  type PaymentSuccessMessage,
} from "../src/protocol";

describe("Protocol definitions", () => {
  it("defines the expected PROTOCOL_VERSION constant", () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });

  it("lists all valid host message types", () => {
    expect(HOST_MESSAGE_TYPES).toEqual(["CHECKOUT_INIT", "CHECKOUT_CLOSE"]);
  });

  it("lists all valid checkout message types", () => {
    expect(CHECKOUT_MESSAGE_TYPES).toEqual([
      "CHECKOUT_READY",
      "PAYMENT_SUCCESS",
      "PAYMENT_ERROR",
      "CHECKOUT_CLOSED",
    ]);
  });

  describe("isMessageLike", () => {
    it("returns true for plain objects", () => {
      expect(isMessageLike({})).toBe(true);
      expect(isMessageLike({ type: "CHECKOUT_READY" })).toBe(true);
      expect(isMessageLike(Object.create(null))).toBe(true);
    });

    it("returns false for null and undefined", () => {
      expect(isMessageLike(null)).toBe(false);
      expect(isMessageLike(undefined)).toBe(false);
    });

    it("returns false for arrays", () => {
      expect(isMessageLike([])).toBe(false);
      expect(isMessageLike([1, 2, 3])).toBe(false);
    });

    it("returns false for primitives", () => {
      expect(isMessageLike("string")).toBe(false);
      expect(isMessageLike(123)).toBe(false);
      expect(isMessageLike(true)).toBe(false);
      expect(isMessageLike(Symbol("test"))).toBe(false);
    });
  });

  describe("Discriminated union message structures", () => {
    it("conforms to CheckoutInitMessage structure", () => {
      const msg: CheckoutInitMessage = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_INIT",
        sessionId: "cs_123456789012",
        productId: "prod_pro_plan",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("CHECKOUT_INIT");
      expect(msg.sessionId).toBe("cs_123456789012");
      expect(msg.productId).toBe("prod_pro_plan");
    });

    it("conforms to CheckoutCloseMessage structure", () => {
      const msg: CheckoutCloseMessage = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_CLOSE",
        sessionId: "cs_123456789012",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("CHECKOUT_CLOSE");
      expect(msg.sessionId).toBe("cs_123456789012");
    });

    it("conforms to CheckoutReadyMessage structure", () => {
      const msg: CheckoutReadyMessage = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_READY",
        sessionId: "cs_123456789012",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("CHECKOUT_READY");
      expect(msg.sessionId).toBe("cs_123456789012");
    });

    it("conforms to PaymentSuccessMessage structure", () => {
      const msg: PaymentSuccessMessage = {
        version: PROTOCOL_VERSION,
        type: "PAYMENT_SUCCESS",
        sessionId: "cs_123456789012",
        attemptId: "pa_123456789012",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("PAYMENT_SUCCESS");
      expect(msg.sessionId).toBe("cs_123456789012");
      expect(msg.attemptId).toBe("pa_123456789012");
    });

    it("conforms to PaymentErrorMessage structure", () => {
      const msg: PaymentErrorMessage = {
        version: PROTOCOL_VERSION,
        type: "PAYMENT_ERROR",
        sessionId: "cs_123456789012",
        attemptId: "pa_123456789012",
        code: "PAYMENT_DECLINED",
        message: "Card was declined.",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("PAYMENT_ERROR");
      expect(msg.code).toBe("PAYMENT_DECLINED");
      expect(msg.message).toBe("Card was declined.");
    });

    it("conforms to CheckoutClosedMessage structure", () => {
      const msg: CheckoutClosedMessage = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_CLOSED",
        sessionId: "cs_123456789012",
        reason: "USER_CLOSED",
      };
      expect(msg.version).toBe(1);
      expect(msg.type).toBe("CHECKOUT_CLOSED");
      expect(msg.reason).toBe("USER_CLOSED");
    });
  });
});
