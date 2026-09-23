const globalScope = globalThis as typeof globalThis & {
  __DODO_CHECKOUT_ORIGIN__?: string;
};

const envOrigin = globalScope.__DODO_CHECKOUT_ORIGIN__;

export const CHECKOUT_ORIGIN = (envOrigin ?? "http://localhost:3001").replace(/\/$/, "");
export const CHECKOUT_URL = `${CHECKOUT_ORIGIN}/checkout`;
export const CHECKOUT_READY_TIMEOUT_MS = 10_000;
