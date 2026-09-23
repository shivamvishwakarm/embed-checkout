import { beforeEach, describe, expect, it } from "vitest";
import { SessionManager } from "../src/session-manager";
import type { CloseReason } from "../src/types";

describe("SessionManager", () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  describe("Session creation", () => {
    it("creates a new session with valid sessionId, productId, and createdAt", () => {
      const beforeTime = Date.now();
      const session = manager.createSession("prod_starter");
      const afterTime = Date.now();

      expect(session).toBeDefined();
      expect(session.sessionId).toMatch(/^cs_[a-z0-9]{12}$/);
      expect(session.productId).toBe("prod_starter");
      expect(session.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(session.createdAt).toBeLessThanOrEqual(afterTime);
      expect(manager.isActive()).toBe(true);
      expect(manager.getActiveSession()).toBe(session);
    });
  });

  describe("One-session invariant", () => {
    it("returns existing session if createSession is called while another session is active", () => {
      const firstSession = manager.createSession("prod_starter");
      const secondSession = manager.createSession("prod_enterprise");

      expect(secondSession).toBe(firstSession);
      expect(secondSession.sessionId).toBe(firstSession.sessionId);
      expect(secondSession.productId).toBe("prod_starter");
    });
  });

  describe("Terminal transitions & clear", () => {
    it("clears active session and returns previous snapshot", () => {
      const created = manager.createSession("prod_starter");
      expect(manager.isActive()).toBe(true);

      const cleared = manager.clear("USER_CLOSED");
      expect(cleared).toBe(created);
      expect(manager.isActive()).toBe(false);
      expect(manager.getActiveSession()).toBeNull();
    });

    it("supports all CloseReason terminal transitions", () => {
      const closeReasons: CloseReason[] = [
        "USER_CLOSED",
        "CHECKOUT_LOAD_TIMEOUT",
        "CHECKOUT_ERROR",
        "PAYMENT_SUCCESS",
      ];

      for (const reason of closeReasons) {
        manager.createSession("prod_test");
        expect(manager.isActive()).toBe(true);
        const cleared = manager.clear(reason);
        expect(cleared).not.toBeNull();
        expect(manager.isActive()).toBe(false);
      }
    });

    it("returns null when clear is called with no active session", () => {
      expect(manager.isActive()).toBe(false);
      const cleared = manager.clear();
      expect(cleared).toBeNull();
    });

    it("allows creating a new session with a new ID after being cleared", () => {
      const firstSession = manager.createSession("prod_1");
      manager.clear("PAYMENT_SUCCESS");

      const secondSession = manager.createSession("prod_2");
      expect(secondSession).not.toBe(firstSession);
      expect(secondSession.sessionId).not.toBe(firstSession.sessionId);
      expect(secondSession.productId).toBe("prod_2");
      expect(manager.isActive()).toBe(true);
    });
  });

  describe("State queries", () => {
    it("isActive reflects whether a session exists", () => {
      expect(manager.isActive()).toBe(false);
      manager.createSession("prod_1");
      expect(manager.isActive()).toBe(true);
      manager.clear();
      expect(manager.isActive()).toBe(false);
    });

    it("getActiveSession returns null when inactive", () => {
      expect(manager.getActiveSession()).toBeNull();
    });
  });
});
