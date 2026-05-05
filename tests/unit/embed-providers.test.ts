import { describe, expect, it } from "vitest";
import { parseEmbedUrl } from "@/lib/embed/providers";

describe("parseEmbedUrl — YouTube", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
  ])("recognizes %s", (url) => {
    const result = parseEmbedUrl(url);
    expect(result?.provider).toBe("youtube");
    expect(result?.embedSrc).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(result?.aspectRatio).toBeCloseTo(16 / 9);
  });

  it("rejects YouTube URL with non-11-char id", () => {
    expect(parseEmbedUrl("https://youtu.be/short")).toBeNull();
  });
});

describe("parseEmbedUrl — Vimeo", () => {
  it.each([
    "https://vimeo.com/76979871",
    "https://www.vimeo.com/76979871",
  ])("recognizes %s", (url) => {
    const result = parseEmbedUrl(url);
    expect(result?.provider).toBe("vimeo");
    expect(result?.embedSrc).toBe("https://player.vimeo.com/video/76979871");
  });
});

describe("parseEmbedUrl — Spotify", () => {
  it("recognizes a track", () => {
    const r = parseEmbedUrl(
      "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    );
    expect(r?.provider).toBe("spotify");
    expect(r?.embedSrc).toBe(
      "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT",
    );
  });

  it("uses tall aspect for playlists", () => {
    const r = parseEmbedUrl(
      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    );
    expect(r?.aspectRatio).toBe(1);
  });
});

describe("parseEmbedUrl — TikTok", () => {
  it("recognizes a video URL", () => {
    const r = parseEmbedUrl(
      "https://www.tiktok.com/@user/video/7000000000000000000",
    );
    expect(r?.provider).toBe("tiktok");
    expect(r?.embedSrc).toBe(
      "https://www.tiktok.com/embed/v2/7000000000000000000",
    );
    expect(r?.aspectRatio).toBeCloseTo(9 / 16);
  });
});

describe("parseEmbedUrl — rejection", () => {
  it("rejects http (must be https)", () => {
    expect(
      parseEmbedUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
  });

  it("rejects unsupported hosts", () => {
    expect(parseEmbedUrl("https://example.com/foo")).toBeNull();
    expect(parseEmbedUrl("https://soundcloud.com/track/123")).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(parseEmbedUrl("not a url")).toBeNull();
    expect(parseEmbedUrl("")).toBeNull();
  });

  it("rejects YouTube without a video id", () => {
    expect(parseEmbedUrl("https://www.youtube.com/")).toBeNull();
  });
});
