import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Blocks" },
  { href: "/dashboard/appearance", label: "Appearance" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/audience", label: "Audience" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/billing", label: "Billing" },
] as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen p-3 sm:p-5 lg:p-6">
      <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-60 flex-col justify-between rounded-3xl glass p-5 sm:top-5 sm:h-[calc(100vh-2.5rem)] md:flex lg:top-6 lg:h-[calc(100vh-3rem)]">
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 pb-1 pt-1 text-lg font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg glass-button"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Linkintree
          </Link>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
          <div className="px-3 py-1 text-xs text-muted-foreground">
            {user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-2 pt-3 sm:px-6 sm:pt-5 md:pl-8 lg:pl-10">
        {children}
      </main>
    </div>
  );
}
