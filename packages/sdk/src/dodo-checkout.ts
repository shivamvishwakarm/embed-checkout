import { CHECKOUT_ORIGIN, CHECKOUT_READY_TIMEOUT_MS } from "./config";
import { IframeManager } from "./iframe-manager";
import { normalizeErrorCode, validateCheckoutMessage, isTrustedMessageOrigin } from "./message-validator";
import { PROTOCOL_VERSION, type CheckoutMessage, type HostMessage } from "./protocol";
import { SessionManager } from "./session-manager";
import type { CloseReason, DodoCheckoutOptions, PaymentErrorCode } from "./types";

export class DodoCheckout {
  private static instance: DodoCheckout | null = null;

  private readonly sessionManager = new SessionManager();
  private readonly iframeManager = new IframeManager();
  private readonly messageHandler = (event: MessageEvent<unknown>) => this.handleMessage(event);
  private readonly escapeHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.sessionManager.isActive()) {
      this.close();
    }
  };

  private activeOptions: DodoCheckoutOptions | null = null;
  private readyTimeoutId: number | null = null;
  private previousActiveElement: HTMLElement | null = null;

  public static open(options: DodoCheckoutOptions): void {
    if (!DodoCheckout.instance) {
      DodoCheckout.instance = new DodoCheckout();
    }

    DodoCheckout.instance.open(options);
  }

  public static close(): void {
    DodoCheckout.instance?.close();
  }

  private open(options: DodoCheckoutOptions): void {
    if (this.sessionManager.isActive()) {
      return;
    }

    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      this.previousActiveElement = document.activeElement;
    }

    const session = this.sessionManager.createSession(options.productId);
    this.activeOptions = options;
    this.bindMessageListener();
    window.addEventListener("keydown", this.escapeHandler);

    const iframe = this.iframeManager.create(session.sessionId, session.productId);
    this.iframeManager.mount();

    try {
      iframe.focus();
    } catch {
      // safe fallback
    }

    const initMessage: HostMessage = {
      version: PROTOCOL_VERSION,
      type: "CHECKOUT_INIT",
      sessionId: session.sessionId,
      productId: session.productId,
    };

    iframe.addEventListener("load", () => {
      try {
        iframe.focus();
      } catch {
        // safe fallback
      }
      iframe.contentWindow?.postMessage(initMessage, CHECKOUT_ORIGIN);
    });
    iframe.contentWindow?.postMessage(initMessage, CHECKOUT_ORIGIN);

    this.readyTimeoutId = window.setTimeout(() => {
      this.failCheckout("CHECKOUT_LOAD_TIMEOUT", "The checkout did not finish loading in time.");
    }, CHECKOUT_READY_TIMEOUT_MS);
  }

  private close(): void {
    const session = this.sessionManager.getActiveSession();
    if (!session) {
      return;
    }

    const closeMessage: HostMessage = {
      version: PROTOCOL_VERSION,
      type: "CHECKOUT_CLOSE",
      sessionId: session.sessionId,
    };

    this.iframeManager.getIframe()?.contentWindow?.postMessage(closeMessage, CHECKOUT_ORIGIN);
    this.teardown("USER_CLOSED");
  }

  private bindMessageListener(): void {
    window.addEventListener("message", this.messageHandler);
  }

  private handleMessage(event: MessageEvent<unknown>): void {
    const session = this.sessionManager.getActiveSession();
    if (!session) {
      return;
    }

    if (!isTrustedMessageOrigin(event.origin)) {
      return;
    }

    if (event.data == null || typeof event.data !== "object") {
      return;
    }

    if (!validateCheckoutMessage(event.data)) {
      return;
    }

    const message = event.data as CheckoutMessage;
    if (message.sessionId !== session.sessionId) {
      return;
    }

    if (message.type === "CHECKOUT_READY") {
      if (this.readyTimeoutId !== null) {
        window.clearTimeout(this.readyTimeoutId);
        this.readyTimeoutId = null;
      }
      return;
    }

    if (message.type === "PAYMENT_SUCCESS") {
      this.activeOptions?.onSuccess?.({ sessionId: message.sessionId });
      this.teardown("PAYMENT_SUCCESS");
      return;
    }

    if (message.type === "PAYMENT_ERROR") {
      const code = normalizeErrorCode(message.code);
      const payload = {
        code,
        message: message.message || "The checkout encountered an error.",
      };
      this.activeOptions?.onError?.(payload);
      return;
    }

    if (message.type === "CHECKOUT_CLOSED") {
      this.activeOptions?.onClose?.({ reason: message.reason as CloseReason });
      this.teardown(message.reason as CloseReason);
    }
  }

  private failCheckout(code: PaymentErrorCode, message: string): void {
    this.activeOptions?.onError?.({ code, message });
    this.teardown("CHECKOUT_ERROR");
  }

  private teardown(reason: CloseReason): void {
    if (this.readyTimeoutId !== null) {
      window.clearTimeout(this.readyTimeoutId);
      this.readyTimeoutId = null;
    }

    window.removeEventListener("message", this.messageHandler);
    window.removeEventListener("keydown", this.escapeHandler);
    this.iframeManager.remove();
    this.sessionManager.clear(reason);
    this.activeOptions = null;

    const elementToFocus = this.previousActiveElement;
    this.previousActiveElement = null;

    if (elementToFocus && typeof elementToFocus.focus === "function") {
      const focusTarget = () => {
        try {
          elementToFocus.focus();
        } catch {
          // ignore if detached
        }
      };

      focusTarget();
      if (typeof window !== "undefined") {
        window.setTimeout(focusTarget, 0);
        window.setTimeout(focusTarget, 50);
      }
    }
  }
}
