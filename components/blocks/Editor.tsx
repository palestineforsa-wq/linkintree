"use client";

import type { BlockType } from "@/lib/blocks/schemas";
import { LinkEditor } from "./Link/Editor";
import { HeaderEditor } from "./Header/Editor";
import { SocialRowEditor } from "./SocialRow/Editor";
import { SpacerEditor } from "./Spacer/Editor";

type EditorFn = (props: {
  data: unknown;
  onChange: (data: unknown) => void;
}) => React.ReactNode;

const EDITORS: { [T in BlockType]?: EditorFn } = {
  link: ({ data, onChange }) => (
    <LinkEditor
      data={data as Parameters<typeof LinkEditor>[0]["data"]}
      onChange={onChange}
    />
  ),
  header: ({ data, onChange }) => (
    <HeaderEditor
      data={data as Parameters<typeof HeaderEditor>[0]["data"]}
      onChange={onChange}
    />
  ),
  social_row: ({ data, onChange }) => (
    <SocialRowEditor
      data={data as Parameters<typeof SocialRowEditor>[0]["data"]}
      onChange={onChange}
    />
  ),
  spacer: ({ data, onChange }) => (
    <SpacerEditor
      data={data as Parameters<typeof SpacerEditor>[0]["data"]}
      onChange={onChange}
    />
  ),
};

export function BlockEditorByType({
  type,
  data,
  onChange,
}: {
  type: BlockType;
  data: unknown;
  onChange: (data: unknown) => void;
}) {
  const fn = EDITORS[type];
  if (!fn) {
    return (
      <p className="text-sm text-muted-foreground">
        This block type isn&apos;t available on your plan.
      </p>
    );
  }
  return fn({ data, onChange });
}
