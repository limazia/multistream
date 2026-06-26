import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { useEffect, useState } from "react";

import {
  getBreakpointForWidth,
  GRID_CONTAINER_PADDING_Y,
  GRID_MARGIN_Y,
  GRID_MIN_ROW_HEIGHT,
} from "../lib/grid-config";

function getMaxRows(layout: Layout): number {
  if (layout.length === 0) return 0;
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

function calcRowHeight(layout: Layout): number {
  const maxRows = getMaxRows(layout);
  if (maxRows === 0) return 80;

  const available =
    window.innerHeight - GRID_CONTAINER_PADDING_Y * 2;
  const totalMargin = Math.max(0, maxRows - 1) * GRID_MARGIN_Y;
  const next = Math.floor((available - totalMargin) / maxRows);

  return Math.max(next, GRID_MIN_ROW_HEIGHT);
}

function getRowHeightForLayouts(layouts: ResponsiveLayouts): number {
  const breakpoint = getBreakpointForWidth(window.innerWidth);
  const layout = layouts[breakpoint] ?? [];
  return calcRowHeight(layout);
}

export function useViewportRowHeight(layouts: ResponsiveLayouts): number {
  const [rowHeight, setRowHeight] = useState(() =>
    getRowHeightForLayouts(layouts),
  );

  useEffect(() => {
    const update = () => {
      setRowHeight(getRowHeightForLayouts(layouts));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [layouts]);

  return rowHeight;
}
