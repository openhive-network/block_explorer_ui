import React from "react";
import dynamic from "next/dynamic";
import type { EChartsReactProps } from "echarts-for-react";
import { resolveEChartOpts } from "@/utils/echartOpts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const EChart: React.FC<EChartsReactProps> = ({ opts, ...props }) => (
  <ReactECharts {...props} opts={resolveEChartOpts(opts)} />
);

export default EChart;
