import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground transition hover:text-foreground"
      >
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg glass-button"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        Linkintree
      </Link>
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-x-8 -inset-y-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-fuchsia-500/20 via-violet-500/20 to-sky-500/20 blur-3xl" />
        <div className="rounded-3xl glass-strong p-8 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-7">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
