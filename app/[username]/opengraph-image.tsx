import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { username: string } }) {
  // TODO MYWEB-6: fetch profile, render avatar + display name. Pro can override.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          fontSize: 64,
          fontWeight: 600,
          color: "#0a0a0a",
        }}
      >
        @{params.username}
      </div>
    ),
    size,
  );
}
