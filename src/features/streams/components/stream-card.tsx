import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@utils/cn";

import {
  YOUTUBE_EMBED_REFERRER_POLICY,
  extractYoutubeVideoId,
} from "../lib/youtube-embed";
import type { Stream } from "../schemas/stream.schema";

import { YoutubePlayer } from "./youtube-player";

interface StreamCardProps {
  stream: Stream;
  zenMode: boolean;
}

export function StreamCard({ stream, zenMode }: StreamCardProps) {
  const youtubeVideoId = extractYoutubeVideoId(stream);

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900",
        !zenMode && "shadow-sm",
      )}
    >
      {!zenMode ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="truncate text-xs font-medium text-zinc-200">
            {stream.label}
          </span>
        </div>
      ) : null}

      {youtubeVideoId ? (
        <YoutubePlayer
          videoId={youtubeVideoId}
          originalUrl={stream.originalUrl}
          label={stream.label}
          zenMode={zenMode}
        />
      ) : (
        <div className="relative h-full w-full">
          <iframe
            src={stream.embedUrl}
            title={stream.label}
            referrerPolicy={YOUTUBE_EMBED_REFERRER_POLICY}
            className="stream-iframe h-full w-full border-0 bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />

          {stream.provider === "youtube" && !zenMode ? (
            <a
              href={stream.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] text-zinc-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
            >
              <ExternalLinkIcon className="size-3" />
              YouTube
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
