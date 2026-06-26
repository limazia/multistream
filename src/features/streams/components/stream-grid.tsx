import {
  Responsive,
  WidthProvider,
} from "react-grid-layout/legacy";

import { GRID_BREAKPOINTS, GRID_COLS } from "../lib/grid-config";
import { useStreamStore } from "../hooks/use-stream-store";
import { useViewportRowHeight } from "../hooks/use-viewport-row-height";

import { StreamCard } from "./stream-card";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface StreamGridProps {
  ready?: boolean;
}

export function StreamGrid({ ready = true }: StreamGridProps) {
  const streams = useStreamStore((state) => state.streams);
  const layouts = useStreamStore((state) => state.layouts);
  const zenMode = useStreamStore((state) => state.zenMode);
  const rowHeight = useViewportRowHeight(layouts);

  if (!ready) {
    return <div className="h-full min-h-0" aria-hidden />;
  }

  if (streams.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center px-6">
        <p className="max-w-md text-center text-sm text-zinc-500">
          Nenhuma transmissão ainda. Use o botão de configurações para colar uma
          URL da Twitch ou YouTube.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <ResponsiveGridLayout
        className="stream-grid-layout layout"
        breakpoints={GRID_BREAKPOINTS}
        cols={GRID_COLS}
        layouts={layouts}
        rowHeight={rowHeight}
        margin={[8, 8]}
        containerPadding={[8, 8]}
        compactType="vertical"
        autoSize={false}
        isDraggable={false}
        isResizable={false}
      >
        {streams.map((stream) => (
          <div key={stream.id} className="h-full">
            <StreamCard stream={stream} zenMode={zenMode} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
