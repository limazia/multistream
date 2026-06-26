import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { parseStreamUrl, refreshTwitchEmbedUrl } from "../lib/parse-stream-url";
import { refreshYoutubeEmbedUrl } from "../lib/youtube-embed";
import {
  GRID_BREAKPOINTS,
  GRID_COLS,
  MAX_STREAMS,
  STORAGE_KEY,
  type GridBreakpoint,
} from "../lib/grid-config";
import { buildPresetLayout } from "../lib/layout-editor";
import type { AddStreamResult, Stream } from "../schemas/stream.schema";

let persistWritesEnabled = false;

function enablePersistWrites() {
  persistWritesEnabled = true;
}

const storage = createJSONStorage(() => ({
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    if (!persistWritesEnabled) return;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => localStorage.removeItem(name),
}));

function propagateLayoutFromLg(
  layouts: ResponsiveLayouts,
  lgLayout: Layout,
): ResponsiveLayouts {
  const next: ResponsiveLayouts = { ...layouts, lg: lgLayout };
  const lgCols = GRID_COLS.lg;

  for (const breakpoint of Object.keys(GRID_BREAKPOINTS) as GridBreakpoint[]) {
    if (breakpoint === "lg") continue;

    const cols = GRID_COLS[breakpoint];
    const scale = cols / lgCols;
    const existing = layouts[breakpoint] ?? [];

    next[breakpoint] = lgLayout.map((item) => {
      const prev = existing.find((entry) => entry.i === item.i);
      const minW = Math.min(2, cols);
      const w = Math.max(
        Math.min(Math.round(item.w * scale), cols),
        minW,
      );
      const x = Math.min(
        Math.max(0, Math.round(item.x * scale)),
        Math.max(0, cols - w),
      );

      return {
        ...item,
        x,
        w,
        h: prev?.h ?? item.h,
        minW,
        minH: prev?.minH ?? item.minH ?? 2,
      };
    });
  }

  return next;
}

function createEmptyLayouts(): ResponsiveLayouts {
  return Object.fromEntries(
    Object.keys(GRID_BREAKPOINTS).map((bp) => [bp, []]),
  ) as ResponsiveLayouts;
}

function rebuildLayoutsForStreams(
  layouts: ResponsiveLayouts,
  streamIds: string[],
): ResponsiveLayouts {
  const lgLayout = buildPresetLayout(streamIds, GRID_COLS.lg);
  return propagateLayoutFromLg(layouts, lgLayout);
}


function createStreamFromParsed(
  parsed: ReturnType<typeof parseStreamUrl> & { ok: true },
): Stream {
  return {
    id: crypto.randomUUID(),
    provider: parsed.data.provider,
    sourceKey: parsed.data.sourceKey,
    label: parsed.data.label,
    originalUrl: parsed.data.originalUrl,
    embedUrl: parsed.data.embedUrl,
  };
}

interface StreamStoreState {
  streams: Stream[];
  layouts: ResponsiveLayouts;
  zenMode: boolean;
  sheetOpen: boolean;
  addStream: (url: string) => AddStreamResult;
  updateStreamUrl: (id: string, url: string) => AddStreamResult;
  replaceStreamsFromUrls: (urls: string[]) => void;
  removeStream: (id: string) => void;
  clearStreams: () => void;
  updateLayout: (_layout: Layout, layouts: ResponsiveLayouts) => void;
  updateLayoutMap: (lgLayout: Layout) => void;
  toggleZenMode: () => void;
  setSheetOpen: (open: boolean) => void;
  refreshEmbedUrls: () => void;
}

export const useStreamStore = create<StreamStoreState>()(
  persist(
    (set, get) => ({
      streams: [],
      layouts: createEmptyLayouts(),
      zenMode: false,
      sheetOpen: false,

      addStream: (url) => {
        const { streams } = get();

        if (streams.length >= MAX_STREAMS) {
          return {
            ok: false,
            error: {
              code: "max_streams",
              message: `Limite de ${MAX_STREAMS} streams atingido.`,
            },
          };
        }

        const parsed = parseStreamUrl(url);
        if (!parsed.ok) {
          return {
            ok: false,
            error: {
              code: "invalid_url",
              message: parsed.error,
            },
          };
        }

        const duplicate = streams.some(
          (stream) => stream.sourceKey === parsed.data.sourceKey,
        );

        if (duplicate) {
          return {
            ok: false,
            error: {
              code: "duplicate",
              message: "Esta transmissão já está no grid.",
            },
          };
        }

        const stream: Stream = {
          id: crypto.randomUUID(),
          provider: parsed.data.provider,
          sourceKey: parsed.data.sourceKey,
          label: parsed.data.label,
          originalUrl: parsed.data.originalUrl,
          embedUrl: parsed.data.embedUrl,
        };

        set((state) => {
          const streamIds = [...state.streams.map((entry) => entry.id), stream.id];

          return {
            streams: [...state.streams, stream],
            layouts: rebuildLayoutsForStreams(state.layouts, streamIds),
          };
        });

        return { ok: true, stream };
      },

      replaceStreamsFromUrls: (urls) => {
        const nextStreams: Stream[] = [];

        for (const url of urls.slice(0, MAX_STREAMS)) {
          const parsed = parseStreamUrl(url);
          if (!parsed.ok) continue;

          const duplicate = nextStreams.some(
            (stream) => stream.sourceKey === parsed.data.sourceKey,
          );
          if (duplicate) continue;

          nextStreams.push(createStreamFromParsed(parsed));
        }

        const streamIds = nextStreams.map((stream) => stream.id);

        set((state) => ({
          streams: nextStreams,
          layouts:
            streamIds.length > 0
              ? rebuildLayoutsForStreams(state.layouts, streamIds)
              : createEmptyLayouts(),
        }));
      },

      updateStreamUrl: (id, url) => {
        const { streams } = get();
        const current = streams.find((stream) => stream.id === id);

        if (!current) {
          return {
            ok: false,
            error: {
              code: "invalid_url",
              message: "Transmissão não encontrada.",
            },
          };
        }

        const parsed = parseStreamUrl(url);
        if (!parsed.ok) {
          return {
            ok: false,
            error: {
              code: "invalid_url",
              message: parsed.error,
            },
          };
        }

        const duplicate = streams.some(
          (stream) =>
            stream.id !== id && stream.sourceKey === parsed.data.sourceKey,
        );

        if (duplicate) {
          return {
            ok: false,
            error: {
              code: "duplicate",
              message: "Esta transmissão já está no grid.",
            },
          };
        }

        set((state) => ({
          streams: state.streams.map((stream) =>
            stream.id === id
              ? {
                  ...stream,
                  provider: parsed.data.provider,
                  sourceKey: parsed.data.sourceKey,
                  label: parsed.data.label,
                  originalUrl: parsed.data.originalUrl,
                  embedUrl: parsed.data.embedUrl,
                }
              : stream,
          ),
        }));

        return { ok: true, stream: { ...current, ...parsed.data } };
      },

      removeStream: (id) => {
        set((state) => {
          const streams = state.streams.filter((stream) => stream.id !== id);
          const streamIds = streams.map((stream) => stream.id);

          return {
            streams,
            layouts: rebuildLayoutsForStreams(state.layouts, streamIds),
          };
        });
      },

      clearStreams: () => {
        set({
          streams: [],
          layouts: createEmptyLayouts(),
        });
      },

      updateLayout: (_layout, layouts) => {
        set({ layouts });
      },

      updateLayoutMap: (lgLayout) => {
        set((state) => ({
          layouts: propagateLayoutFromLg(state.layouts, lgLayout),
        }));
      },

      toggleZenMode: () => {
        set((state) => ({ zenMode: !state.zenMode, sheetOpen: false }));
      },

      setSheetOpen: (open) => {
        set({ sheetOpen: open });
      },

      refreshEmbedUrls: () => {
        set((state) => ({
          streams: state.streams.map((stream) => {
            if (stream.provider === "twitch") {
              return {
                ...stream,
                embedUrl: refreshTwitchEmbedUrl(stream.embedUrl),
              };
            }

            if (stream.provider === "youtube") {
              return {
                ...stream,
                embedUrl: refreshYoutubeEmbedUrl(stream.embedUrl),
              };
            }

            return stream;
          }),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        streams: state.streams,
        layouts: state.layouts,
      }),
      onRehydrateStorage: () => (state, error) => {
        enablePersistWrites();
        if (!state || error) return;

        if (state.streams.length > MAX_STREAMS) {
          const trimmed = state.streams.slice(0, MAX_STREAMS);
          const streamIds = trimmed.map((stream) => stream.id);

          state.streams = trimmed;
          state.layouts =
            streamIds.length > 0
              ? rebuildLayoutsForStreams(state.layouts, streamIds)
              : createEmptyLayouts();
        }

        for (const stream of state.streams) {
          if (stream.provider === "twitch") {
            stream.embedUrl = refreshTwitchEmbedUrl(stream.embedUrl);
          } else if (stream.provider === "youtube") {
            stream.embedUrl = refreshYoutubeEmbedUrl(stream.embedUrl);
          }
        }
      },
    },
  ),
);
