export const CHECKOUT_PROTOCOL_VERSION = 1;

export type CloseReason = "USER_CLOSED" | "CHECKOUT_LOAD_TIMEOUT" | "PAYMENT_ERROR";

export type HostToCheckoutMessage =
  | {
      version: 1;
      type: "CHECKOUT_INIT";
      sessionId: string;
      productId: string;
    }
  | {
      version: 1;
      type: "CHECKOUT_CLOSE";
      sessionId: string;
    };

export type CheckoutToHostMessage =
  | {
      version: 1;
      type: "CHECKOUT_READY";
      sessionId: string;
    }
  | {
      version: 1;
      type: "PAYMENT_SUCCESS";
      sessionId: string;
      attemptId: string;
    }
  | {
      version: 1;
      type: "PAYMENT_ERROR";
      sessionId: string;
      attemptId: string;
      code: string;
      message: string;
    }
  | {
      version: 1;
      type: "CHECKOUT_CLOSED";
      sessionId: string;
      reason: CloseReason;
    };

export type CheckoutProtocolMessage = HostToCheckoutMessage | CheckoutToHostMessage;

function sendMessage(message: CheckoutToHostMessage): void {
  window.parent.postMessage(message, "*");
}

export function sendCheckoutReady(sessionId: string): void {
  sendMessage({ version: 1, type: "CHECKOUT_READY", sessionId });
}

export function sendPaymentSuccess(sessionId: string, attemptId: string): void {
  sendMessage({ version: 1, type: "PAYMENT_SUCCESS", sessionId, attemptId });
}

export function sendPaymentError(
  sessionId: string,
  attemptId: string,
  code: string,
  message: string,
): void {
  sendMessage({ version: 1, type: "PAYMENT_ERROR", sessionId, attemptId, code, message });
}

export function sendCheckoutClosed(sessionId: string, reason: CloseReason): void {
  sendMessage({ version: 1, type: "CHECKOUT_CLOSED", sessionId, reason });
}
