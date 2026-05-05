import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { unstable_after as after } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blocks as blocksTable, profiles, subscriptions } from "@/lib/db/schema";
import { BlockRenderer } from "@/components/blocks/Renderer";
import { resolveProfileTheme, getThemeTokens } from "@/lib/themes/schema";
import { tokensToStyle } from "@/lib/themes/presets";
import {
  extractRequestContext,
  isBot,
  logPageView,
} from "@/lib/analytics/log";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { username: string };

async function loadProfile(username: string) {
  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      theme: profiles.theme,
      seoTitle: profiles.seoTitle,
      seoDescription: profiles.seoDescription,
      ogImageUrl: profiles.ogImageUrl,
      isVerified: profiles.isVerified,
    })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  return profile ?? null;
}

async function loadActiveBlocks(profileId: string) {
  return db
    .select()
    .from(blocksTable)
    .where(
      and(
        eq(blocksTable.profileId, profileId),
        eq(blocksTable.isActive, true),
      ),
    )
    .orderBy(asc(blocksTable.position));
}

async function loadPlan(userId: string) {
  const [row] = await db
    .select({ plan: subscriptions.plan })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return row?.plan ?? "free";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) return { title: "Not found" };

  const title =
    profile.seoTitle || profile.displayName || `@${profile.username}`;
  const description =
    profile.seoDescription ||
    profile.bio ||
    `${profile.displayName ?? `@${profile.username}`} on Linkintree.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${profile.username}`,
      // TODO: dynamic /[username]/opengraph-image is blocked by a Windows
      // path bug in Next.js 15.0.3 + bundled @vercel/og. Re-enable after
      // Next.js upgrade in MYWEB-12. Pro creators can still set ogImageUrl.
      images: profile.ogImageUrl ? [{ url: profile.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) notFound();

  const [activeBlocks, plan, h] = await Promise.all([
    loadActiveBlocks(profile.id),
    loadPlan(profile.id),
    headers(),
  ]);

  // Page-view log: fire-and-forget after the response is sent. Bots are
  // filtered before insert (spec §8). Logger never throws.
  if (!isBot(h.get("user-agent"))) {
    const ctx = extractRequestContext(h);
    after(() => logPageView({ profileId: profile.id, ctx }));
  }

  const theme = resolveProfileTheme(profile.theme);
  const tokens = getThemeTokens(theme);
  const showPoweredBy = plan === "free";

  const displayName = profile.displayName || `@${profile.username}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    alternateName: `@${profile.username}`,
    url: `/${profile.username}`,
    description: profile.bio ?? undefined,
    image: profile.avatarUrl ?? undefined,
  };

  return (
    <div style={tokensToStyle(tokens)} className="relative min-h-screen">
      <main className="mx-auto max-w-md px-5 py-14">
        <header className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <span
              aria-hidden
              className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-br from-fuchsia-500/40 via-violet-500/40 to-sky-500/40 blur-xl"
            />
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-1 ring-white/10"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div
                aria-hidden
                className="h-24 w-24 rounded-full ring-1 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, hsl(${tokens.accent}), hsl(${tokens.muted}))`,
                }}
              />
            )}
          </div>
          <h1 className="mt-4 flex items-center justify-center gap-1.5 text-xl font-semibold tracking-tight">
            {displayName}
            {profile.isVerified ? (
              <span
                aria-label="Verified"
                title="Verified"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                style={{
                  backgroundColor: `hsl(${tokens.accent})`,
                  color: `hsl(${tokens.accentForeground})`,
                }}
              >
                ✓
              </span>
            ) : null}
          </h1>
          <p
            className="text-sm"
            style={{ color: `hsl(${tokens.mutedForeground})` }}
          >
            @{profile.username}
          </p>
          {profile.bio ? (
            <p className="mx-auto mt-4 max-w-sm whitespace-pre-line text-sm leading-relaxed">
              {profile.bio}
            </p>
          ) : null}
        </header>

        <ul className="mt-10 flex flex-col gap-2.5">
          {activeBlocks.map((block) => (
            <li key={block.id}>
              <BlockRenderer block={block} />
            </li>
          ))}
        </ul>

        {showPoweredBy ? (
          <footer
            className="mt-14 text-center text-xs"
            style={{ color: `hsl(${tokens.mutedForeground})` }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 hover:bg-white/15"
              style={{ color: `hsl(${tokens.mutedForeground})` }}
            >
              Powered by Linkintree
            </Link>
          </footer>
        ) : null}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
