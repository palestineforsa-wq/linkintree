"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, TextInput } from "../shared/fields";

export function ProductEditor({
  data,
  onChange,
}: {
  data: BlockData<"product">;
  onChange: (data: BlockData<"product">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"product">>({
    resolver: zodResolver(blockSchemas.product),
    defaultValues: data,
    mode: "onBlur",
  });

  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="Title" error={errors.title?.message}>
        <TextInput
          {...register("title")}
          placeholder="My ebook"
        />
      </FieldRow>
      <FieldRow label="URL" error={errors.url?.message}>
        <TextInput
          {...register("url")}
          placeholder="https://..."
          inputMode="url"
        />
      </FieldRow>
      <FieldRow label="Price text" error={errors.price_text?.message}>
        <TextInput {...register("price_text")} placeholder="$29" />
      </FieldRow>
      <FieldRow
        label="Image URL (optional)"
        error={errors.image_url?.message}
      >
        <TextInput
          {...register("image_url")}
          placeholder="https://..."
          inputMode="url"
        />
      </FieldRow>
    </form>
  );
}
