const globalScope = globalThis as typeof globalThis & {
  __DODO_CHECKOUT_ORIGIN__?: string;
};

const envOrigin =
  globalScope.__DODO_CHECKOUT_ORIGIN__ ??
  (typeof process !== "undefined"
    ? process.env?.["NEXT_PUBLIC_CHECKOUT_ORIGIN"] ??
      process.env?.["CHECKOUT_ORIGIN"] ??
      process.env?.["NEXT_PUBLIC_CHECKOUT_URL"]
    : undefined) ??
  "";

export const CHECKOUT_ORIGIN = envOrigin.replace(/\/$/, "");
export const CHECKOUT_URL = CHECKOUT_ORIGIN ? `${CHECKOUT_ORIGIN}/checkout` : "/checkout";
export const CHECKOUT_READY_TIMEOUT_MS = 10_000;

