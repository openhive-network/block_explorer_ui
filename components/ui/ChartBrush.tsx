import React from "react";

import { useTheme } from "@/contexts/ThemeContext";

const GRADIENT_ID_LIGHT = "chart-brush-gradient-light";
const GRADIENT_ID_DARK = "chart-brush-gradient-dark";

export const ChartBrushDefs: React.FC = () => (
  <defs>
    <linearGradient id={GRADIENT_ID_LIGHT} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#f9fafb" stopOpacity="0.6" />
    </linearGradient>
    <linearGradient id={GRADIENT_ID_DARK} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#374151" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#1f2937" stopOpacity="0.4" />
    </linearGradient>
  </defs>
);

interface ChartBrushTravellerProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const ChartBrushTraveller: React.FC<ChartBrushTravellerProps> = ({
  x = 0,
  y = 0,
  width = 10,
  height = 28,
}) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const handleRadius = Math.min(4, width / 2);
  return (
    <g style={{ cursor: "ew-resize" }}>
      <rect
        x={x}
        y={y - 1}
        width={width}
        height={height + 2}
        rx={handleRadius}
        ry={handleRadius}
        fill="#9ca3af"
        stroke="#6b7280"
        strokeWidth={0.5}
      />
      <line
        x1={x + 2.5}
        y1={centerY - 0.5}
        x2={x + width - 2.5}
        y2={centerY - 0.5}
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.85}
      />
      <line
        x1={x + 2.5}
        y1={centerY + 1.5}
        x2={x + width - 2.5}
        y2={centerY + 1.5}
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
};

export const useChartBrushDefaults = () => {
  const { theme } = useTheme();
  const gradientId = theme === "dark" ? GRADIENT_ID_DARK : GRADIENT_ID_LIGHT;
  return {
    fill: `url(#${gradientId})`,
    stroke: theme === "dark" ? "#374151" : "#d1d5db",
    travellerWidth: 10,
    height: 28,
    traveller: (<ChartBrushTraveller />) as any,
    className:
      "recharts-brush text-xs [&_text]:fill-gray-500 dark:[&_text]:fill-gray-400",
  };
};
