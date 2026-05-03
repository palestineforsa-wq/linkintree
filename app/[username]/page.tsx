import { notFound } from "next/navigation";

type Params = { username: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `${username} on Linkintree`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;

  // TODO MYWEB-6: fetch profile + active blocks via Drizzle, render via lib/blocks/render.
  // RSC; no client JS unless a block needs it.
  const profile = null as { username: string } | null;
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-muted" />
        <h1 className="mt-3 text-xl font-semibold">@{username}</h1>
      </header>
      <ul className="mt-8 flex flex-col gap-3">
        {/* blocks render here */}
      </ul>
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        Powered by Linkintree
      </footer>
    </main>
  );
}
