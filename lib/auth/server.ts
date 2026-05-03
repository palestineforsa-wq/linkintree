import { redirect } from "next/navigation";

// MYWEB-4: full Supabase SSR client with cookies(). For now, return null so
// the dashboard guard works at runtime — typecheck-only scaffold.
export type SessionUser = { id: string; email: string };

export async function getUser(): Promise<SessionUser | null> {
  // TODO: createServerClient from @supabase/ssr, read cookies, return user.
  return null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
