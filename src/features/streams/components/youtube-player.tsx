import { ExternalLinkIcon, PictureInPicture2Icon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@components/ui/button";
import { cn } from "@utils/cn";

import {
  YOUTUBE_EMBED_REFERRER_POLICY,
  buildYoutubeVideoEmbedUrl,
  getYoutubeEmbedHostUrl,
  openYoutubeWatchPopup,
  type YoutubeEmbedHost,
} from "../lib/youtube-embed";

interface YoutubePlayerProps {
  videoId: string;
  originalUrl: string;
  label: string;
  zenMode: boolean;
  className?: string;
}

interface YoutubePlayerInstance {
  destroy: () => void;
}

interface YoutubePlayerReadyEvent {
  target: {
    getIframe: () => HTMLIFrameElement;
  };
}

interface YoutubePlayerErrorEvent {
  data: number;
}

type EmbedMode = "api" | "iframe";

interface EmbedAttempt {
  mode: EmbedMode;
  host: YoutubeEmbedHost;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          width: string;
          height: string;
          host?: string;
          playerVars: Record<string, string | number>;
          events?: {
            onReady?: (event: YoutubePlayerReadyEvent) => void;
            onError?: (event: YoutubePlayerErrorEvent) => void;
          };
        },
      ) => YoutubePlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const EMBED_ATTEMPTS: EmbedAttempt[] = [
  { mode: "api", host: "nocookie" },
  { mode: "iframe", host: "nocookie" },
  { mode: "api", host: "standard" },
  { mode: "iframe", host: "standard" },
];

const RIGHTS_BLOCKED_CODES = new Set([101, 150]);
const RETRYABLE_ERROR_CODES = new Set([5, 153]);

let youtubeApiReady: Promise<void> | null = null;

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();

  if (!youtubeApiReady) {
    youtubeApiReady = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      const existing = document.querySelector(
        'script[src*="youtube.com/iframe_api"]',
      );

      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiReady;
}

function destroyYoutubePlayer(
  player: YoutubePlayerInstance | null,
  container: HTMLDivElement | null,
) {
  try {
    player?.destroy();
  } catch {
    // YouTube API may throw if the iframe was already removed.
  }

  if (container) {
    container.innerHTML = "";
  }
}

function applyIframeReferrerPolicy(container: HTMLDivElement | null) {
  const iframe = container?.querySelector("iframe");
  if (!iframe) return;

  iframe.referrerPolicy = YOUTUBE_EMBED_REFERRER_POLICY;
  iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
}

export function YoutubePlayer({
  videoId,
  originalUrl,
  label,
  zenMode,
  className,
}: YoutubePlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayerInstance | null>(null);
  const attemptIndexRef = useRef(0);

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const currentAttempt = EMBED_ATTEMPTS[attemptIndex];
  const iframeEmbedUrl = buildYoutubeVideoEmbedUrl(
    videoId,
    currentAttempt?.host ?? "nocookie",
  );

  const advanceAttempt = useCallback(() => {
    const nextIndex = attemptIndexRef.current + 1;
    if (nextIndex >= EMBED_ATTEMPTS.length) {
      setEmbedBlocked(true);
      return;
    }

    attemptIndexRef.current = nextIndex;
    setAttemptIndex(nextIndex);
  }, []);

  const handleOpenPopup = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    const popup = openYoutubeWatchPopup(originalUrl, videoId, rect);
    setPopupOpen(Boolean(popup));
  }, [originalUrl, videoId]);

  useEffect(() => {
    attemptIndexRef.current = 0;
    setAttemptIndex(0);
    setEmbedBlocked(false);
    setPopupOpen(false);
  }, [videoId]);

  useEffect(() => {
    if (embedBlocked || currentAttempt?.mode !== "api") return;

    let cancelled = false;

    void loadYoutubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      const host = getYoutubeEmbedHostUrl(currentAttempt.host);

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        host,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            const iframe = event.target.getIframe();
            iframe.referrerPolicy = YOUTUBE_EMBED_REFERRER_POLICY;
          },
          onError: (event) => {
            if (RIGHTS_BLOCKED_CODES.has(event.data)) {
              setEmbedBlocked(true);
              return;
            }

            if (RETRYABLE_ERROR_CODES.has(event.data)) {
              advanceAttempt();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      destroyYoutubePlayer(playerRef.current, containerRef.current);
      playerRef.current = null;
    };
  }, [advanceAttempt, currentAttempt, embedBlocked, videoId, attemptIndex]);

  useEffect(() => {
    if (currentAttempt?.mode !== "iframe") return;
    applyIframeReferrerPolicy(containerRef.current);
  }, [attemptIndex, currentAttempt, iframeEmbedUrl]);

  const showIframe =
    !embedBlocked && currentAttempt?.mode === "iframe" && iframeEmbedUrl;

  return (
    <div ref={rootRef} className={cn("relative h-full w-full", className)}>
      {showIframe ? (
        <iframe
          key={`${videoId}-${currentAttempt.host}-iframe`}
          src={iframeEmbedUrl}
          title={label}
          referrerPolicy={YOUTUBE_EMBED_REFERRER_POLICY}
          className="h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          ref={containerRef}
          className={cn("h-full w-full", embedBlocked && "hidden")}
          title={label}
        />
      )}

      {embedBlocked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 p-4 text-center">
          <p className="text-sm font-medium text-zinc-200">
            Embed bloqueado pelo YouTube
          </p>
          <p className="max-w-xs text-xs text-zinc-500">
            Este vídeo não pode ser incorporado aqui. Abra em janela flutuante
            para assistir no mesmo layout ou direto no YouTube.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button type="button" size="sm" onClick={handleOpenPopup}>
              <PictureInPicture2Icon />
              {popupOpen ? "Janela aberta" : "Abrir em janela"}
            </Button>
            <Button asChild size="sm" variant="secondary">
              <a href={originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                Assistir no YouTube
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      {!zenMode && !embedBlocked ? (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] text-zinc-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        >
          <ExternalLinkIcon className="size-3" />
          YouTube
        </a>
      ) : null}
    </div>
  );
}
