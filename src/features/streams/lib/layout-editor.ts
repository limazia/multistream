import type { Layout, LayoutItem } from "react-grid-layout";

import { GRID_COLS, LAYOUT_MAP_COLS } from "./grid-config";

export const LAYOUT_ITEM_HEIGHT = 4;

export function sortLayoutItems(layout: Layout): Layout {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

export function getLayoutOrder(layout: Layout): string[] {
  return sortLayoutItems(layout).map((item) => item.i);
}

export function getWidthById(layout: Layout): Record<string, number> {
  return Object.fromEntries(layout.map((item) => [item.i, item.w]));
}

export function clampWidth(width: number, cols = LAYOUT_MAP_COLS): number {
  const minW = Math.min(2, cols);
  return Math.max(minW, Math.min(width, cols));
}

export function clampItem(
  item: LayoutItem,
  cols = LAYOUT_MAP_COLS,
): LayoutItem {
  const w = clampWidth(item.w, cols);
  const x = Math.min(Math.max(0, item.x), Math.max(0, cols - w));

  return {
    ...item,
    x,
    w,
    h: item.h ?? LAYOUT_ITEM_HEIGHT,
    minW: Math.min(2, cols),
    minH: 2,
    maxW: cols,
  };
}

export function compactLayoutVertical(
  layout: Layout,
  cols = LAYOUT_MAP_COLS,
): Layout {
  const items = sortLayoutItems(layout).map((item) => clampItem(item, cols));
  const placed: LayoutItem[] = [];

  for (const item of items) {
    let y = 0;

    while (true) {
      const candidate = clampItem({ ...item, y }, cols);
      const collides = placed.some((other) => itemsCollide(candidate, other));

      if (!collides) {
        placed.push(candidate);
        break;
      }

      y += 1;
    }
  }

  return placed;
}

function itemsCollide(a: LayoutItem, b: LayoutItem): boolean {
  if (a.i === b.i) return false;

  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function snapColumn(
  value: number,
  cols = LAYOUT_MAP_COLS,
): number {
  return Math.max(0, Math.min(Math.round(value), cols - 1));
}

export function snapRow(value: number): number {
  return Math.max(0, Math.round(value));
}

function distributeColumnWidths(count: number, cols: number): number[] {
  const base = Math.floor(cols / count);
  const remainder = cols % count;

  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

function buildPresetRow(
  streamIds: string[],
  cols: number,
  y: number,
): Layout {
  const widths = distributeColumnWidths(streamIds.length, cols);
  let x = 0;

  return streamIds.map((id, index) => {
    const item = clampItem(
      {
        i: id,
        x,
        y,
        w: widths[index],
        h: LAYOUT_ITEM_HEIGHT,
        minW: 2,
        minH: 2,
        maxW: cols,
      },
      cols,
    );

    x += widths[index];
    return item;
  });
}

export function buildPresetLayout(
  streamIds: string[],
  cols = GRID_COLS.lg,
): Layout {
  const count = streamIds.length;

  if (count === 0) return [];

  if (count === 1) {
    return [
      clampItem(
        {
          i: streamIds[0],
          x: 0,
          y: 0,
          w: cols,
          h: LAYOUT_ITEM_HEIGHT,
          minW: 2,
          minH: 2,
          maxW: cols,
        },
        cols,
      ),
    ];
  }

  if (count === 2 || count === 3) {
    return buildPresetRow(streamIds, cols, 0);
  }

  const halfW = Math.floor(cols / 2);

  return streamIds.map((id, index) =>
    clampItem(
      {
        i: id,
        x: (index % 2) * halfW,
        y: Math.floor(index / 2) * LAYOUT_ITEM_HEIGHT,
        w: halfW,
        h: LAYOUT_ITEM_HEIGHT,
        minW: 2,
        minH: 2,
        maxW: cols,
      },
      cols,
    ),
  );
}

export function mergeLayoutWithStreams(
  layout: Layout,
  streamIds: string[],
): Layout {
  const existing = new Map(layout.map((item) => [item.i, item]));
  const hasAllStreams = streamIds.every((id) => existing.has(id));
  const sameStreams =
    streamIds.length === layout.length &&
    layout.every((item) => streamIds.includes(item.i));

  if (!hasAllStreams || !sameStreams) {
    return buildPresetLayout(streamIds);
  }

  return compactLayoutVertical(
    streamIds.map((id) => clampItem(existing.get(id)!)),
  );
}

export function updateLayoutItem(
  layout: Layout,
  id: string,
  patch: Partial<LayoutItem>,
): Layout {
  return compactLayoutVertical(
    layout.map((item) =>
      item.i === id ? clampItem({ ...item, ...patch }) : item,
    ),
  );
}
