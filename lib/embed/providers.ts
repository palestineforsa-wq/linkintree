// Provider-side URL transformation. Spec §10 calls for SSRF protection on
// "fetching user-supplied URLs". We sidestep entirely: don't fetch, parse
// the URL into provider+id and construct the embed URL ourselves.
//
// Trade-off: we lose oEmbed-supplied dimensions and rich titles, but we
// gain zero network at render time and no SSRF surface area.

export type EmbedProvider =
  | "youtube"
  | "vimeo"
  | "spotify"
  | "tiktok";

export type ParsedEmbed = {
  provider: EmbedProvider;
  embedSrc: string;
  aspectRatio: number; // width / height
};

const TIKTOK_VIDEO_RE = /tiktok\.com\/@[^/]+\/video\/(\d+)/i;

export function parseEmbedUrl(input: string): ParsedEmbed | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();

  // YouTube — long, short, embed, mobile.
  if (
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com"
  ) {
    const id =
      url.searchParams.get("v") ||
      url.pathname.match(/\/embed\/([\w-]{11})/)?.[1] ||
      url.pathname.match(/\/shorts\/([\w-]{11})/)?.[1] ||
      null;
    if (id) {
      return {
        provider: "youtube",
        embedSrc: `https://www.youtube-nocookie.com/embed/${id}`,
        aspectRatio: 16 / 9,
      };
    }
  }
  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    if (id && /^[\w-]{11}$/.test(id)) {
      return {
        provider: "youtube",
        embedSrc: `https://www.youtube-nocookie.com/embed/${id}`,
        aspectRatio: 16 / 9,
      };
    }
  }

  // Vimeo
  if (host === "vimeo.com" || host === "www.vimeo.com") {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    if (id) {
      return {
        provider: "vimeo",
        embedSrc: `https://player.vimeo.com/video/${id}`,
        aspectRatio: 16 / 9,
      };
    }
  }

  // Spotify — track/album/playlist/episode/show
  if (host === "open.spotify.com") {
    const m = url.pathname.match(
      /^\/(track|album|playlist|episode|show)\/([\w]+)/,
    );
    if (m) {
      const type = m[1];
      const id = m[2];
      const tall = type === "playlist" || type === "album" || type === "show";
      return {
        provider: "spotify",
        embedSrc: `https://open.spotify.com/embed/${type}/${id}`,
        aspectRatio: tall ? 1 : 16 / 9,
      };
    }
  }

  // TikTok
  if (
    host === "tiktok.com" ||
    host === "www.tiktok.com" ||
    host === "m.tiktok.com"
  ) {
    const m = input.match(TIKTOK_VIDEO_RE);
    if (m) {
      return {
        provider: "tiktok",
        embedSrc: `https://www.tiktok.com/embed/v2/${m[1]}`,
        aspectRatio: 9 / 16,
      };
    }
  }

  return null;
}
