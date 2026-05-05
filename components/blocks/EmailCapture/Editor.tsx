"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, TextInput } from "../shared/fields";

export function EmailCaptureEditor({
  data,
  onChange,
}: {
  data: BlockData<"email_capture">;
  onChange: (data: BlockData<"email_capture">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"email_capture">>({
    resolver: zodResolver(blockSchemas.email_capture),
    defaultValues: data,
    mode: "onBlur",
  });

  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="Headline" error={errors.headline?.message}>
        <TextInput
          {...register("headline")}
          placeholder="Subscribe to my newsletter"
        />
      </FieldRow>
      <FieldRow label="Button label" error={errors.cta?.message}>
        <TextInput {...register("cta")} placeholder="Subscribe" />
      </FieldRow>
      <FieldRow
        label="Success message (optional)"
        error={errors.success_message?.message as string | undefined}
      >
        <TextInput
          {...register("success_message")}
          placeholder="Thanks — you're on the list."
        />
      </FieldRow>
    </form>
  );
}
