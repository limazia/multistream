export const STORAGE_KEY = "multistream";

export const MAX_STREAMS = 4;

export const GRID_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
} as const;

export const GRID_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
} as const;

export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;

export const LAYOUT_MAP_ROW_HEIGHT = 40;
export const LAYOUT_MAP_COLS = GRID_COLS.lg;

export const GRID_MARGIN_Y = 8;
export const GRID_CONTAINER_PADDING_Y = 8;
export const GRID_MIN_ROW_HEIGHT = 48;

export function getBreakpointForWidth(width: number): GridBreakpoint {
  const ordered = (
    Object.entries(GRID_BREAKPOINTS) as [GridBreakpoint, number][]
  ).sort((a, b) => b[1] - a[1]);

  for (const [breakpoint, minWidth] of ordered) {
    if (width >= minWidth) return breakpoint;
  }

  return "xxs";
}
