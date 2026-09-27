import React from "react";
import moment from "moment";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import {
  formatMissRate,
  type MissedBlocksTrendPoint,
} from "@/utils/witnessMissedBlocks";

// Same amber as missed slots on /blocks.
export const MISSED_COLOR = "#f59e0b";

interface WitnessMissedBlocksChartProps {
  data: MissedBlocksTrendPoint[];
  dateFormat?: string;
  compact?: boolean;
  provisionalFrom?: string;
}

const WitnessMissedBlocksChart: React.FC<WitnessMissedBlocksChartProps> = ({
  data,
  dateFormat = "MMM D",
  compact = false,
  provisionalFrom,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: MissedBlocksTrendPoint }[];
  }) => {
    if (!active || !payload?.length) return null;
    const { period, missed, rate } = payload[0].payload;
    const isProvisional = Boolean(provisionalFrom && period >= provisionalFrom);
    return (
      <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
        <p className="text-gray-400 mb-0.5 text-center">
          {moment(period).format("MMM D, YYYY")}
          {isProvisional && " · " + t("witnessMissedBlocksCard.soFar")}
        </p>
        <p
          className="font-semibold leading-none"
          style={{ color: MISSED_COLOR }}
        >
          {t("witnessMissedBlocksCard.missedOnDay", {
            missed: missed.toLocaleString(locale),
          })}
        </p>
        <p className="mt-1 leading-none text-gray-500">
          {t("witnessMissedBlocksCard.chainRate", {
            rate: formatMissRate(rate, locale),
          })}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barCategoryGap="20%"
        margin={{ top: compact ? 8 : 16, right: 6, left: 6, bottom: 0 }}
      >
        <XAxis
          dataKey="period"
          tickFormatter={(value: string) => moment(value).format(dateFormat)}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={(value: number) => value.toLocaleString(locale)}
          orientation={isRTL ? "right" : "left"}
          allowDecimals={false}
          width={compact ? 34 : 44}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "currentColor", opacity: 0.06 }}
        />
        <Bar
          name={t("witnessMissedBlocksCard.missedBlocks")}
          dataKey="missed"
          fill={MISSED_COLOR}
          maxBarSize={48}
          radius={[2, 2, 0, 0]}
        >
          {data.map((point) => (
            <Cell
              key={point.period}
              fillOpacity={
                provisionalFrom && point.period >= provisionalFrom ? 0.4 : 1
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WitnessMissedBlocksChart;
