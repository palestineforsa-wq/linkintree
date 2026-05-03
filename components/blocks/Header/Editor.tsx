"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, TextInput } from "../shared/fields";

export function HeaderEditor({
  data,
  onChange,
}: {
  data: BlockData<"header">;
  onChange: (data: BlockData<"header">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"header">>({
    resolver: zodResolver(blockSchemas.header),
    defaultValues: data,
    mode: "onBlur",
  });

  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="Title" error={errors.title?.message}>
        <TextInput {...register("title")} placeholder="Section title" />
      </FieldRow>
    </form>
  );
}
