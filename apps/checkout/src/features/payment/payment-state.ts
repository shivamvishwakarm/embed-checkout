import type { Product } from "@/lib/products";
import type { PaymentError } from "./payment-types";

export type CloseReason =
  | "USER_CLOSED"
  | "CHECKOUT_LOAD_TIMEOUT"
  | "PAYMENT_ERROR";

export type CheckoutState =
  | { status: "CREATED" }
  | { status: "LOADING" }
  | { status: "READY"; product: Product }
  | { status: "PROCESSING"; product: Product; attemptId: string }
  | { status: "FAILURE"; product: Product; error: PaymentError; retryable: boolean }
  | { status: "SUCCESS"; sessionId: string }
  | { status: "CLOSED"; reason: CloseReason }
  | { status: "CLOSE_CONFIRMATION"; product: Product }
  | { status: "ERROR"; code: string; message: string };

export function createInitialState(): CheckoutState {
  return { status: "CREATED" };
}

export function loadingState(): CheckoutState {
  return { status: "LOADING" };
}

export function readyState(product: Product): CheckoutState {
  return { status: "READY", product };
}

export function processingState(product: Product, attemptId: string): CheckoutState {
  return { status: "PROCESSING", product, attemptId };
}

export function failureState(
  product: Product,
  error: PaymentError,
  retryable = true,
): CheckoutState {
  return { status: "FAILURE", product, error, retryable };
}

export function successState(sessionId: string): CheckoutState {
  return { status: "SUCCESS", sessionId };
}

export function closedState(reason: CloseReason): CheckoutState {
  return { status: "CLOSED", reason };
}

export function closeConfirmationState(product: Product): CheckoutState {
  return { status: "CLOSE_CONFIRMATION", product };
}

export function errorState(code: string, message: string): CheckoutState {
  return { status: "ERROR", code, message };
}

export function isTerminalState(state: CheckoutState): boolean {
  return state.status === "SUCCESS" || state.status === "CLOSED" || state.status === "ERROR";
}
