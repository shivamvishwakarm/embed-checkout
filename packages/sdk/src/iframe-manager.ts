import { CHECKOUT_URL } from "./config";

export class IframeManager {
  private iframe: HTMLIFrameElement | null = null;

  public create(sessionId: string, productId: string): HTMLIFrameElement {
    if (this.iframe) {
      return this.iframe;
    }

    const url = new URL(CHECKOUT_URL);
    url.searchParams.set("sessionId", sessionId);
    url.searchParams.set("productId", productId);

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Dodo Checkout");
    iframe.setAttribute("allow", "payment *; billing *");
    iframe.setAttribute("loading", "eager");
    iframe.setAttribute("src", url.toString());
    iframe.style.position = "fixed";
    iframe.style.inset = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.background = "transparent";
    iframe.style.zIndex = "2147483647";
    iframe.style.display = "block";
    iframe.style.overflow = "hidden";

    this.iframe = iframe;
    return iframe;
  }

  public mount(): HTMLIFrameElement {
    if (!this.iframe) {
      throw new Error("No checkout iframe has been created yet.");
    }

    const root = document.body ?? document.documentElement;
    if (!root.contains(this.iframe)) {
      root.appendChild(this.iframe);
    }

    return this.iframe;
  }

  public remove(): void {
    if (!this.iframe) {
      return;
    }

    this.iframe.remove();
    this.iframe = null;
  }

  public getIframe(): HTMLIFrameElement | null {
    return this.iframe;
  }
}
