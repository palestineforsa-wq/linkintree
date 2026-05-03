import Link from "next/link";

export const metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent you a confirmation link. Click it to finish creating your
        account.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/signup" className="underline">
          Try again
        </Link>
      </p>
    </main>
  );
}
