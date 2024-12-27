import React, { useState, useEffect } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown,faArrowUp } from "@fortawesome/free-solid-svg-icons";
interface BalanceHistoryChartProps {
  hiveBalanceHistoryData?: { timestamp: string; balance_change: number; balance: number }[]; 
  vestsBalanceHistoryData?: { timestamp: string; balance_change: number; balance: number }[]; 
  hbdBalanceHistoryData?: { timestamp: string; balance_change: number; balance: number }[]; 
  className?: string;
  quickView?: boolean;
}

const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  hiveBalanceHistoryData,
  vestsBalanceHistoryData,
  hbdBalanceHistoryData,
  className = "",
  quickView = false,
}) => {
  const availableCoins: string[] = [];

  if (hiveBalanceHistoryData && hiveBalanceHistoryData.length > 0) availableCoins.push("HIVE");
  if (vestsBalanceHistoryData && vestsBalanceHistoryData.length > 0) availableCoins.push("VESTS");
  if (hbdBalanceHistoryData && hbdBalanceHistoryData.length > 0) availableCoins.push("HBD");

  // Ensure we render a message only if there's no data available at all
 /* if (availableCoins.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-sm">No balance information found.</p>
      </div>
    );
  }*/

  const defaultSelectedCoinType = availableCoins.length === 1 ? availableCoins[0] : "HIVE";
  const [selectedCoinType, setSelectedCoinType] = useState<string>(defaultSelectedCoinType);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 480);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*useEffect(() => {
    if (availableCoins.length === 1) {
      setSelectedCoinType(availableCoins[0]);
    } else if (availableCoins.length > 1 && !availableCoins.includes(selectedCoinType)) {
      setSelectedCoinType(availableCoins[0]);
    }
  }, [availableCoins,selectedCoinType]);*/

  const colorMap: Record<string, string> = {
    "HIVE": "#8884d8",
    "VESTS": "#82ca9d",
    "HBD": "#ff7300",
  };

  const dataMap: Record<string, { timestamp: string; balance_change: number; balance: number }[]> = {
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
  
    // Get the actual balance from the data
    const actualBalance = dataMap[selectedCoinType]?.find(
      (item) => item.timestamp === label
    )?.balance ?? 0;
    const balanceChange = payload[0]?.payload.balance_change ?? 0;
  
    // Determine if the balance change is positive or negative
    const isPositiveChange = balanceChange > 0;
  
    return (
      <div className="bg-theme dark:bg-theme p-2 rounded border border-explorer-light-gray">
        <p className="font-bold">{`Date: ${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.stroke }}>
            <div>
              {/* Displaying arrow icon instead of balance change text */}
              {isPositiveChange ? (
                <FontAwesomeIcon
                  icon={faArrowUp}
                  size="sm"
                  className="bg-green-400 p-[1.2px]" // Green for positive
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowDown}
                  size="sm"
                  color="red"
                  className="bg-red-400 p-[1.2px]" // Red for negative
                />

              )}
              {` ${formatNumber(
                balanceChange,
                selectedCoinType === "VESTS",
                false
              )}`}
            </div>
            {/* Show the actual balance */}
            <div>{`Balance: ${formatNumber(
              actualBalance,
              selectedCoinType === "VESTS",
              false
            )}`}</div>
          </div>
        ))}
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

  const getMinMax = (data: { balance: number }[]) => {
    const balance = data.map(item => item.balance);
    const minValue = Math.min(...balance);
    const maxValue = Math.max(...balance);
    return [minValue, maxValue];
  };

  if (!selectedCoinType) {
    return null; 
  }

  const [minValue, maxValue] = getMinMax(dataMap[selectedCoinType]);

  // Determine the interval based on the length of the data
  const tickInterval = Math.ceil(dataMap[selectedCoinType].length / 10);

  return (
    <div className={cn("w-full", className)}>
      {availableCoins.length > 1 && (
        <div className="flex justify-end mb-4">{renderCoinButtons()}</div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dataMap[selectedCoinType] || []}
          margin={{ top: 20, right: 30, left: 20, bottom: isMobile ? 100 : 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={quickView ? false : true}
            interval={tickInterval}
            tickFormatter={(value) => moment(value).format("MMM D")} // Formatting dates to be more readable
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

              // For other coin types, use the usual formatting
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
            activeDot={{ r: 6 }}
            name={selectedCoinType}
            dot={false}
            hide={hiddenDataKeys.includes("balance")}
          />
          <Legend
            onClick={(event) => {
              const { dataKey } = event;
              const isHidden = hiddenDataKeys.includes(dataKey);
              if (isHidden) {
                setHiddenDataKeys(
                  hiddenDataKeys.filter((key) => key !== dataKey)
                );
              } else {
                setHiddenDataKeys([...hiddenDataKeys, dataKey]);
              }
            }}
          />
          {!quickView && (
            <Brush
              dataKey="timestamp"
              height={30}
              stroke="var(--color-switch-off)"
              fill="var(--color-background)"
              travellerWidth={10}
              tickFormatter={(value) => moment(value).format("MMM D")}
              y={380}
              className="text-xs"
            />
          )}
          
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceHistoryChart;