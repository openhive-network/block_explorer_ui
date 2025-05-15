import React, { useState, useEffect } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import moment from "moment";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface BalanceHistoryChartProps {
  hiveBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
  }[];
  vestsBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
  }[];
  hbdBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
  }[];
  className?: string;
  quickView?: boolean;
  showSavingsBalance?: string;
}

export const colorMap: Record<string, string> = {
  HIVE: "#8884d8",
  VESTS: "#82ca9d",
  HBD: "#ff7300",
  SAVINGS: "#1E90FF",
};

const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  hiveBalanceHistoryData,
  vestsBalanceHistoryData,
  hbdBalanceHistoryData,
  className = "",
  quickView = false,
  showSavingsBalance = "yes",
}) => {
  const [selectedCoinType, setSelectedCoinType] = useState<string>("HIVE");
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 480);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);

  // State to store available coins
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(null);

  useEffect(() => {
    const newAvailableCoins: string[] = [];
    if (hiveBalanceHistoryData && hiveBalanceHistoryData.length > 0)
      newAvailableCoins.push("HIVE");
    if (vestsBalanceHistoryData && vestsBalanceHistoryData.length > 0)
      newAvailableCoins.push("VESTS");
    if (hbdBalanceHistoryData && hbdBalanceHistoryData.length > 0)
      newAvailableCoins.push("HBD");

    setAvailableCoins(newAvailableCoins);
  }, [hiveBalanceHistoryData, vestsBalanceHistoryData, hbdBalanceHistoryData]);

  useEffect(() => {
    if (availableCoins.length === 1) {
      setSelectedCoinType(availableCoins[0]);
    } else if (
      availableCoins.length > 1 &&
      !availableCoins.includes(selectedCoinType)
    ) {
      setSelectedCoinType(availableCoins[0]);
    }
  }, [availableCoins, selectedCoinType]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dataMap: Record<
    string,
    {
      timestamp: string;
      balance_change: number;
      balance: number;
      savings_balance?: number;
      savings_balance_change?: number;
    }[]
  > = {
    HIVE: hiveBalanceHistoryData || [],
    VESTS: vestsBalanceHistoryData || [],
    HBD: hbdBalanceHistoryData || [],
  };

  const handleCoinTypeChange = (coinType: string) => {
    setSelectedCoinType(coinType);
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (quickView || !active || !payload || payload.length === 0) return null;

    const selectedData = dataMap[selectedCoinType]?.find((item) => item.timestamp === label);
    if (!selectedData) return null;

    const actualBalance = selectedData?.balance ?? 0;
    const balanceChange = selectedData?.balance_change ?? 0;
    const savingsBalance = selectedData?.savings_balance ?? undefined;
    const savingsBalanceChange = selectedData?.savings_balance_change ?? 0;

    const isPositiveChange = balanceChange > 0;
    const isZeroChange = balanceChange === 0;
    const isSavingsPositiveChange = savingsBalanceChange > 0;
    const isSavingsZeroChange = savingsBalanceChange === 0;

    const currentCoinColor = colorMap[selectedCoinType];

    return (
      <div className="bg-theme dark:bg-theme p-2 rounded border border-explorer-light-gray">
        <p className="font-bold">{`Date: ${label}`}</p>
        <div className="mb-1" style={{ color: currentCoinColor }}>
          {/* Divider with color */}
          <div className="flex items-center" style={{ color: currentCoinColor }}>
            {isPositiveChange ? (
              <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
            ) : isZeroChange ? (
              <Minus className="bg-black p-[1.2px] mr-1" color={currentCoinColor} size={16} />
            ) : (
              <ArrowDown className="bg-red-400  p-[1.2px]" size={16} />
            )}
            {` ${formatNumber(balanceChange, selectedCoinType === "VESTS")}`}
          </div>
          <div style={{ color: currentCoinColor }}>{`Balance: ${formatNumber(
            actualBalance,
            selectedCoinType === "VESTS"
          )}`}</div>
        </div>

        {showSavingsBalance && savingsBalance !== undefined && (
          <div className=" border-t border-gray-400 dark:border-gray-600 mt-1">
            <div className="flex items-center" style={{ color: colorMap.SAVINGS }}>
              {isSavingsPositiveChange ? (
                <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
              ) : isSavingsZeroChange ? (
                <Minus className="bg-black p-[1.2px] mr-1" color={colorMap.SAVINGS} size={16} />
              ) : (
                <ArrowDown className="bg-red-400 p-[1.2px]" size={16} />
              )}
              {` ${formatNumber(
                savingsBalanceChange,
                selectedCoinType === "VESTS"
              )}`}
            </div>
            <div style={{ color: colorMap.SAVINGS }}>
              {`Savings Balance: ${formatNumber(
                savingsBalance,
                selectedCoinType === "VESTS"
              )}`}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoinButtons = () => {
    return availableCoins.map((coinType) => (
      <button
        key={coinType}
        onClick={() => handleCoinTypeChange(coinType)}
        className={cn(
          "px-2 py-1 text-sm rounded m-[1px]",
          selectedCoinType === coinType
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-600 dark:text-white hover:dark:bg-gray-500"
        )}
      >
        {coinType}
      </button>
    ));
  };

  const getMinMax = (data: { balance: number; savings_balance?: number }[]) => {
    if (!data || data.length === 0) {
      return [0, 1];
    }

    let allValues: number[] = data.map((item) => item.balance);
    if (showSavingsBalance=="yes" && selectedCoinType !== 'VESTS') {
      const savingsValues = data.map(item => item.savings_balance).filter(value => value !== undefined) as number[];
      allValues = allValues.concat(savingsValues);
    }

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    return [minValue, maxValue];
  };

  const [fullDataMin, fullDataMax] = getMinMax(dataMap[selectedCoinType]);
  const [minValue, maxValue] = zoomedDomain || [fullDataMin, fullDataMax];

  const handleBrushAreaChange = (domain: { startIndex?: number; endIndex?: number }) => {
    if (!domain || domain.startIndex === undefined || domain.endIndex === undefined) {
      // Reset zoom if brush is cleared or start/end index is undefined
      setZoomedDomain([fullDataMin, fullDataMax]);
      return;
    }

    const { startIndex, endIndex } = domain;
    const visibleData = (dataMap[selectedCoinType] || []).slice(
      startIndex,
      endIndex + 1
    );

    if (visibleData.length > 0) {
      const [min, max] = getMinMax(visibleData);
      setZoomedDomain([min, max]);
    }
  };


  return (
    <div className={cn("w-full", className)}>
      {availableCoins.length > 1 && (
        <div className="flex justify-end mb-4">{renderCoinButtons()}</div>
      )}

      <ResponsiveContainer
        width="100%"
        height="100%"
        className="mb-5 items-start"
      >
        <LineChart
          data={dataMap[selectedCoinType] || []}
          margin={{
            top: 20,
            right: isMobile ? 0 : 20,
            left: isMobile ? 0 : 10,
            bottom: isMobile ? 100 : 60,
          }}
    
        >
          <XAxis
            dataKey="timestamp"
            tickCount={quickView ? 5 : 14}
            tickFormatter={(value) => moment(value).format("MMM D")}
            style={{ fontSize: "10px" }}
            angle={isMobile ? -90 : 0}
            dx={isMobile ? -8 : 0}
            dy={isMobile ? 20 : 10}
          />
          <YAxis
            domain={[minValue, maxValue]}
            tickFormatter={(tick) => {
              if (selectedCoinType === "VESTS") {
                const valueInK = tick / 1000;
                let formattedValue = formatNumber(valueInK, true, false);
                formattedValue = formattedValue.split(".")[0];
                return `${formattedValue} K`;
              }
              return formatNumber(tick, selectedCoinType === "VESTS", false);
            }}
            style={{ fontSize: "10px" }}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={selectedCoinType}
            dot={false}
            hide={hiddenDataKeys.includes("balance")}
          />

          {showSavingsBalance == "yes" && selectedCoinType !== 'VESTS' && (
            <Line
              type="monotone"
              dataKey="savings_balance"
              stroke={colorMap.SAVINGS}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Savings Balance"
              dot={false}
              hide={hiddenDataKeys.includes("savings_balance")}
            />
          )}

          {!quickView && (
            <Brush
              dataKey="timestamp"
              height={30}
              stroke="var(--color-switch-off)"
              fill="var(--color-background)"
              travellerWidth={10}
              tickFormatter={(value) => moment(value).format("MMM D")}
              y={380}
              x={50}
              className="text-xs"
              onChange={handleBrushAreaChange}
            />
          )}
          <Legend
            onClick={(event) => {
              const dataKey = event.dataKey as string;
              const isHidden = hiddenDataKeys.includes(dataKey as string);
              if (isHidden) {
                setHiddenDataKeys(
                  hiddenDataKeys.filter((key) => key !== dataKey)
                );
              } else {
                setHiddenDataKeys([...hiddenDataKeys, dataKey]);
              }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceHistoryChart;