import type { Opts } from "echarts-for-react/lib/types";

// Canvas rasterizes onto the device pixel grid, so a fractional devicePixelRatio
// (Windows display scaling) resamples every chart and softens its text. SVG is
// the default rather than a hard rule: a chart that repaints on a live poll is
// cheaper on canvas, so a caller can still ask for it.
export const resolveEChartOpts = (opts?: Opts): Opts => ({
  renderer: "svg",
  ...opts,
});
