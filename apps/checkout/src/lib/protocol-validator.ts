import { CHECKOUT_PROTOCOL_VERSION, type HostToCheckoutMessage } from "./protocol";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateHostMessage(
  event: MessageEvent,
  expectedOrigin: string,
  expectedSource: MessageEventSource | Window | null = window.parent,
): HostToCheckoutMessage | null {
  if (event.origin !== expectedOrigin) {
    return null;
  }

  if (expectedSource !== null && event.source !== expectedSource) {
    return null;
  }

  if (!isRecord(event.data)) {
    return null;
  }

  const { version, type, sessionId, productId } = event.data;

  if (version !== CHECKOUT_PROTOCOL_VERSION || typeof type !== "string") {
    return null;
  }

  if (type === "CHECKOUT_INIT") {
    if (typeof sessionId !== "string" || typeof productId !== "string") {
      return null;
    }

    return {
      version: 1,
      type: "CHECKOUT_INIT",
      sessionId,
      productId,
    };
  }

  if (type === "CHECKOUT_CLOSE") {
    if (typeof sessionId !== "string") {
      return null;
    }

    return {
      version: 1,
      type: "CHECKOUT_CLOSE",
      sessionId,
    };
  }

  return null;
}
