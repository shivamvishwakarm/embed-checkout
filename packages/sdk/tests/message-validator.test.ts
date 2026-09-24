import { describe, expect, it } from "vitest";
import { CHECKOUT_ORIGIN } from "../src/config";
import { PROTOCOL_VERSION } from "../src/protocol";
import {
  isTrustedMessageOrigin,
  isTrustedMessageSource,
  isValidAttemptId,
  isValidMessageType,
  isValidSessionId,
  normalizeErrorCode,
  validateCheckoutMessage,
  validateHostMessage,
} from "../src/message-validator";

describe("message-validator", () => {
  describe("isValidSessionId", () => {
    it("accepts valid session IDs starting with cs_ and length > 4", () => {
      expect(isValidSessionId("cs_123456789012")).toBe(true);
      expect(isValidSessionId("cs_abc")).toBe(true);
    });

    it("rejects invalid session IDs", () => {
      expect(isValidSessionId("")).toBe(false);
      expect(isValidSessionId("cs_")).toBe(false);
      expect(isValidSessionId("pa_123456789012")).toBe(false);
      expect(isValidSessionId("session_1234")).toBe(false);
      expect(isValidSessionId(null)).toBe(false);
      expect(isValidSessionId(undefined)).toBe(false);
      expect(isValidSessionId(12345)).toBe(false);
      expect(isValidSessionId({})).toBe(false);
    });
  });

  describe("isValidAttemptId", () => {
    it("accepts valid attempt IDs starting with pa_ and length > 4", () => {
      expect(isValidAttemptId("pa_123456789012")).toBe(true);
      expect(isValidAttemptId("pa_xyz")).toBe(true);
    });

    it("rejects invalid attempt IDs", () => {
      expect(isValidAttemptId("")).toBe(false);
      expect(isValidAttemptId("pa_")).toBe(false);
      expect(isValidAttemptId("cs_123456789012")).toBe(false);
      expect(isValidAttemptId("attempt_1234")).toBe(false);
      expect(isValidAttemptId(null)).toBe(false);
      expect(isValidAttemptId(undefined)).toBe(false);
      expect(isValidAttemptId(12345)).toBe(false);
      expect(isValidAttemptId({})).toBe(false);
    });
  });

  describe("isValidMessageType", () => {
    it("accepts known protocol message types", () => {
      const knownTypes = [
        "CHECKOUT_INIT",
        "CHECKOUT_CLOSE",
        "CHECKOUT_READY",
        "PAYMENT_SUCCESS",
        "PAYMENT_ERROR",
        "CHECKOUT_CLOSED",
      ];
      for (const type of knownTypes) {
        expect(isValidMessageType(type)).toBe(true);
      }
    });

    it("rejects unknown or invalid message types", () => {
      expect(isValidMessageType("UNKNOWN")).toBe(false);
      expect(isValidMessageType("")).toBe(false);
      expect(isValidMessageType(null)).toBe(false);
      expect(isValidMessageType(123)).toBe(false);
      expect(isValidMessageType("checkout_init")).toBe(false);
    });
  });

  describe("validateHostMessage", () => {
    it("validates valid CHECKOUT_INIT message", () => {
      const validInit = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_INIT",
        sessionId: "cs_valid123456",
        productId: "prod_sample",
      };
      expect(validateHostMessage(validInit)).toBe(true);
    });

    it("rejects CHECKOUT_INIT with missing or invalid fields", () => {
      expect(
        validateHostMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_INIT",
          sessionId: "cs_valid123456",
          productId: "",
        }),
      ).toBe(false);

      expect(
        validateHostMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_INIT",
          sessionId: "invalid_session",
          productId: "prod_sample",
        }),
      ).toBe(false);

      expect(
        validateHostMessage({
          version: 2,
          type: "CHECKOUT_INIT",
          sessionId: "cs_valid123456",
          productId: "prod_sample",
        }),
      ).toBe(false);
    });

    it("validates valid CHECKOUT_CLOSE message", () => {
      const validClose = {
        version: PROTOCOL_VERSION,
        type: "CHECKOUT_CLOSE",
        sessionId: "cs_valid123456",
      };
      expect(validateHostMessage(validClose)).toBe(true);
    });

    it("rejects CHECKOUT_CLOSE with invalid sessionId", () => {
      expect(
        validateHostMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_CLOSE",
          sessionId: "bad_id",
        }),
      ).toBe(false);
    });

    it("rejects non-object or non-host messages", () => {
      expect(validateHostMessage(null)).toBe(false);
      expect(validateHostMessage("string")).toBe(false);
      expect(validateHostMessage([])).toBe(false);
      expect(
        validateHostMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_READY",
          sessionId: "cs_valid123456",
        }),
      ).toBe(false);
    });
  });

  describe("validateCheckoutMessage", () => {
    it("validates valid CHECKOUT_READY message", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_READY",
          sessionId: "cs_valid123456",
        }),
      ).toBe(true);
    });

    it("rejects CHECKOUT_READY with invalid sessionId or version", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_READY",
          sessionId: "invalid",
        }),
      ).toBe(false);

      expect(
        validateCheckoutMessage({
          version: 99,
          type: "CHECKOUT_READY",
          sessionId: "cs_valid123456",
        }),
      ).toBe(false);
    });

    it("validates valid PAYMENT_SUCCESS message", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_SUCCESS",
          sessionId: "cs_valid123456",
          attemptId: "pa_valid123456",
        }),
      ).toBe(true);
    });

    it("rejects PAYMENT_SUCCESS with missing/invalid attemptId or sessionId", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_SUCCESS",
          sessionId: "cs_valid123456",
          attemptId: "bad_attempt",
        }),
      ).toBe(false);

      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_SUCCESS",
          sessionId: "invalid",
          attemptId: "pa_valid123456",
        }),
      ).toBe(false);
    });

    it("validates valid PAYMENT_ERROR message", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_ERROR",
          sessionId: "cs_valid123456",
          attemptId: "pa_valid123456",
          code: "PAYMENT_DECLINED",
          message: "Card was declined.",
        }),
      ).toBe(true);
    });

    it("rejects PAYMENT_ERROR with missing code or message", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_ERROR",
          sessionId: "cs_valid123456",
          attemptId: "pa_valid123456",
          code: 123,
          message: "Card was declined.",
        }),
      ).toBe(false);

      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "PAYMENT_ERROR",
          sessionId: "cs_valid123456",
          attemptId: "pa_valid123456",
          code: "PAYMENT_DECLINED",
          message: null,
        }),
      ).toBe(false);
    });

    it("validates valid CHECKOUT_CLOSED message", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_CLOSED",
          sessionId: "cs_valid123456",
          reason: "USER_CLOSED",
        }),
      ).toBe(true);
    });

    it("rejects CHECKOUT_CLOSED with non-string reason", () => {
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_CLOSED",
          sessionId: "cs_valid123456",
          reason: 123,
        }),
      ).toBe(false);
    });

    it("rejects non-object or host messages", () => {
      expect(validateCheckoutMessage(null)).toBe(false);
      expect(validateCheckoutMessage(undefined)).toBe(false);
      expect(validateCheckoutMessage("test")).toBe(false);
      expect(validateCheckoutMessage([1, 2])).toBe(false);
      expect(
        validateCheckoutMessage({
          version: PROTOCOL_VERSION,
          type: "CHECKOUT_INIT",
          sessionId: "cs_valid123456",
        }),
      ).toBe(false);
    });
  });

  describe("isTrustedMessageOrigin", () => {
    it("returns true for matching CHECKOUT_ORIGIN", () => {
      expect(isTrustedMessageOrigin(CHECKOUT_ORIGIN)).toBe(true);
    });

    it("returns false for different origins", () => {
      expect(isTrustedMessageOrigin("http://evil.com")).toBe(false);
      expect(isTrustedMessageOrigin("https://attacker.org")).toBe(false);
      expect(isTrustedMessageOrigin("https://untrusted-merchant.org")).toBe(false);
      expect(isTrustedMessageOrigin("")).toBe(false);
    });
  });

  describe("isTrustedMessageSource", () => {
    it("returns true when source matches targetWindow or parent", () => {
      const targetWindow = window;
      expect(isTrustedMessageSource(targetWindow, targetWindow)).toBe(true);
      expect(isTrustedMessageSource(null, targetWindow)).toBe(true);
      expect(isTrustedMessageSource(targetWindow.parent, targetWindow)).toBe(true);
    });

    it("returns false when source is another window", () => {
      const otherWindow = {} as MessageEventSource;
      expect(isTrustedMessageSource(otherWindow, window)).toBe(false);
    });
  });

  describe("normalizeErrorCode", () => {
    it("normalizes recognized error codes correctly", () => {
      expect(normalizeErrorCode("PAYMENT_DECLINED")).toBe("PAYMENT_DECLINED");
      expect(normalizeErrorCode("PAYMENT_FAILED")).toBe("PAYMENT_FAILED");
      expect(normalizeErrorCode("CHECKOUT_CANCELLED")).toBe("CHECKOUT_CANCELLED");
      expect(normalizeErrorCode("CHECKOUT_INITIALIZATION_FAILED")).toBe("CHECKOUT_INITIALIZATION_FAILED");
      expect(normalizeErrorCode("CHECKOUT_LOAD_TIMEOUT")).toBe("CHECKOUT_LOAD_TIMEOUT");
      expect(normalizeErrorCode("INVALID_CONFIGURATION")).toBe("INVALID_CONFIGURATION");
    });

    it("falls back to UNKNOWN_ERROR for unrecognized codes", () => {
      expect(normalizeErrorCode("SOME_RANDOM_ERROR")).toBe("UNKNOWN_ERROR");
      expect(normalizeErrorCode("")).toBe("UNKNOWN_ERROR");
      expect(normalizeErrorCode(null)).toBe("UNKNOWN_ERROR");
      expect(normalizeErrorCode(undefined)).toBe("UNKNOWN_ERROR");
      expect(normalizeErrorCode(123)).toBe("UNKNOWN_ERROR");
    });
  });
});
