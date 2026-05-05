import Link from "next/link";

export const metadata = { title: "Privacy" };

// PLACEHOLDER COPY — replace with reviewed privacy policy before launch.
// What's accurate today (and worth keeping): the visitor-hash design and
// the bot filter. The rest is template-shaped and needs counsel.

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Placeholder draft — replace with reviewed copy before public launch.
      </p>

      <Section title="What we collect from creators">
        Email and password (or OAuth identity) for your account. The content
        you put on your profile — display name, bio, links, blocks. Plan and
        billing metadata if you upgrade. Email captures from your own visitors
        if you add an email-capture block.
      </Section>

      <Section title="What we collect from visitors">
        When someone views your public page or clicks a link, we record:
        timestamp, country (when available from CDN headers), browser family,
        device class (mobile/tablet/desktop), referrer, and a privacy-
        respecting visitor hash described below. We do not store IP addresses
        or any other directly identifying data.
      </Section>

      <Section title="The visitor hash, in detail">
        Unique-visitor counts within a single day need a way to tell two
        page-views from one. We compute SHA-256 of (IP + User-Agent +
        daily-rotating salt). The salt changes every UTC midnight, so the
        same visitor produces a different hash the next day — meaning we can
        count uniques today but cannot link the same person across days.
        The hash is one-way; the IP is never stored.
      </Section>

      <Section title="Bots and crawlers">
        We drop traffic from known bot user-agents before any logging runs.
        This avoids both privacy concerns and inflated analytics.
      </Section>

      <Section title="Cookies">
        Strictly necessary cookies only — session cookies for keeping you
        logged in. We don&apos;t serve third-party tracking scripts on
        public profile pages.
      </Section>

      <Section title="Sharing">
        We don&apos;t sell creator or visitor data. Service providers that
        help us run the product (Supabase for hosting + auth + database;
        Stripe for billing once enabled; Resend for transactional email)
        process data on our behalf under their own DPAs.
      </Section>

      <Section title="Your rights">
        You can export, edit, or delete your data from Settings. Visitors can
        contact us to request deletion of any data tied to their email
        captures via the creator who collected them.
      </Section>

      <Section title="Children">
        Not directed at children under 13. We don&apos;t knowingly collect
        their data.
      </Section>

      <Section title="Changes">
        We&apos;ll announce material changes. Continued use after the change
        date counts as acceptance.
      </Section>

      <Section title="Contact">
        Privacy questions: <code>privacy@linkintree</code> (placeholder).
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
