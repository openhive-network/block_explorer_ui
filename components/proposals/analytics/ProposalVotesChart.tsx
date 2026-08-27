import React, { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { Users } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { convertVestsToHP } from "@/utils/Calculations";
import { formatNumber } from "@/lib/utils";
import { grabNumericValue } from "@/utils/StringUtils";
import HiveAvatar from "@/components/ui/HiveAvatar";

// Constants related to chart presentation now live with the chart.
export const TOP_CHART_VOTERS = 10;
export const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#22c55e",
  "#0ea5e9",
  "#d946ef",
];
export const OTHERS_COLOR = "#94a3b8";

export interface ChartSegment {
  name: string;
  value: number; // The raw value for the pie slice
  formattedValue: string; // The pre-formatted string for the tooltip
  percentage: number;
  color: string;
  count?: number;
}

interface ProposalVotesChartProps {
  segments: ChartSegment[];
  totalFormattedValue: string;
  unitLabel: string;
  onSegmentClick: (name: string | null) => void;
  activeSegment: string | null;
}

// This function creates the segments. It's exported so the dialog can use it.
export const prepareChartData = (
  votes: { voter: string; totalVests: number }[],
  unit: "hp" | "vests",
  hiveChain: any,
  dynamicGlobalData: any,
  t: (key: string, options?: any) => string
) => {
  if (votes.length === 0 || !hiveChain || !dynamicGlobalData) {
    return {
      segments: [],
      totalFormattedValue: "0",
      unitLabel: unit.toUpperCase(),
    };
  }

  const { rawTotalVestingFundHive, rawTotalVestingShares } =
    dynamicGlobalData.headBlockDetails;
  const sortedFullList = [...votes].sort((a, b) => b.totalVests - a.totalVests);
  const totalValueRaw = sortedFullList.reduce(
    (sum, v) => sum + v.totalVests,
    0
  );

  if (totalValueRaw === 0) {
    return {
      segments: [],
      totalFormattedValue: "0",
      unitLabel: unit.toUpperCase(),
    };
  }

  const segments: ChartSegment[] = [];
  const topVoters = sortedFullList.slice(0, TOP_CHART_VOTERS);

  topVoters.forEach((voter, index) => {
    segments.push({
      name: voter.voter,
      value:
        unit === "hp"
          ? grabNumericValue(
              convertVestsToHP(
                hiveChain,
                String(voter.totalVests),
                rawTotalVestingFundHive,
                rawTotalVestingShares
              )
            )
          : voter.totalVests,
      formattedValue:
        unit === "hp"
          ? convertVestsToHP(
              hiveChain,
              String(voter.totalVests),
              rawTotalVestingFundHive,
              rawTotalVestingShares
            )
          : `${formatNumber(voter.totalVests, true, false)} Vests`,
      percentage: (voter.totalVests / totalValueRaw) * 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
    });
  });

  if (sortedFullList.length > TOP_CHART_VOTERS) {
    const otherVoters = sortedFullList.slice(TOP_CHART_VOTERS);
    const othersTotalVests = otherVoters.reduce(
      (sum, v) => sum + v.totalVests,
      0
    );
    if (othersTotalVests > 0) {
      segments.push({
        name: "Others",
        value:
          unit === "hp"
            ? grabNumericValue(
                convertVestsToHP(
                  hiveChain,
                  String(othersTotalVests),
                  rawTotalVestingFundHive,
                  rawTotalVestingShares
                )
              )
            : othersTotalVests,
        formattedValue:
          unit === "hp"
            ? convertVestsToHP(
                hiveChain,
                String(othersTotalVests),
                rawTotalVestingFundHive,
                rawTotalVestingShares
              )
            : `${formatNumber(othersTotalVests, true, false)} Vests`,
        percentage: (othersTotalVests / totalValueRaw) * 100,
        color: OTHERS_COLOR,
        count: otherVoters.length,
      });
    }
  }

  const totalFormattedValue =
    unit === "hp"
      ? convertVestsToHP(
          hiveChain,
          String(totalValueRaw),
          rawTotalVestingFundHive,
          rawTotalVestingShares
        )
      : formatNumber(totalValueRaw, true, false);

  const unitLabel = unit === "hp" ? "HP Voted" : "Vests Voted";

  return { segments, totalFormattedValue, unitLabel };
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useI18n();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg p-3 shadow-xl border border-slate-200/50 bg-theme dark:border-slate-800/50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {data.name === "Others" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                <Users className="h-6 w-6 text-slate-500" />
              </div>
            ) : (
              <HiveAvatar
                accountName={data.name}
                size={40}
                alt={data.name}
                className="rounded-full"
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-sm leading-tight">
              {data.name === "Others"
                ? `${t("proposalVotesChart.othersLabel")} (${data.count})`
                : data.name}
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 text-xs">
              <span>{t("proposalVotesChart.weightLabel")}:</span>
              <span className="font-semibold text-right">
                {data.formattedValue}
              </span>
              <span>{t("proposalVotesChart.influenceLabel")}:</span>
              <span
                className="font-bold text-right"
                style={{ color: data.color }}
              >
                {data.percentage.toLocaleString()}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ProposalVotesChart = ({
  segments,
  totalFormattedValue,
  unitLabel,
  onSegmentClick,
  activeSegment,
}: ProposalVotesChartProps) => {
  const { t } = useI18n();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!segments || segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Users className="w-12 h-12 mb-4 text-slate-400 dark:text-slate-500" />
        <p>{t("proposalVotesChart.noData")}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="90%"
            fill="#8884d8"
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
            onMouseEnter={(data) => setHoveredItem(data.name)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={(data) =>
              onSegmentClick(data.name === activeSegment ? null : data.name)
            }
            strokeWidth={0}
            strokeOpacity={0}
          >
            {segments.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                className="transition-opacity duration-200 cursor-pointer"
                style={{
                  opacity:
                    activeSegment && activeSegment !== entry.name ? 0.3 : 1,
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Legend
            content={
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {segments.map((entry) => (
                  <li
                    key={`legend-${entry.name}`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                    onMouseEnter={() => setHoveredItem(entry.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() =>
                      onSegmentClick(
                        entry.name === activeSegment ? null : entry.name
                      )
                    }
                    style={{
                      opacity:
                        activeSegment && activeSegment !== entry.name ? 0.5 : 1,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>
                      {entry.name === "Others"
                        ? `${t("proposalVotesChart.othersLabel")} (${
                            entry.count
                          })`
                        : entry.name}
                    </span>
                  </li>
                ))}
              </ul>
            }
            wrapperStyle={{
              bottom: 0,
              left: 0,
              right: 0,
              position: "absolute",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-lg font-bold ">{totalFormattedValue}</span>
        <span className="text-sm">{unitLabel}</span>
      </div>
    </div>
  );
};
