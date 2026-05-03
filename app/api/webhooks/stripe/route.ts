import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs"; // Stripe SDK needs Node runtime
export const dynamic = "force-dynamic";

// MYWEB-8: signature verification + idempotency before any DB write.
export async function POST(req: NextRequest) {
  const _signature = req.headers.get("stripe-signature");
  if (!_signature) {
    return new NextResponse("missing signature", { status: 400 });
  }

  // TODO: stripe.webhooks.constructEvent(body, sig, secret)
  // TODO: idempotency check via processed_webhooks(event.id) table
  // TODO: handle customer.subscription.created/updated/deleted, invoice.paid, etc.

  return NextResponse.json({ received: true });
}
