import type { CheckoutSessionSnapshot, CloseReason } from "./types";
import { generateSessionId } from "./ids";

export class SessionManager {
  private activeSession: CheckoutSessionSnapshot | null = null;

  public createSession(productId: string): CheckoutSessionSnapshot {
    if (this.activeSession) {
      return this.activeSession;
    }

    this.activeSession = {
      sessionId: generateSessionId(),
      productId,
      createdAt: Date.now(),
    };

    return this.activeSession;
  }

  public getActiveSession(): CheckoutSessionSnapshot | null {
    return this.activeSession;
  }

  public clear(reason?: CloseReason): CheckoutSessionSnapshot | null {
    const session = this.activeSession;
    this.activeSession = null;
    void reason;
    return session;
  }

  public isActive(): boolean {
    return this.activeSession !== null;
  }
}
