import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatPercent } from "@/lib/utils";

interface VoterWithWeight {
  voterWeight: number;
  voterName: string;
}

interface VotersChartProps {
  voters: VoterWithWeight[] | undefined;
  accountName: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#a45de2",
  "#d4ac0d",
  "#4a235a",
  "#03256C", // Add a color for "Other Voters"
];

const VotersChart: React.FC<VotersChartProps> = ({ voters, accountName }) => {
  const chartData = useMemo(() => {
    if (!voters) return [];

    const sortedVoters = [...voters].sort(
      (a, b) => b.voterWeight - a.voterWeight
    );
    const top9Voters = sortedVoters.slice(0, 9);

    let topVotersTotalWeight = 0;
    top9Voters.forEach((voter) => {
      topVotersTotalWeight += voter.voterWeight;
    });

    console.log("topVotersTotalWeight", topVotersTotalWeight);
    let otherVotersWeight = Math.max(0, 100 - topVotersTotalWeight);

    const chartData = top9Voters.map((voter) => ({
      name: voter.voterName,
      value: voter.voterWeight,
    }));

    // Conditionally include "Other Voters" entry
    if (otherVotersWeight > 0) {
      chartData.push({ name: "Other Voters", value: otherVotersWeight });
    }

    return chartData;
  }, [voters]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-md p-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{`${payload[0].name}`}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{`Weight: ${formatPercent(
            payload[0].value * 100
          )}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-1">
        Top Voters Weight Distribution
      </h3>
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                startAngle={90}
                endAngle={-270}
                paddingAngle={1}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center mt-1">
            {chartData.map((entry, index) => {
              // Skip rendering the legend item if the entry is "Other Voters" and its value is 0
              if (entry.name === "Other Voters" && entry.value === 0) {
                return null;
              }
              return (
                <div key={index} className="flex items-center mr-4">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.name} ({formatPercent(entry.value * 100)})
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p>
          No voter data available to display.
        </p>
      )}
    </div>
  );
};

export default VotersChart;
