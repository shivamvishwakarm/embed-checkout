import { CHECKOUT_ORIGIN } from "./config";
import { PROTOCOL_VERSION, type CheckoutMessage, type HostMessage, type MessageType } from "./protocol";
import type { PaymentErrorCode } from "./types";

const VALID_MESSAGE_TYPES: MessageType[] = [
  "CHECKOUT_INIT",
  "CHECKOUT_CLOSE",
  "CHECKOUT_READY",
  "PAYMENT_SUCCESS",
  "PAYMENT_ERROR",
  "CHECKOUT_CLOSED",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("cs_") && value.length > 4;
}

export function isValidAttemptId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("pa_") && value.length > 4;
}

export function isValidMessageType(value: unknown): value is MessageType {
  return typeof value === "string" && VALID_MESSAGE_TYPES.includes(value as MessageType);
}

export function validateHostMessage(value: unknown): value is HostMessage {
  if (!isRecord(value)) return false;
  if (value.version !== PROTOCOL_VERSION) return false;
  if (!isValidMessageType(value.type)) return false;

  if (value.type === "CHECKOUT_INIT") {
    return isValidSessionId(value.sessionId) && typeof value.productId === "string" && value.productId.length > 0;
  }

  if (value.type === "CHECKOUT_CLOSE") {
    return isValidSessionId(value.sessionId);
  }

  return false;
}

export function validateCheckoutMessage(value: unknown): value is CheckoutMessage {
  if (!isRecord(value)) return false;
  if (value.version !== PROTOCOL_VERSION) return false;
  if (!isValidMessageType(value.type)) return false;

  if (value.type === "CHECKOUT_READY") {
    return isValidSessionId(value.sessionId);
  }

  if (value.type === "PAYMENT_SUCCESS") {
    return isValidSessionId(value.sessionId) && isValidAttemptId(value.attemptId);
  }

  if (value.type === "PAYMENT_ERROR") {
    return (
      isValidSessionId(value.sessionId) &&
      isValidAttemptId(value.attemptId) &&
      typeof value.code === "string" &&
      typeof value.message === "string"
    );
  }

  if (value.type === "CHECKOUT_CLOSED") {
    return isValidSessionId(value.sessionId) && typeof value.reason === "string";
  }

  return false;
}

export function isTrustedMessageOrigin(origin: string): boolean {
  return origin === CHECKOUT_ORIGIN;
}

export function isTrustedMessageSource(source: MessageEventSource | null, targetWindow: Window): boolean {
  return source === targetWindow || source === null || source === targetWindow.parent;
}

export function normalizeErrorCode(value: unknown): PaymentErrorCode {
  if (value === "PAYMENT_DECLINED") return "PAYMENT_DECLINED";
  if (value === "PAYMENT_FAILED") return "PAYMENT_FAILED";
  if (value === "CHECKOUT_CANCELLED") return "CHECKOUT_CANCELLED";
  if (value === "CHECKOUT_INITIALIZATION_FAILED") return "CHECKOUT_INITIALIZATION_FAILED";
  if (value === "CHECKOUT_LOAD_TIMEOUT") return "CHECKOUT_LOAD_TIMEOUT";
  if (value === "INVALID_CONFIGURATION") return "INVALID_CONFIGURATION";
  return "UNKNOWN_ERROR";
}
