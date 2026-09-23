export type PaymentErrorCode =
  | "INVALID_CONFIGURATION"
  | "CHECKOUT_LOAD_TIMEOUT"
  | "CHECKOUT_INITIALIZATION_FAILED"
  | "PAYMENT_DECLINED"
  | "PAYMENT_FAILED"
  | "CHECKOUT_CANCELLED"
  | "UNKNOWN_ERROR";

export type CloseReason =
  | "USER_CLOSED"
  | "CHECKOUT_LOAD_TIMEOUT"
  | "CHECKOUT_ERROR"
  | "PAYMENT_SUCCESS";

export interface DodoCheckoutOptions {
  productId: string;
  onSuccess?: (payload: { sessionId: string }) => void;
  onError?: (payload: { code: PaymentErrorCode; message: string }) => void;
  onClose?: (payload: { reason: CloseReason }) => void;
}

export interface CheckoutSessionSnapshot {
  sessionId: string;
  productId: string;
  createdAt: number;
}
