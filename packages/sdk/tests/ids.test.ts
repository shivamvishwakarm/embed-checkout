import { describe, expect, it } from "vitest";
import { generateAttemptId, generateSessionId } from "../src/ids";

describe("ids", () => {
  describe("generateSessionId", () => {
    it("generates a session ID with cs_ prefix and 12 alphanumeric characters", () => {
      const sessionId = generateSessionId();
      expect(sessionId).toMatch(/^cs_[a-z0-9]{12}$/);
    });

    it("generates unique session IDs across invocations", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i += 1) {
        ids.add(generateSessionId());
      }
      expect(ids.size).toBe(50);
    });
  });

  describe("generateAttemptId", () => {
    it("generates an attempt ID with pa_ prefix and 12 alphanumeric characters", () => {
      const attemptId = generateAttemptId();
      expect(attemptId).toMatch(/^pa_[a-z0-9]{12}$/);
    });

    it("generates unique attempt IDs across invocations", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i += 1) {
        ids.add(generateAttemptId());
      }
      expect(ids.size).toBe(50);
    });
  });
});
