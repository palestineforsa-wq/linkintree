import { z } from "zod";

// Lowercase alphanumeric + hyphen + underscore.
// Must start and end with alphanumeric. No consecutive special chars.
// Length is enforced separately by .min(3).max(30) — regex is structural only.
const USERNAME_REGEX = /^[a-z0-9](?:[-_]?[a-z0-9])*$/;

export const usernameSchema = z
  .string()
  .min(3, "At least 3 characters.")
  .max(30, "At most 30 characters.")
  .transform((s) => s.toLowerCase())
  .pipe(
    z
      .string()
      .regex(
        USERNAME_REGEX,
        "Letters, numbers, and single - or _ between them only.",
      ),
  );

export const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .email("That doesn't look like a valid email.");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters.")
  .max(128, "Too long. Try a passphrase under 128 chars.");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
