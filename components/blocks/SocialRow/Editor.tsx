"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, SelectInput, TextInput } from "../shared/fields";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const PLATFORMS = [
  "twitter",
  "x",
  "instagram",
  "tiktok",
  "youtube",
  "github",
  "linkedin",
  "twitch",
  "spotify",
  "website",
] as const;

export function SocialRowEditor({
  data,
  onChange,
}: {
  data: BlockData<"social_row">;
  onChange: (data: BlockData<"social_row">) => void;
}) {
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<BlockData<"social_row">>({
    resolver: zodResolver(blockSchemas.social_row),
    defaultValues: data,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "links" });
  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-end gap-2">
          <FieldRow
            label={i === 0 ? "Platform" : ""}
            error={errors.links?.[i]?.platform?.message}
          >
            <SelectInput {...register(`links.${i}.platform`)}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </SelectInput>
          </FieldRow>
          <FieldRow
            label={i === 0 ? "URL" : ""}
            error={errors.links?.[i]?.url?.message}
          >
            <TextInput
              {...register(`links.${i}.url`)}
              placeholder="https://…"
              inputMode="url"
            />
          </FieldRow>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove"
            onClick={() => {
              remove(i);
              setTimeout(flush, 0);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length >= 12}
        onClick={() =>
          append({ platform: "instagram", url: "https://" })
        }
      >
        Add platform
      </Button>
    </form>
  );
}
