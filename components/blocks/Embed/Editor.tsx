"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockSchemas, type BlockData } from "@/lib/blocks/schemas";
import { FieldRow, TextInput } from "../shared/fields";
import { parseEmbedUrl } from "@/lib/embed/providers";

export function EmbedEditor({
  data,
  onChange,
}: {
  data: BlockData<"embed">;
  onChange: (data: BlockData<"embed">) => void;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<BlockData<"embed">>({
    resolver: zodResolver(blockSchemas.embed),
    defaultValues: data,
    mode: "onBlur",
  });

  const url = watch("url");
  const provider = url ? parseEmbedUrl(url) : null;

  const flush = handleSubmit((v) => onChange(v));

  return (
    <form onBlur={flush} className="flex flex-col gap-3">
      <FieldRow label="URL" error={errors.url?.message}>
        <TextInput
          {...register("url")}
          placeholder="https://www.youtube.com/watch?v=..."
          inputMode="url"
        />
      </FieldRow>
      <p className="text-xs text-muted-foreground">
        Supported: YouTube, Vimeo, Spotify, TikTok.
        {url && !provider ? (
          <span className="ml-1 text-destructive">
            We can&apos;t recognize this URL.
          </span>
        ) : null}
        {provider ? (
          <span className="ml-1 text-emerald-600">
            Detected {provider.provider}.
          </span>
        ) : null}
      </p>
    </form>
  );
}
