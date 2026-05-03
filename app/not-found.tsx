import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Not found</h1>
      <p className="mt-2 text-muted-foreground">
        That page doesn&apos;t exist.
      </p>
      <Link href="/" className="mt-6 text-sm underline">
        Back home
      </Link>
    </main>
  );
}
