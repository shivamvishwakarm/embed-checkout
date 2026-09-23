export type PaymentErrorCode =
  | "PAYMENT_DECLINED"
  | "INVALID_CARD"
  | "UNKNOWN_ERROR";

export type PaymentInput = {
  productId: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName?: string;
};

export type PaymentAttemptStatus = "pending" | "succeeded" | "declined" | "failed";

export type PaymentError = {
  code: PaymentErrorCode;
  message: string;
  retryable: boolean;
};

export type PaymentAttempt = {
  id: string;
  status: PaymentAttemptStatus;
  createdAt: string;
  finishedAt?: string;
  code?: PaymentErrorCode;
  message?: string;
};

export type PaymentResult = {
  ok: boolean;
  attemptId: string;
  status: "succeeded" | "declined" | "failed";
  error?: PaymentError;
  message?: string;
};
