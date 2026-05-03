"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function TextInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
});

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function SelectInput({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
