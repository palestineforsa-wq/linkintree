import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Server-only, never import from client code.
// Use for: Stripe webhook → subscriptions sync, click/page_view inserts,
// email_capture inserts from server actions, admin operations.

let cached: ReturnType<typeof createClient> | null = null;

export function createSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
