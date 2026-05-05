import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent you a confirmation link. Click it to finish creating your account."
      footer={
        <>
          Wrong email?{" "}
          <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
            Try again
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <span
          aria-hidden
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl glass-button"
        >
          <Mail className="h-6 w-6" />
        </span>
        <p className="text-center text-sm text-muted-foreground">
          The link expires in 1 hour. If it doesn&apos;t arrive, check spam or
          retry signup.
        </p>
      </div>
    </AuthShell>
  );
}
