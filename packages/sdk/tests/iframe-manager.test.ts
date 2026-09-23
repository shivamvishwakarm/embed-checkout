import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CHECKOUT_URL } from "../src/config";
import { IframeManager } from "../src/iframe-manager";

describe("IframeManager", () => {
  let manager: IframeManager;

  beforeEach(() => {
    document.body.innerHTML = "";
    manager = new IframeManager();
  });

  afterEach(() => {
    manager.remove();
    document.body.innerHTML = "";
  });

  describe("create", () => {
    it("creates an HTMLIFrameElement with expected attributes and styles", () => {
      const sessionId = "cs_test123456";
      const productId = "prod_premium";

      const iframe = manager.create(sessionId, productId);

      expect(iframe).toBeInstanceOf(HTMLIFrameElement);
      expect(iframe.getAttribute("title")).toBe("Dodo Checkout");
      expect(iframe.getAttribute("allow")).toBe("payment *; billing *");
      expect(iframe.getAttribute("loading")).toBe("eager");

      const parsedUrl = new URL(iframe.src);
      expect(parsedUrl.origin + parsedUrl.pathname).toBe(CHECKOUT_URL);
      expect(parsedUrl.searchParams.get("sessionId")).toBe(sessionId);
      expect(parsedUrl.searchParams.get("productId")).toBe(productId);

      expect(iframe.style.position).toBe("fixed");
      expect(iframe.style.inset).toBe("0");
      expect(iframe.style.width).toBe("100%");
      expect(iframe.style.height).toBe("100%");
      expect(iframe.style.border).toBe("0px");
      expect(iframe.style.background).toBe("transparent");
      expect(iframe.style.zIndex).toBe("2147483647");
      expect(iframe.style.display).toBe("block");
      expect(iframe.style.overflow).toBe("hidden");
    });

    it("returns the same iframe instance if called multiple times without remove", () => {
      const iframe1 = manager.create("cs_first", "prod_1");
      const iframe2 = manager.create("cs_second", "prod_2");

      expect(iframe1).toBe(iframe2);
      expect(new URL(iframe1.src).searchParams.get("sessionId")).toBe("cs_first");
    });
  });

  describe("mount", () => {
    it("throws an error if mount is called before create", () => {
      expect(() => manager.mount()).toThrow("No checkout iframe has been created yet.");
    });

    it("attaches the iframe to the document body", () => {
      const iframe = manager.create("cs_test123", "prod_abc");
      expect(document.body.contains(iframe)).toBe(false);

      const mounted = manager.mount();
      expect(mounted).toBe(iframe);
      expect(document.body.contains(iframe)).toBe(true);
    });

    it("does not duplicate the iframe in the DOM if mount is called repeatedly", () => {
      manager.create("cs_test123", "prod_abc");
      manager.mount();
      manager.mount();

      const iframes = document.body.querySelectorAll("iframe");
      expect(iframes.length).toBe(1);
    });
  });

  describe("remove", () => {
    it("removes the iframe from the DOM and resets internal reference", () => {
      const iframe = manager.create("cs_test123", "prod_abc");
      manager.mount();
      expect(document.body.contains(iframe)).toBe(true);
      expect(manager.getIframe()).toBe(iframe);

      manager.remove();
      expect(document.body.contains(iframe)).toBe(false);
      expect(manager.getIframe()).toBeNull();
    });

    it("is safe to call when no iframe has been created or mounted", () => {
      expect(() => manager.remove()).not.toThrow();
    });

    it("allows creating a new iframe after removal", () => {
      const iframe1 = manager.create("cs_session_1", "prod_1");
      manager.remove();

      const iframe2 = manager.create("cs_session_2", "prod_2");
      expect(iframe1).not.toBe(iframe2);
      expect(new URL(iframe2.src).searchParams.get("sessionId")).toBe("cs_session_2");
    });
  });

  describe("getIframe", () => {
    it("returns null initially", () => {
      expect(manager.getIframe()).toBeNull();
    });

    it("returns the created iframe", () => {
      const iframe = manager.create("cs_test123", "prod_abc");
      expect(manager.getIframe()).toBe(iframe);
    });
  });
});
