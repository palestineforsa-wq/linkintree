import { describe, expect, it } from "vitest";
import {
  emailSchema,
  passwordSchema,
  signupSchema,
  usernameSchema,
} from "@/lib/auth/schemas";

describe("usernameSchema", () => {
  it.each([
    "abc",
    "abc123",
    "a-b",
    "a_b",
    "user-name",
    "user_name",
    "u".repeat(30),
    "a1b2c3d4",
  ])("accepts %s", (u) => {
    expect(usernameSchema.safeParse(u).success).toBe(true);
  });

  it.each([
    "ab", // too short
    "u".repeat(31), // too long
    "-abc", // leading hyphen
    "abc-", // trailing hyphen
    "_abc", // leading underscore
    "abc_", // trailing underscore
    "a--b", // double special
    "a__b",
    "a-_b",
    "a b", // space
    "a.b", // dot
    "a@b", // @
    "a/b",
    "AB", // uppercase before transform — wait, transform lowercases
  ])("rejects %s", (u) => {
    const result = usernameSchema.safeParse(u);
    // "AB" is a special case — it gets lowercased to "ab" which is too short
    // (only 2 chars). All other rejections are direct.
    expect(result.success).toBe(false);
  });

  it("lowercases input via transform", () => {
    const result = usernameSchema.safeParse("MyName");
    expect(result.success).toBe(true);
    expect(result.success && result.data).toBe("myname");
  });
});

describe("emailSchema", () => {
  it("accepts valid", () => {
    expect(emailSchema.safeParse("a@b.co").success).toBe(true);
  });
  it("rejects empty / invalid", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("requires at least 8 chars", () => {
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
  });
});

describe("signupSchema", () => {
  it("validates whole-form happy path", () => {
    expect(
      signupSchema.safeParse({
        email: "creator@example.com",
        password: "correcthorsebattery",
        username: "creator-1",
      }).success,
    ).toBe(true);
  });

  it("returns the field path on failure", () => {
    const result = signupSchema.safeParse({
      email: "creator@example.com",
      password: "short",
      username: "ok",
    });
    expect(result.success).toBe(false);
    const fields = result.success
      ? []
      : result.error.issues.map((i) => i.path[0]);
    expect(fields).toContain("password");
    expect(fields).toContain("username");
  });
});
