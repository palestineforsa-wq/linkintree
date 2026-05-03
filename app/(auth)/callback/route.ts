import { NextResponse } from "next/server";

// TODO MYWEB-4: exchange Supabase OAuth code for session, redirect to dashboard.
export async function GET() {
  return NextResponse.redirect(
    new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  );
}
