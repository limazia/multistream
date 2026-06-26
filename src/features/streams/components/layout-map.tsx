import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { GripVerticalIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { Layout, LayoutItem } from "react-grid-layout";

import { Button } from "@components/ui/button";
import { cn } from "@utils/cn";

import { LAYOUT_MAP_COLS } from "../lib/grid-config";
import {
  clampItem,
  clampWidth,
  compactLayoutVertical,
  getLayoutOrder,
  getWidthById,
  LAYOUT_ITEM_HEIGHT,
  mergeLayoutWithStreams,
  snapColumn,
  snapRow,
  sortLayoutItems,
  updateLayoutItem,
} from "../lib/layout-editor";
import { useStreamStore } from "../hooks/use-stream-store";

interface LayoutMapProps {
  active?: boolean;
  onInteractionChange?: (active: boolean) => void;
}

interface DragState {
  id: string;
  mode: "move" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
  origin: LayoutItem;
}

export function LayoutMap({
  active = true,
  onInteractionChange,
}: LayoutMapProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [localLayout, setLocalLayout] = useState<Layout>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dragOrderId, setDragOrderId] = useState<string | null>(null);

  const streams = useStreamStore((state) => state.streams);
  const layouts = useStreamStore((state) => state.layouts);
  const updateLayoutMap = useStreamStore((state) => state.updateLayoutMap);

  const streamIds = useMemo(() => streams.map((stream) => stream.id), [streams]);
  const storeLayout = useMemo(
    () => mergeLayoutWithStreams(layouts.lg ?? [], streamIds),
    [layouts.lg, streamIds],
  );

  useEffect(() => {
    if (!drag && !dragOrderId) {
      setLocalLayout(storeLayout);
    }
  }, [storeLayout, drag, dragOrderId]);

  useEffect(() => {
    onInteractionChange?.(drag !== null || dragOrderId !== null);
  }, [drag, dragOrderId, onInteractionChange]);

  const layout = localLayout.length > 0 ? localLayout : storeLayout;
  const orderedIds = useMemo(() => getLayoutOrder(layout), [layout]);
  const widthById = useMemo(() => getWidthById(layout), [layout]);

  const previewRows = useMemo(() => {
    if (layout.length === 0) return LAYOUT_ITEM_HEIGHT;
    return layout.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      LAYOUT_ITEM_HEIGHT,
    );
  }, [layout]);

  const commitLayout = useCallback(
    (nextLayout: Layout) => {
      const bounded = compactLayoutVertical(nextLayout);
      setLocalLayout(bounded);
      updateLayoutMap(bounded);
    },
    [updateLayoutMap],
  );

  const getCellMetrics = useCallback(() => {
    const node = previewRef.current;
    if (!node) return null;

    const width = node.clientWidth;
    if (width <= 0) return null;

    return {
      cellWidth: width / LAYOUT_MAP_COLS,
      rowHeight: 36,
    };
  }, []);

  const handleBlockPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, item: LayoutItem) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({
        id: item.i,
        mode: "move",
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        origin: item,
      });
    },
    [],
  );

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, item: LayoutItem) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({
        id: item.i,
        mode: "resize",
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        origin: item,
      });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!drag) return;

      const metrics = getCellMetrics();
      if (!metrics) return;

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (drag.mode === "move") {
        const nextX = snapColumn(drag.origin.x + deltaX / metrics.cellWidth);
        const nextY = snapRow(drag.origin.y + deltaY / metrics.rowHeight);

        setLocalLayout((current) =>
          updateLayoutItem(current, drag.id, { x: nextX, y: nextY }),
        );
        return;
      }

      const nextW = clampWidth(
        drag.origin.w + Math.round(deltaX / metrics.cellWidth),
      );

      setLocalLayout((current) =>
        updateLayoutItem(current, drag.id, { w: nextW }),
      );
    },
    [drag, getCellMetrics],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!drag || event.pointerId !== drag.pointerId) return;

      setLocalLayout((current) => {
        const bounded = compactLayoutVertical(current);
        updateLayoutMap(bounded);
        return bounded;
      });
      setDrag(null);
    },
    [drag, updateLayoutMap],
  );

  const handleWidthStep = useCallback(
    (id: string, delta: number) => {
      const current = layout.find((item) => item.i === id);
      if (!current) return;

      commitLayout(
        updateLayoutItem(layout, id, {
          w: clampWidth(current.w + delta),
        }),
      );
    },
    [commitLayout, layout],
  );

  const handleListDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, id: string) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
      setDragOrderId(id);
    },
    [],
  );

  const handleListDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData("text/plain") || dragOrderId;
      if (!sourceId || sourceId === targetId) {
        setDragOrderId(null);
        return;
      }

      const order = getLayoutOrder(layout);
      const from = order.indexOf(sourceId);
      const to = order.indexOf(targetId);
      if (from < 0 || to < 0) {
        setDragOrderId(null);
        return;
      }

      const nextOrder = [...order];
      const [moved] = nextOrder.splice(from, 1);
      nextOrder.splice(to, 0, moved);

      const widths = getWidthById(layout);
      const nextLayout = compactLayoutVertical(
        nextOrder.map((id, index) => {
          const item = layout.find((entry) => entry.i === id);
          return clampItem({
            i: id,
            x: 0,
            y: index * LAYOUT_ITEM_HEIGHT,
            w: widths[id] ?? item?.w ?? 6,
            h: LAYOUT_ITEM_HEIGHT,
          });
        }),
      );

      commitLayout(nextLayout);
      setDragOrderId(null);
    },
    [commitLayout, dragOrderId, layout],
  );

  if (!active || streams.length === 0) {
    return null;
  }

  return (
    <div className="layout-map space-y-4 rounded-lg border border-white/10 bg-zinc-900/50 p-3">
      <div
        ref={previewRef}
        className="relative w-full touch-none select-none rounded-md border border-white/10 bg-zinc-950/80 p-2"
        style={{ height: previewRows * 36 + 16 }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Mapa do layout do grid"
      >
        <div
          className="pointer-events-none absolute inset-2 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${LAYOUT_MAP_COLS}, minmax(0, 1fr))`,
          }}
          aria-hidden
        >
          {Array.from({ length: LAYOUT_MAP_COLS * previewRows }, (_, index) => (
            <div
              key={index}
              className="h-8 rounded-sm border border-dashed border-white/5"
            />
          ))}
        </div>

        {sortLayoutItems(layout).map((item) => {
          const stream = streams.find((entry) => entry.id === item.i);
          if (!stream) return null;

          const left = `calc(${item.x} * ((100% - 16px) / ${LAYOUT_MAP_COLS}) + 8px)`;
          const width = `calc(${item.w} * ((100% - 16px) / ${LAYOUT_MAP_COLS}) - 4px)`;
          const top = item.y * 36 + 8;

          return (
            <div
              key={item.i}
              className={cn(
                "absolute z-10 flex overflow-hidden rounded-md border border-white/25 bg-zinc-800 shadow-sm",
                drag?.id === item.i && "z-20 ring-2 ring-primary/60",
              )}
              style={{ left, width, top, height: 32 }}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-grab items-center gap-1 px-2 text-left active:cursor-grabbing"
                onPointerDown={(event) => handleBlockPointerDown(event, item)}
              >
                <GripVerticalIcon className="size-3 shrink-0 text-zinc-500" />
                <span className="truncate text-[11px] font-medium text-zinc-100">
                  {stream.label}
                </span>
              </button>

              <span className="flex shrink-0 items-center border-l border-white/10 bg-zinc-950/70 px-2 text-[10px] font-semibold text-zinc-300">
                {item.w}/{LAYOUT_MAP_COLS}
              </span>

              <button
                type="button"
                aria-label={`Redimensionar ${stream.label}`}
                className="w-3 shrink-0 cursor-ew-resize bg-primary/30 hover:bg-primary/50"
                onPointerDown={(event) => handleResizePointerDown(event, item)}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {orderedIds.map((id) => {
          const stream = streams.find((entry) => entry.id === id);
          if (!stream) return null;

          const width = widthById[id] ?? 6;

          return (
            <div
              key={id}
              draggable
              onDragStart={(event) => handleListDragStart(event, id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleListDrop(event, id)}
              className={cn(
                "flex items-center gap-2 rounded-md border border-white/10 bg-zinc-900/70 p-2",
                dragOrderId === id && "border-primary/50 bg-zinc-900",
              )}
            >
              <GripVerticalIcon className="size-4 shrink-0 cursor-grab text-zinc-500" />
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-200">
                {stream.label}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-zinc-400"
                  disabled={width <= 2}
                  onClick={() => handleWidthStep(id, -1)}
                  aria-label={`Diminuir largura de ${stream.label}`}
                >
                  <MinusIcon className="size-3" />
                </Button>
                <span className="w-10 text-center text-[11px] font-semibold text-zinc-300">
                  {width}/{LAYOUT_MAP_COLS}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-zinc-400"
                  disabled={width >= LAYOUT_MAP_COLS}
                  onClick={() => handleWidthStep(id, 1)}
                  aria-label={`Aumentar largura de ${stream.label}`}
                >
                  <PlusIcon className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-zinc-500">
        Grid de {LAYOUT_MAP_COLS} colunas. Arraste no mapa ou na lista para
        reposicionar. Use o traço à direita do bloco, ou os botões +/-, para
        ajustar a largura (mín. 2 colunas).
      </p>
    </div>
  );
}
