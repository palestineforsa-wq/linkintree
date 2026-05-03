export const metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription via the Stripe Customer Portal.
      </p>
      {/* TODO MYWEB-8: checkout button + portal redirect */}
    </div>
  );
}
