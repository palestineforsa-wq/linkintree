import Link from "next/link";
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
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-col justify-between border-r p-4 md:flex">
        <div>
          <div className="mb-6 text-lg font-semibold">Linkintree</div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
