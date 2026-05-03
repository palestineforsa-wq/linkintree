"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, SelectInput } from "../shared/fields";

export function SpacerEditor({
  data,
  onChange,
}: {
  data: BlockData<"spacer">;
  onChange: (data: BlockData<"spacer">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"spacer">>({
    resolver: zodResolver(blockSchemas.spacer),
    defaultValues: { height: data.height ?? "md" },
    mode: "onBlur",
  });

  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="Height" error={errors.height?.message}>
        <SelectInput {...register("height")}>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </SelectInput>
      </FieldRow>
    </form>
  );
}
