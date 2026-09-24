export type CheckoutSessionContext = {
  sessionId: string;
  productId: string;
  sourceOrigin: string;
};

export function getCheckoutSessionFromUrl(
  search: string | URL,
  fallbackOrigin = process.env["NEXT_PUBLIC_MERCHANT_ORIGIN"] ??
    process.env["NEXT_PUBLIC_CHECKOUT_ORIGIN"] ??
    "",
): CheckoutSessionContext | null {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : new URLSearchParams(search.search);

  const sessionId = params.get("sessionId");
  const productId = params.get("productId");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return null;
  }

  if (!productId) {
    return null;
  }

  return {
    sessionId,
    productId,
    sourceOrigin: fallbackOrigin,
  };
}

export class CheckoutSessionStore {
  private context: CheckoutSessionContext | null = null;

  get(): CheckoutSessionContext | null {
    return this.context;
  }

  set(context: CheckoutSessionContext): void {
    this.context = context;
  }

  clear(): void {
    this.context = null;
  }
}
