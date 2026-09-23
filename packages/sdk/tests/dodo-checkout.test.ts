import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHECKOUT_ORIGIN, CHECKOUT_READY_TIMEOUT_MS } from "../src/config";
import { DodoCheckout } from "../src/dodo-checkout";
import { PROTOCOL_VERSION } from "../src/protocol";

describe("DodoCheckout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    // Ensure any open session is closed
    DodoCheckout.close();
  });

  afterEach(() => {
    DodoCheckout.close();
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  function getMountedIframe(): HTMLIFrameElement | null {
    return document.body.querySelector("iframe");
  }

  function getActiveSessionId(): string {
    const iframe = getMountedIframe();
    if (!iframe) throw new Error("Expected iframe to be mounted");
    const url = new URL(iframe.src);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) throw new Error("Expected sessionId in iframe src");
    return sessionId;
  }

  describe("open() lifecycle", () => {
    it("creates and mounts iframe with correct parameters and sends CHECKOUT_INIT", () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onClose = vi.fn();

      DodoCheckout.open({
        productId: "prod_tier1",
        onSuccess,
        onError,
        onClose,
      });

      const iframe = getMountedIframe();
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute("title")).toBe("Dodo Checkout");

      const url = new URL(iframe!.src);
      expect(url.searchParams.get("productId")).toBe("prod_tier1");
      const sessionId = url.searchParams.get("sessionId");
      expect(sessionId).toMatch(/^cs_/);
    });

    it("prevents duplicate open calls while a session is active", () => {
      DodoCheckout.open({ productId: "prod_first" });
      const firstIframe = getMountedIframe();
      expect(firstIframe).not.toBeNull();

      // Attempt second open with different product
      DodoCheckout.open({ productId: "prod_second" });
      const iframes = document.body.querySelectorAll("iframe");
      expect(iframes.length).toBe(1);
      const firstFound = iframes[0];
      expect(firstFound).toBe(firstIframe);

      const url = new URL(firstFound!.src);
      expect(url.searchParams.get("productId")).toBe("prod_first");
    });
  });

  describe("close() lifecycle", () => {
    it("sends CHECKOUT_CLOSE and removes the iframe and tears down", () => {
      DodoCheckout.open({ productId: "prod_test" });
      const iframe = getMountedIframe();
      expect(iframe).not.toBeNull();

      const postMessageSpy = vi.fn();
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage = postMessageSpy;
      }

      DodoCheckout.close();

      expect(getMountedIframe()).toBeNull();
      if (postMessageSpy.mock.calls.length > 0) {
        expect(postMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "CHECKOUT_CLOSE",
            version: PROTOCOL_VERSION,
          }),
          CHECKOUT_ORIGIN,
        );
      }
    });

    it("is safe to call close() when no checkout is open", () => {
      expect(() => DodoCheckout.close()).not.toThrow();
    });

    it("allows opening a new checkout session after close()", () => {
      DodoCheckout.open({ productId: "prod_first" });
      expect(getMountedIframe()).not.toBeNull();

      DodoCheckout.close();
      expect(getMountedIframe()).toBeNull();

      DodoCheckout.open({ productId: "prod_second" });
      const secondIframe = getMountedIframe();
      expect(secondIframe).not.toBeNull();
      const url = new URL(secondIframe!.src);
      expect(url.searchParams.get("productId")).toBe("prod_second");
    });
  });

  describe("Ready timeout handling", () => {
    it("triggers onError with CHECKOUT_LOAD_TIMEOUT and removes iframe if ready message is not received within timeout", () => {
      const onError = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onError,
      });

      expect(getMountedIframe()).not.toBeNull();

      // Advance time to just before timeout
      vi.advanceTimersByTime(CHECKOUT_READY_TIMEOUT_MS - 100);
      expect(onError).not.toHaveBeenCalled();
      expect(getMountedIframe()).not.toBeNull();

      // Advance past timeout
      vi.advanceTimersByTime(200);
      expect(onError).toHaveBeenCalledWith({
        code: "CHECKOUT_LOAD_TIMEOUT",
        message: "The checkout did not finish loading in time.",
      });
      expect(getMountedIframe()).toBeNull();
    });

    it("clears timeout when CHECKOUT_READY message is received", () => {
      const onError = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onError,
      });

      const sessionId = getActiveSessionId();

      // Dispatch CHECKOUT_READY message
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CHECKOUT_ORIGIN,
          data: {
            version: PROTOCOL_VERSION,
            type: "CHECKOUT_READY",
            sessionId,
          },
        }),
      );

      // Advance time way past timeout
      vi.advanceTimersByTime(CHECKOUT_READY_TIMEOUT_MS * 2);
      expect(onError).not.toHaveBeenCalled();
      expect(getMountedIframe()).not.toBeNull();
    });
  });

  describe("Message handling", () => {
    it("handles PAYMENT_SUCCESS by calling onSuccess and tearing down", () => {
      const onSuccess = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onSuccess,
      });

      const sessionId = getActiveSessionId();

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CHECKOUT_ORIGIN,
          data: {
            version: PROTOCOL_VERSION,
            type: "PAYMENT_SUCCESS",
            sessionId,
            attemptId: "pa_123456789012",
          },
        }),
      );

      expect(onSuccess).toHaveBeenCalledWith({ sessionId });
      expect(getMountedIframe()).toBeNull();
    });

    it("handles PAYMENT_ERROR by calling onError without tearing down the iframe", () => {
      const onError = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onError,
      });

      const sessionId = getActiveSessionId();

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CHECKOUT_ORIGIN,
          data: {
            version: PROTOCOL_VERSION,
            type: "PAYMENT_ERROR",
            sessionId,
            attemptId: "pa_123456789012",
            code: "PAYMENT_DECLINED",
            message: "Your card was declined.",
          },
        }),
      );

      expect(onError).toHaveBeenCalledWith({
        code: "PAYMENT_DECLINED",
        message: "Your card was declined.",
      });
      // The checkout iframe should remain open so customer can retry with another card
      expect(getMountedIframe()).not.toBeNull();
    });

    it("handles CHECKOUT_CLOSED by calling onClose and tearing down", () => {
      const onClose = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onClose,
      });

      const sessionId = getActiveSessionId();

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CHECKOUT_ORIGIN,
          data: {
            version: PROTOCOL_VERSION,
            type: "CHECKOUT_CLOSED",
            sessionId,
            reason: "USER_CLOSED",
          },
        }),
      );

      expect(onClose).toHaveBeenCalledWith({ reason: "USER_CLOSED" });
      expect(getMountedIframe()).toBeNull();
    });

    it("ignores messages from untrusted origins", () => {
      const onSuccess = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onSuccess,
      });

      const sessionId = getActiveSessionId();

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "http://malicious-origin.com",
          data: {
            version: PROTOCOL_VERSION,
            type: "PAYMENT_SUCCESS",
            sessionId,
            attemptId: "pa_123456789012",
          },
        }),
      );

      expect(onSuccess).not.toHaveBeenCalled();
      expect(getMountedIframe()).not.toBeNull();
    });

    it("ignores messages with mismatched sessionId", () => {
      const onSuccess = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onSuccess,
      });

      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CHECKOUT_ORIGIN,
          data: {
            version: PROTOCOL_VERSION,
            type: "PAYMENT_SUCCESS",
            sessionId: "cs_completely_different",
            attemptId: "pa_123456789012",
          },
        }),
      );

      expect(onSuccess).not.toHaveBeenCalled();
      expect(getMountedIframe()).not.toBeNull();
    });

    it("ignores malformed message data", () => {
      const onSuccess = vi.fn();
      DodoCheckout.open({
        productId: "prod_test",
        onSuccess,
      });

      // Send invalid message shapes
      window.dispatchEvent(new MessageEvent("message", { origin: CHECKOUT_ORIGIN, data: null }));
      window.dispatchEvent(new MessageEvent("message", { origin: CHECKOUT_ORIGIN, data: "random string" }));
      window.dispatchEvent(new MessageEvent("message", { origin: CHECKOUT_ORIGIN, data: { foo: "bar" } }));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(getMountedIframe()).not.toBeNull();
    });
  });
});
