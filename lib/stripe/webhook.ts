import type Stripe from "stripe";

// MYWEB-8: handlers for each event type. Idempotency lives at the route layer
// (processed_webhooks); these handlers should be safe to call once per event.

export async function onSubscriptionChange(_event: Stripe.Event) {
  // TODO: upsert subscriptions row from event.data.object
}

export async function onInvoicePaid(_event: Stripe.Event) {
  // TODO
}

export async function onCustomerDeleted(_event: Stripe.Event) {
  // TODO
}
