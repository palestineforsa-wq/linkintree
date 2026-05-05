import Link from "next/link";

export const metadata = { title: "Terms" };

// PLACEHOLDER COPY — not legal advice. Replace with real terms before launch.
// Reviewed by counsel familiar with US/EU consumer SaaS at minimum.

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Placeholder draft — replace with reviewed copy before public launch.
      </p>

      <Section title="1. Accounts">
        You need an account to use Linkintree. You&apos;re responsible for
        keeping your password safe and for all activity on your account.
        You must be at least 13 years old to sign up.
      </Section>

      <Section title="2. Your content">
        You own the content you put on your page — links, text, images,
        embeds. By using Linkintree, you grant us a non-exclusive, worldwide
        license to host, store, and serve that content so we can show it to
        the people who visit your URL.
      </Section>

      <Section title="3. Acceptable use">
        Don&apos;t use Linkintree to host content that&apos;s illegal,
        infringes someone else&apos;s rights, harasses or threatens people,
        spreads malware, or runs spam/scam campaigns. We may suspend or
        remove accounts that violate this.
      </Section>

      <Section title="4. Free and paid plans">
        Free is free, forever. Pro features are gated to paid accounts;
        pricing and billing terms are described on the{" "}
        <Link href="/pricing" className="underline">
          Pricing
        </Link>{" "}
        page. Pricing may change with reasonable notice. Existing
        subscriptions retain their rate through the end of their current
        billing period.
      </Section>

      <Section title="5. Termination">
        You can delete your account at any time from Settings. We can
        terminate accounts that violate these terms with notice when
        practical, or immediately for severe abuse.
      </Section>

      <Section title="6. Disclaimers and limits">
        Linkintree is provided &quot;as is&quot; without warranty. We&apos;re
        not liable for indirect or consequential damages. Our total
        liability for any claim is limited to the amount you paid us in the
        12 months before the claim arose, or $50, whichever is greater.
      </Section>

      <Section title="7. Changes">
        We may update these terms. Material changes will be announced; your
        continued use after the change date counts as acceptance.
      </Section>

      <Section title="8. Contact">
        Questions: <code>support@linkintree</code> (placeholder).
      </Section>

      <p className="mt-12 text-xs text-muted-foreground">
        Last updated: placeholder.
      </p>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </section>
  );
}
