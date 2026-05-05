import { describe, it } from "vitest";

// Stripe webhook suite — DEFERRED with the rest of MYWEB-8.
//
// When Stripe creds land, this file should cover:
//   1. Signature verification: missing Stripe-Signature → 400
//   2. Signature verification: wrong secret → 400 (no DB write)
//   3. Idempotency: same event.id processed twice → second is a no-op
//   4. customer.subscription.created → upserts subscriptions row
//   5. customer.subscription.updated (status flip) → row reflects new status
//   6. customer.subscription.deleted → row.status = 'canceled', plan stays
//      until current_period_end so users keep Pro through their billing window
//   7. invoice.paid → no-op besides logging (subscription event drives state)
//   8. Replay attack with old timestamp → rejected (Stripe SDK does this)
//
// The handler at app/api/webhooks/stripe/route.ts already enforces (1) and
// has TODOs for the rest. lib/stripe/webhook.ts has handler stubs.
describe.skip("Stripe webhook (deferred — re-enable with MYWEB-8)", () => {
  it("placeholder", () => void 0);
});
