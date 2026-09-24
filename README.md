# Dodo Checkout — Embeddable Checkout Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-79%20passed-success.svg)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-green.svg)](https://playwright.dev/)

**Dodo Checkout** is a frontend-only embeddable checkout solution built in TypeScript and Next.js. It enables any merchant website to integrate a secure checkout modal with a lightweight JavaScript SDK. The customer completes their purchase without leaving the merchant page, while the checkout form runs isolated in a cross-origin iframe.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Monorepo Structure](#monorepo-structure)
- [Quick Start](#quick-start)
- [SDK Integration & API Reference](#sdk-integration--api-reference)
- [Deterministic Test Cards](#deterministic-test-cards)
- [Communication Protocol & Security](#communication-protocol--security)
- [UX, Accessibility & Resilience](#ux-accessibility--resilience)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Architectural Trade-offs & Production Roadmap](#architectural-trade-offs--production-roadmap)

---

## Architecture Overview

The system consists of three distinct packages configured within a `pnpm` monorepo:

```
┌────────────────────────────────────────────────────────┐
│  Merchant Storefront (apps/merchant @ port 3000)       │
│                                                        │
│   1. Merchant imports @dodo/sdk                        │
│   2. Calls DodoCheckout.open({ productId: '...' })     │
│   3. Receives callbacks: onSuccess / onError / onClose │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │ @dodo/sdk (packages/sdk)                       │   │
│   │  • Creates & mounts backdrop overlay           │   │
│   │  • Mounts cross-origin <iframe>                │   │
│   │  • Enforces 1 active session invariant         │   │
│   │  • Manages bidirectional postMessage protocol  │   │
│   │  • Traps & restores keyboard focus             │   │
│   └───────────────────────▲────────────────────────┘   │
└───────────────────────────┼────────────────────────────┘
                            │ postMessage (Origin Validated)
┌───────────────────────────▼────────────────────────────┐
│  Checkout App (apps/checkout @ port 3001)              │
│                                                        │
│   • Renders checkout UI inside iframe                  │
│   • Product summary & live currency formatting         │
│   • Card validation (Luhn-aware formatting, CVV, Exp)  │
│   • Deterministic Fake Payment Engine                  │
│   • State machine & close confirmation guard           │
└────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
dodo-checkout/
├── apps/
│   ├── checkout/                   # Standalone Next.js 14 Checkout App (Port 3001)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── checkout/page.tsx   # Iframe embedded checkout page
│   │       │   ├── layout.tsx          # Minimal isolated layout
│   │       │   └── globals.css         # Styling with dark theme accents
│   │       ├── components/checkout/    # Domain-specific UI components
│   │       │   ├── card-form.tsx       # Form with live input formatting
│   │       │   ├── checkout-header.tsx # Header with dismiss button
│   │       │   ├── checkout-shell.tsx  # Root checkout state controller
│   │       │   ├── close-confirmation.tsx # In-flight payment confirmation dialog
│   │       │   ├── customer-form.tsx   # Email address input
│   │       │   ├── payment-button.tsx  # Dynamic CTA with loading spinners
│   │       │   ├── payment-error.tsx   # Error state & retry handling
│   │       │   ├── payment-success.tsx # Success confirmation screen
│   │       │   └── product-summary.tsx # Item name, description, and price badge
│   │       ├── features/payment/
│   │       │   ├── fake-payment-engine.ts # Deterministic test-card simulator
│   │       │   ├── payment-errors.ts   # Error codes & user-facing messages
│   │       │   ├── payment-state.ts    # Explicit state machine transitions
│   │       │   └── payment-types.ts    # Shared payment domain models
│   │       └── lib/
│   │           ├── products.ts         # Mock product catalog
│   │           ├── protocol.ts         # Checkout-side postMessage handlers
│   │           ├── protocol-validator.ts # Frame origin & payload validation
│   │           └── session.ts          # URL param & session state extraction
│   │
│   └── merchant/                   # Demo Merchant Storefront (Port 3000)
│       └── src/
│           ├── app/page.tsx            # Interactive storefront page
│           ├── components/
│           │   ├── checkout-demo.tsx   # Demo harness connecting SDK & event log
│           │   ├── event-log.tsx       # Real-time event & protocol inspector
│           │   ├── product-card.tsx    # Product showcase with buy triggers
│           │   └── test-card-panel.tsx # Quick-copy test card reference
│           └── lib/checkout.ts         # SDK consumer adapter
│
├── packages/
│   └── sdk/                        # Framework-agnostic TypeScript SDK
│       ├── src/
│       │   ├── config.ts               # Default timeouts & target checkout URLs
│       │   ├── dodo-checkout.ts        # Public static singleton API
│       │   ├── errors.ts               # Normalized error schemas
│       │   ├── ids.ts                  # Non-sequential opaque ID generators
│       │   ├── iframe-manager.ts       # DOM injection, styling & teardown
│       │   ├── index.ts                # Public SDK exports
│       │   ├── message-validator.ts    # Strict origin & schema validation
│       │   ├── protocol.ts             # Versioned protocol definitions
│       │   ├── session-manager.ts      # Active session lifecycle tracker
│       │   └── types.ts                # Public TypeScript interfaces
│       └── tests/                      # 79 Unit tests across 7 test suites
│
├── e2e/                            # Playwright end-to-end integration tests
├── package.json                    # Monorepo orchestration scripts
└── pnpm-workspace.yaml
```

---

## Quick Start

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v8.0.0` or higher (recommended) or `npm` / `yarn`

### 1. Installation

Clone the repository and install all dependencies:

```bash
cd dodo-checkout
pnpm install
```

### 2. Configure Environment

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Default configuration values:
```env
NEXT_PUBLIC_MERCHANT_PORT=3000
NEXT_PUBLIC_CHECKOUT_PORT=3001
NEXT_PUBLIC_CHECKOUT_ORIGIN=http://localhost:3001
NEXT_PUBLIC_MERCHANT_ORIGIN=http://localhost:3000
```

### 3. Run Development Servers

Start both the Checkout application and the Merchant demo storefront concurrently:

```bash
pnpm dev
```

- **Merchant Demo**: [http://localhost:3000](http://localhost:3000)
- **Checkout Service**: [http://localhost:3001](http://localhost:3001)

Open [http://localhost:3000](http://localhost:3000) to view the merchant store, test purchases, and inspect real-time SDK callbacks and protocol message logs.

---

## SDK Integration & API Reference

### Installation into a Merchant Application

```bash
# In your merchant project:
npm install @dodo/sdk
# or
pnpm add @dodo/sdk
```

### Basic Usage

```typescript
import { DodoCheckout } from "@dodo/sdk";

// Open the checkout modal
DodoCheckout.open({
  productId: "prod_123",

  onSuccess: ({ sessionId }) => {
    console.log("Payment completed! Session:", sessionId);
    // e.g., redirect to merchant confirmation page or update user state
  },

  onError: ({ code, message }) => {
    console.error(`Checkout error [${code}]: ${message}`);
  },

  onClose: ({ reason }) => {
    console.log("Checkout closed with reason:", reason);
    // Reasons: "USER_CLOSED" | "PAYMENT_SUCCESS" | "PROCESSING_CANCELLED" | "CHECKOUT_ERROR"
  },
});
```

### Programmatic Control

```typescript
// Close the checkout modal programmatically from merchant code
DodoCheckout.close();
```

### TypeScript API Definitions

```typescript
export interface DodoCheckoutOptions {
  /** The unique identifier of the product being purchased */
  productId: string;
  /** Callback fired when a payment successfully settles */
  onSuccess?: (payload: { sessionId: string }) => void;
  /** Callback fired when an error occurs or payment fails permanently */
  onError?: (payload: { code: PaymentErrorCode; message: string }) => void;
  /** Callback fired when the checkout overlay is closed */
  onClose?: (payload: { reason: CloseReason }) => void;
}

export type PaymentErrorCode =
  | "PAYMENT_DECLINED"
  | "INVALID_CARD"
  | "EXPIRED_CARD"
  | "INSUFFICIENT_FUNDS"
  | "PROCESSING_ERROR"
  | "CHECKOUT_LOAD_TIMEOUT"
  | "INVALID_PRODUCT"
  | "UNKNOWN_ERROR";

export type CloseReason =
  | "USER_CLOSED"
  | "PAYMENT_SUCCESS"
  | "PROCESSING_CANCELLED"
  | "CHECKOUT_ERROR";
```

---

## Deterministic Test Cards

The checkout features a deterministic mock payment engine (`DeterministicFakePaymentEngine`). No real financial network requests are executed.

| Card Number | Expiry | CVV | Expected Outcome | Behavior & Description |
|---|---|---|---|---|
| `4242 4242 4242 4242` | Any future date (e.g. `12/28`) | Any 3 digits (`123`) | **Success** | Immediate approval, transitions to success state and triggers `onSuccess`. |
| `4000 0000 0000 0002` | Any future date (e.g. `12/28`) | Any 3 digits (`123`) | **Decline** | Card is declined with `PAYMENT_DECLINED`. Customer can retry. |
| `4000 0000 0000 0341` | Any future date (e.g. `12/28`) | Any 3 digits (`123`) | **Retry (Decline -> Success)** | Fails on attempt #1, but succeeds on attempt #2 with the same session. |

---

## Communication Protocol & Security

### Cross-Origin Communication via `postMessage`

All communication between the merchant parent window and the checkout iframe happens via `window.postMessage` with strict security constraints:

1. **Origin Verification**: Both sides verify `event.origin` against the permitted checkout/merchant origin. Unrecognized origins are rejected silently.
2. **Source Window Verification**: The SDK asserts that messages originate strictly from the hosted `iframe.contentWindow`.
3. **Session ID Binding**: All protocol messages contain a `sessionId` (`cs_...`) matching the active session. Messages with mismatched IDs are ignored.
4. **Structured Schema & Versioning**: All protocol messages carry `version: 1` and conform to discriminated TypeScript union types.
5. **No Sensitive Data in postMessage**: PAN (card numbers), CVVs, and expiry dates never leave the iframe context.

```
Merchant / SDK Window                                Checkout Iframe
       │                                                    │
       │─── CHECKOUT_INIT (sessionId, productId) ──────────>│
       │<── CHECKOUT_READY (sessionId) ─────────────────────│
       │                                                    │
       │               [Customer Enters Payment]            │
       │                                                    │
       │<── PAYMENT_SUCCESS (sessionId, attemptId) ─────────│  (On Success)
       │    -- OR --                                        │
       │<── PAYMENT_ERROR (code, message) ──────────────────│  (On Failure)
       │                                                    │
       │─── CHECKOUT_CLOSE (sessionId) ────────────────────>│  (If User/Merchant closes)
       │<── CHECKOUT_CLOSED (sessionId, reason) ────────────│
```

---

## UX, Accessibility & Resilience

- **Single-Session Invariant / Idempotency**: Calling `DodoCheckout.open()` multiple times in rapid succession or double-clicking the checkout trigger will not spawn duplicate iframes or sessions.
- **In-Flight Confirmation Guard**: If a user attempts to close the checkout while a transaction is in `PROCESSING` state, a confirmation prompt appears asking to confirm aborting the transaction.
- **Focus Management & Keyboard Trapping**:
  - Focus moves automatically into the checkout frame when opened.
  - Pressing `Escape` invokes graceful dismissal.
  - When the checkout closes, focus returns to the previously focused DOM element on the merchant page.
- **Accessibility & Motion**:
  - All form controls feature explicit labels, semantic HTML, and `aria-describedby` associations for validation feedback.
  - Full support for `prefers-reduced-motion` media queries on loading animations and transitions.
- **Mobile Responsive**: Adaptive CSS layout ensures optimal display across mobile viewports, tablets, and desktop displays.

---

## Testing & Quality Assurance

### 1. Unit & Integration Tests (Vitest)

The SDK and protocol logic are covered by 79 comprehensive unit tests:

```bash
pnpm test
```

Test suites cover:
- `dodo-checkout.test.ts`: Open/close lifecycles, duplicate open protection, callback dispatch.
- `session-manager.test.ts`: State machine invariants, terminal state transitions, session isolation.
- `iframe-manager.test.ts`: Overlay creation, iframe mounting, attribute configuration, clean teardown.
- `message-validator.test.ts`: Origin validation, source verification, protocol payload assertions.
- `protocol.test.ts`: Discriminated union verification and version integrity.
- `ids.test.ts` & `errors.test.ts`: ID generation format and error code mapping.

### 2. Type Checking

Validate TypeScript compliance across all apps and packages:

```bash
pnpm typecheck
```

### 3. End-to-End Tests (Playwright)

Run browser integration tests:

```bash
pnpm test:e2e
```

---

## Architectural Trade-offs & Production Roadmap

### Why Cross-Origin Iframe over Web Components or Popups?

| Approach | Security & Compliance | Merchant Compatibility | User Experience | Decision |
|---|---|---|---|---|
| **Cross-Origin Iframe** (Selected) | **High**: Zero exposure of cardholder data to merchant DOM (reduces PCI-DSS scope). Isolated CSS prevents host styling conflicts. | **High**: Single `<script>` or npm package embed. | **High**: Seamless modal overlay on top of merchant experience. | **Selected** |
| **Same-Origin / React Component** | **Low**: Merchant JavaScript has direct access to card inputs (increases PCI compliance burden). CSS leakage risks. | **Low**: Tightly coupled to merchant frontend framework (e.g. React version lock-in). | **High**: Seamless styling. | Rejected |
| **Popup Window** | **Medium**: Cross-origin isolated, but popup blockers frequently suppress windows. | **High**: Simple `window.open`. | **Low**: Fragmented mobile experience, easily lost behind parent windows. | Rejected |

### Production Roadmap & Future Improvements

1. **3D Secure & Step-Up Authentication**: Support redirect/iframe challenges for SCA/3DS2 compliance.
2. **Server-Side Session Creation**: Provide backend endpoints for merchants to create authenticated sessions with HMAC-signed tokens (`cs_sec_...`).
3. **Webhook Notifications**: Asynchronous webhook events for merchant order fulfillment pipelines.
4. **Theme Customization Tokens**: Allow merchants to pass custom brand colors, font families, and corner radii via sanitized URL parameters.
5. **Internationalization (i18n)**: Locale negotiation for localized strings and currency formatting.
