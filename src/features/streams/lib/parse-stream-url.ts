import type { StreamProvider } from "../schemas/stream.schema";

import { getTwitchParents, appendTwitchParentParams } from "./twitch-parent";
import {
  buildYoutubeChannelEmbedUrl,
  buildYoutubeVideoEmbedUrl,
} from "./youtube-embed";

export interface ParsedStream {
  provider: StreamProvider;
  sourceKey: string;
  label: string;
  embedUrl: string;
  originalUrl: string;
}

export type ParseStreamResult =
  | { ok: true; data: ParsedStream }
  | { ok: false; error: string };

const TWITCH_CHANNEL_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?twitch\.tv\/([a-zA-Z0-9_]{2,25})(?:\/.*)?$/i;

const TWITCH_PLAYER_PATTERN =
  /^(?:https?:\/\/)?player\.twitch\.tv\/\?.*channel=([a-zA-Z0-9_]{2,25})/i;

const YOUTUBE_WATCH_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/i;

const YOUTUBE_SHORT_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i;

const YOUTUBE_EMBED_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i;

const YOUTUBE_LIVE_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i;

const YOUTUBE_SHORTS_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i;

const YOUTUBE_V_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/i;

const YOUTUBE_CHANNEL_PATTERN =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?youtube\.com\/channel\/(UC[\w-]{22})(?:\/.*)?$/i;

function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return trimmed;
  }
}

function buildTwitchEmbed(channel: string, originalUrl: string): ParsedStream {
  const normalizedChannel = channel.toLowerCase();
  const params = new URLSearchParams({
    channel: normalizedChannel,
    autoplay: "true",
    muted: "true",
  });
  appendTwitchParentParams(params);

  return {
    provider: "twitch",
    sourceKey: `twitch:${normalizedChannel}`,
    label: normalizedChannel,
    originalUrl,
    embedUrl: `https://player.twitch.tv/?${params.toString()}`,
  };
}

function buildYoutubeVideoEmbed(
  videoId: string,
  originalUrl: string,
): ParsedStream {
  return {
    provider: "youtube",
    sourceKey: `youtube:${videoId}`,
    label: videoId,
    originalUrl,
    embedUrl: buildYoutubeVideoEmbedUrl(videoId),
  };
}

function buildYoutubeChannelEmbed(
  channelId: string,
  originalUrl: string,
): ParsedStream {
  return {
    provider: "youtube",
    sourceKey: `youtube-channel:${channelId}`,
    label: channelId,
    originalUrl,
    embedUrl: buildYoutubeChannelEmbedUrl(channelId),
  };
}

function parseTwitch(url: string): ParsedStream | null {
  const playerMatch = url.match(TWITCH_PLAYER_PATTERN);
  if (playerMatch?.[1]) {
    return buildTwitchEmbed(playerMatch[1], url);
  }

  const channelMatch = url.match(TWITCH_CHANNEL_PATTERN);
  if (channelMatch?.[1]) {
    const channel = channelMatch[1].toLowerCase();
    if (channel === "videos" || channel === "directory" || channel === "p") {
      return null;
    }
    return buildTwitchEmbed(channel, url);
  }

  return null;
}

function parseYoutube(url: string): ParsedStream | null {
  const patterns = [
    YOUTUBE_WATCH_PATTERN,
    YOUTUBE_SHORT_PATTERN,
    YOUTUBE_EMBED_PATTERN,
    YOUTUBE_LIVE_PATTERN,
    YOUTUBE_SHORTS_PATTERN,
    YOUTUBE_V_PATTERN,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return buildYoutubeVideoEmbed(match[1], url);
    }
  }

  const channelMatch = url.match(YOUTUBE_CHANNEL_PATTERN);
  if (channelMatch?.[1]) {
    return buildYoutubeChannelEmbed(channelMatch[1], url);
  }

  return null;
}

export function parseStreamUrl(raw: string): ParseStreamResult {
  const normalized = normalizeInput(raw);

  if (!normalized) {
    return {
      ok: false,
      error: "Cole uma URL da Twitch ou do YouTube.",
    };
  }

  const twitch = parseTwitch(normalized);
  if (twitch) {
    return { ok: true, data: twitch };
  }

  const youtube = parseYoutube(normalized);
  if (youtube) {
    return { ok: true, data: youtube };
  }

  return {
    ok: false,
    error:
      "URL não reconhecida. Use links da Twitch (twitch.tv/canal) ou YouTube (watch, youtu.be, live ou channel).",
  };
}

export function refreshTwitchEmbedUrl(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    if (!url.hostname.includes("twitch.tv")) return embedUrl;

    url.searchParams.delete("parent");
    for (const parent of getTwitchParents()) {
      url.searchParams.append("parent", parent);
    }

    return url.toString();
  } catch {
    return embedUrl;
  }
}
