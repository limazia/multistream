export const YOUTUBE_EMBED_REFERRER_POLICY =
  "strict-origin-when-cross-origin" as const;

export type YoutubeEmbedHost = "standard" | "nocookie";

const YOUTUBE_HOSTS: Record<YoutubeEmbedHost, string> = {
  standard: "https://www.youtube.com",
  nocookie: "https://www.youtube-nocookie.com",
};

export function getYoutubeEmbedOrigin(): string {
  return window.location.origin;
}

export function getYoutubeEmbedHostUrl(host: YoutubeEmbedHost): string {
  return YOUTUBE_HOSTS[host];
}

export function buildYoutubeVideoEmbedUrl(
  videoId: string,
  host: YoutubeEmbedHost = "nocookie",
): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1",
    origin: getYoutubeEmbedOrigin(),
  });

  return `${YOUTUBE_HOSTS[host]}/embed/${videoId}?${params.toString()}`;
}

export function buildYoutubeChannelEmbedUrl(
  channelId: string,
  host: YoutubeEmbedHost = "nocookie",
): string {
  const params = new URLSearchParams({
    channel: channelId,
    autoplay: "1",
    mute: "1",
    enablejsapi: "1",
    origin: getYoutubeEmbedOrigin(),
  });

  return `${YOUTUBE_HOSTS[host]}/embed/live_stream?${params.toString()}`;
}

export function refreshYoutubeEmbedUrl(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    if (!url.hostname.includes("youtube.com")) return embedUrl;

    url.searchParams.set("origin", getYoutubeEmbedOrigin());
    if (!url.searchParams.has("enablejsapi")) {
      url.searchParams.set("enablejsapi", "1");
    }

    return url.toString();
  } catch {
    return embedUrl;
  }
}

export function extractYoutubeVideoId(stream: {
  provider: string;
  sourceKey: string;
  embedUrl: string;
}): string | null {
  if (stream.provider !== "youtube") return null;

  if (stream.sourceKey.startsWith("youtube:")) {
    return stream.sourceKey.slice("youtube:".length);
  }

  const embedMatch = stream.embedUrl.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  return embedMatch?.[1] ?? null;
}

export function openYoutubeWatchPopup(
  watchUrl: string,
  popupKey: string,
  rect?: DOMRectReadOnly,
): Window | null {
  const width = rect ? Math.round(rect.width) : 960;
  const height = rect ? Math.round(rect.height) : 540;
  const left = rect
    ? Math.round(rect.left + window.screenX)
    : Math.max(0, (window.screen.width - width) / 2);
  const top = rect
    ? Math.round(rect.top + window.screenY)
    : Math.max(0, (window.screen.height - height) / 2);

  return window.open(
    watchUrl,
    `multistream-youtube-${popupKey}`,
    [
      "popup=yes",
      `width=${Math.max(width, 480)}`,
      `height=${Math.max(height, 270)}`,
      `left=${left}`,
      `top=${top}`,
      "resizable=yes",
      "scrollbars=yes",
    ].join(","),
  );
}
