import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything EXCEPT static assets, the public profile cache layer
  // (handled by Nginx s-maxage per spec §3), and OG image generation.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
