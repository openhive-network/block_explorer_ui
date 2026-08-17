import React from "react";
import dynamic from "next/dynamic";
import type { EChartsReactProps } from "echarts-for-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Canvas rasterizes onto the device pixel grid, so a fractional devicePixelRatio
// (Windows display scaling) resamples every chart and softens its text.
const EChart: React.FC<EChartsReactProps> = ({ opts, ...props }) => (
  <ReactECharts {...props} opts={{ renderer: "svg", ...opts }} />
);

export default EChart;
