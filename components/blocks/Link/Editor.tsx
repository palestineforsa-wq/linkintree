"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, TextInput, SelectInput } from "../shared/fields";

export function LinkEditor({
  data,
  onChange,
}: {
  data: BlockData<"link">;
  onChange: (data: BlockData<"link">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"link">>({
    resolver: zodResolver(blockSchemas.link),
    defaultValues: data,
    mode: "onBlur",
  });

  // Submit on every blur via React Hook Form's handleSubmit; if validation
  // passes, the parent action is fired.
  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="Title" error={errors.title?.message}>
        <TextInput
          {...register("title")}
          placeholder="My latest project"
        />
      </FieldRow>
      <FieldRow label="URL" error={errors.url?.message}>
        <TextInput
          {...register("url")}
          placeholder="https://example.com"
          inputMode="url"
        />
      </FieldRow>
      <FieldRow label="Thumbnail URL (optional)" error={errors.thumbnail_url?.message}>
        <TextInput
          {...register("thumbnail_url")}
          placeholder="https://…"
          inputMode="url"
        />
      </FieldRow>
      <FieldRow label="Badge (optional)" error={errors.badge?.message}>
        <SelectInput {...register("badge")}>
          <option value="">None</option>
          <option value="new">New</option>
          <option value="popular">Popular</option>
          <option value="limited">Limited</option>
        </SelectInput>
      </FieldRow>
    </form>
  );
}
