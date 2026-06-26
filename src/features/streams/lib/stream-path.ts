import type { Stream } from "../schemas/stream.schema";

import { parseStreamUrl } from "./parse-stream-url";

const TWITCH_SEGMENT_PATTERN = /^[a-zA-Z0-9_]{2,25}$/;

export function streamToPathSegment(stream: Stream): string {
  if (stream.provider === "twitch") {
    return stream.label;
  }

  if (stream.sourceKey.startsWith("youtube-channel:")) {
    const channelId = stream.sourceKey.slice("youtube-channel:".length);
    return `ytc-${channelId}`;
  }

  return `yt-${stream.label}`;
}

export function pathSegmentToStreamUrl(segment: string): string | null {
  const decoded = decodeURIComponent(segment);

  if (decoded.startsWith("ytc-")) {
    const channelId = decoded.slice(4);
    if (!channelId.startsWith("UC")) return null;
    return `https://youtube.com/channel/${channelId}`;
  }

  if (decoded.startsWith("yt-")) {
    const videoId = decoded.slice(3);
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
    return `https://youtube.com/watch?v=${videoId}`;
  }

  if (!TWITCH_SEGMENT_PATTERN.test(decoded)) return null;
  return `https://twitch.tv/${decoded.toLowerCase()}`;
}

export function getPathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

export function buildPathFromStreams(streams: Stream[]): string {
  if (streams.length === 0) return "/";
  return `/${streams.map((stream) => encodeURIComponent(streamToPathSegment(stream))).join("/")}`;
}

export function streamsMatchPath(streams: Stream[], pathname: string): boolean {
  const pathSegments = getPathSegments(pathname).map(decodeURIComponent);
  const streamSegments = streams.map(streamToPathSegment);

  if (pathSegments.length !== streamSegments.length) return false;

  return pathSegments.every(
    (segment, index) => segment.toLowerCase() === streamSegments[index].toLowerCase(),
  );
}

export function pathSegmentsToStreamUrls(segments: string[]): string[] {
  return segments
    .map(pathSegmentToStreamUrl)
    .filter((url): url is string => url !== null);
}

export function parsePathSegments(segments: string[]): {
  urls: string[];
  invalidSegments: string[];
} {
  const urls: string[] = [];
  const invalidSegments: string[] = [];

  for (const segment of segments) {
    const url = pathSegmentToStreamUrl(segment);
    if (!url) {
      invalidSegments.push(segment);
      continue;
    }

    const parsed = parseStreamUrl(url);
    if (!parsed.ok) {
      invalidSegments.push(segment);
      continue;
    }

    urls.push(url);
  }

  return { urls, invalidSegments };
}
