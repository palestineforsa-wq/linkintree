import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;

export const resend = key ? new Resend(key) : null;

export function requireResend() {
  if (!resend) throw new Error("RESEND_API_KEY is not configured");
  return resend;
}
