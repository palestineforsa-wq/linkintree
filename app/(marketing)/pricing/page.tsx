export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <p className="mt-2 text-muted-foreground">
        Free forever. Upgrade when you outgrow it.
      </p>
      {/* TODO MYWEB-9: real pricing tiers */}
    </main>
  );
}
