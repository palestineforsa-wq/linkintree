"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  signupSchema,
  type SignupInput,
} from "@/lib/auth/schemas";
import {
  checkUsernameAvailability,
  signupAction,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Availability =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; reason: string };

const DEBOUNCE_MS = 350;

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [availability, setAvailability] = useState<Availability>({
    state: "idle",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const usernameValue = watch("username");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!usernameValue || usernameValue.length < 3) {
      setAvailability({ state: "idle" });
      return;
    }
    setAvailability({ state: "checking" });
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameAvailability(usernameValue);
      if (!result.ok || !result.data) {
        setAvailability({ state: "idle" });
        return;
      }
      setAvailability(
        result.data.available
          ? { state: "available" }
          : { state: "unavailable", reason: result.data.reason ?? "Taken." },
      );
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [usernameValue]);

  const onSubmit = (input: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signupAction(input);
      if (!result.ok) {
        if (result.field === "username") {
          setError("username", { message: result.error });
        } else {
          setServerError(result.error);
        }
        return;
      }
      router.push("/check-email");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field
        label="Email"
        error={errors.email?.message}
        type="email"
        autoComplete="email"
        {...register("email")}
      />

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <div className="flex items-center gap-2 rounded-md border bg-background pl-3 focus-within:ring-2 focus-within:ring-ring">
          <span className="text-sm text-muted-foreground">linkin.tree/</span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            spellCheck={false}
            className="h-10 flex-1 bg-transparent pr-3 text-sm outline-none"
            {...register("username")}
          />
          <AvailabilityBadge availability={availability} />
        </div>
        <FieldHint
          error={errors.username?.message}
          availability={availability}
        />
      </div>

      <Field
        label="Password"
        error={errors.password?.message}
        type="password"
        autoComplete="new-password"
        {...register("password")}
      />

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={
          pending || availability.state === "unavailable"
        }
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={props.name}>
        {label}
      </label>
      <input
        id={props.name}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function AvailabilityBadge({ availability }: { availability: Availability }) {
  if (availability.state === "idle") return null;
  if (availability.state === "checking") {
    return (
      <span className="pr-3 text-xs text-muted-foreground">checking…</span>
    );
  }
  if (availability.state === "available") {
    return <span className="pr-3 text-xs text-emerald-600">available</span>;
  }
  return <span className="pr-3 text-xs text-destructive">taken</span>;
}

function FieldHint({
  error,
  availability,
}: {
  error?: string;
  availability: Availability;
}) {
  if (error) {
    return <p className="mt-1 text-sm text-destructive">{error}</p>;
  }
  if (availability.state === "unavailable") {
    return (
      <p className="mt-1 text-sm text-destructive">{availability.reason}</p>
    );
  }
  return (
    <p className={cn("mt-1 text-xs text-muted-foreground")}>
      3–30 chars. Letters, numbers, - and _.
    </p>
  );
}
