export const PROTOCOL_VERSION = 1 as const;

export type HostMessageType = "CHECKOUT_INIT" | "CHECKOUT_CLOSE";
export type CheckoutMessageType =
  | "CHECKOUT_READY"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_ERROR"
  | "CHECKOUT_CLOSED";

export type MessageType = HostMessageType | CheckoutMessageType;

export interface BaseMessage {
  version: typeof PROTOCOL_VERSION;
  type: MessageType;
}

export interface CheckoutInitMessage extends BaseMessage {
  type: "CHECKOUT_INIT";
  sessionId: string;
  productId: string;
}

export interface CheckoutCloseMessage extends BaseMessage {
  type: "CHECKOUT_CLOSE";
  sessionId: string;
}

export interface CheckoutReadyMessage extends BaseMessage {
  type: "CHECKOUT_READY";
  sessionId: string;
}

export interface PaymentSuccessMessage extends BaseMessage {
  type: "PAYMENT_SUCCESS";
  sessionId: string;
  attemptId: string;
}

export interface PaymentErrorMessage extends BaseMessage {
  type: "PAYMENT_ERROR";
  sessionId: string;
  attemptId: string;
  code: string;
  message: string;
}

export interface CheckoutClosedMessage extends BaseMessage {
  type: "CHECKOUT_CLOSED";
  sessionId: string;
  reason: string;
}

export type HostMessage = CheckoutInitMessage | CheckoutCloseMessage;
export type CheckoutMessage =
  | CheckoutReadyMessage
  | PaymentSuccessMessage
  | PaymentErrorMessage
  | CheckoutClosedMessage;

export const HOST_MESSAGE_TYPES: HostMessageType[] = ["CHECKOUT_INIT", "CHECKOUT_CLOSE"];
export const CHECKOUT_MESSAGE_TYPES: CheckoutMessageType[] = [
  "CHECKOUT_READY",
  "PAYMENT_SUCCESS",
  "PAYMENT_ERROR",
  "CHECKOUT_CLOSED",
];

export function isMessageLike(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
