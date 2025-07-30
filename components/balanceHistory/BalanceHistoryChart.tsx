import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Line,
  LineChart,
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
import { useI18n } from "@/i18n/i18n";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHive } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";

interface BalanceHistoryChartProps {
  hiveBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
    hivePrice: string;
  }[];
  vestsBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
    hivePrice: string;
  }[];
  hbdBalanceHistoryData?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
    hivePrice: string;
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
  DOLLAR: "#4be7f0",
};

const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  hiveBalanceHistoryData,
  vestsBalanceHistoryData,
  hbdBalanceHistoryData,
  className = "",
  quickView = false,
  showSavingsBalance = "yes",
}) => {
  const { t, dir, locale } = useI18n();
  const hiveChain = useHiveChainContext()?.hiveChain;
  const dynamicGlobalData = useDynamicGlobal()?.dynamicGlobalData;
  const isRTL = dir === "rtl";

  const [selectedCoinType, setSelectedCoinType] = useState<string>("HIVE");
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 480);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);

  // State to store available coins
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

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
      hivePrice: string;
    }[]
  > = useMemo(() => {
    return {
      HIVE: hiveBalanceHistoryData || [],
      VESTS: vestsBalanceHistoryData || [],
      HBD: hbdBalanceHistoryData || [],
    };
  }, [hiveBalanceHistoryData, vestsBalanceHistoryData, hbdBalanceHistoryData]);

  const handleCoinTypeChange = (coinType: string) => {
    setSelectedCoinType(coinType);
  };

  const vestsToHive = useCallback(
    (vests: string | null) => {
      if (hiveChain && vests && dynamicGlobalData) {
        const result = convertVestsToHive(
          hiveChain,
          vests,
          dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive,
          dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
        );
        return result;
      }
    },
    [hiveChain, dynamicGlobalData]
  );

  const getDollarValue = useCallback(
    (
      hivePriceStr: string | undefined,
      balance: number,
      vests: string
    ): number | string | undefined => {
      const hivePrice = Number(hivePriceStr ?? 0);

      switch (selectedCoinType) {
        case "HIVE":
          return hivePrice * balance;
        case "HBD":
          return balance;
        case "VESTS":
          const result = grabNumericValue(vests ?? "") * hivePrice;
          return result;
        default:
          return undefined;
      }
    },
    [selectedCoinType]
  );

  const displayData = useMemo(() => {
    return dataMap[selectedCoinType].map((item) => {
      const hivePrice = item.hivePrice;
      const balance = item.balance ?? 0;
      const vests = selectedCoinType === "VESTS" ? String(balance) : null;
      const convertedVests = vestsToHive(vests);
      const dollarValue =
        getDollarValue(hivePrice, balance, convertedVests) || undefined;

      return { ...item, dollarValue };
    });
  }, [dataMap, selectedCoinType, vestsToHive, getDollarValue]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    const { dir: tooltipDir } = useI18n();
    if (quickView || !active || !payload || payload.length === 0) return null;
    const isTooltipRTL = tooltipDir === "rtl";
    const selectedData = displayData?.find((item) => item.timestamp === label);
    if (!selectedData) return null;

    const actualBalance = selectedData?.balance ?? 0;
    const balanceChange = selectedData?.balance_change ?? 0;
    const savingsBalance = selectedData?.savings_balance ?? undefined;
    const savingsBalanceChange = selectedData?.savings_balance_change ?? 0;
    const hivePrice = selectedData?.hivePrice ?? 0;

    const vests = selectedCoinType === "VESTS" ? String(actualBalance) : null;

    const convertedVests = vestsToHive(vests);

    const isPositiveChange = balanceChange > 0;
    const isZeroChange = balanceChange === 0;
    const isSavingsPositiveChange = savingsBalanceChange > 0;
    const isSavingsZeroChange = savingsBalanceChange === 0;

    const currentCoinColor = colorMap[selectedCoinType];

    const dollarValue = getDollarValue(
      hivePrice,
      actualBalance,
      convertedVests
    );

    return (
      <div className="bg-theme dark:bg-theme p-2 rounded border border-explorer-light-gray">
        <p className="font-bold">{`${t("common.date")}: ${label}`}</p>
        <div
          className="mb-1"
          style={{ color: currentCoinColor }}
        >
          <div
            className={cn(
              "flex items-center",
              isTooltipRTL && "flex-row-reverse"
            )}
            style={{ color: currentCoinColor }}
          >
            {isPositiveChange ? (
              <ArrowUp
                className="bg-green-400 p-[1.2px]"
                size={16}
              />
            ) : isZeroChange ? (
              <Minus
                className={cn(
                  "bg-black p-[1.2px]",
                  isTooltipRTL ? "ml-1" : "mr-1"
                )}
                color={currentCoinColor}
                size={16}
              />
            ) : (
              <ArrowDown
                className="bg-red-400  p-[1.2px]"
                size={16}
              />
            )}
            {` ${formatNumber(balanceChange, selectedCoinType === "VESTS")}`}
          </div>
          <div style={{ color: currentCoinColor }}>{`${t(
            "common.balance"
          )}: ${formatNumber(
            actualBalance,
            selectedCoinType === "VESTS"
          )}`}</div>

          {dollarValue ? (
            <div style={{ color: colorMap.DOLLAR }}>
              Dollar Value: $
              {selectedCoinType === "VESTS"
                ? Number(dollarValue).toFixed(2)
                : formatNumber(dollarValue, false)}
            </div>
          ) : null}
        </div>

        {showSavingsBalance === "yes" &&
          savingsBalance !== undefined &&
          selectedCoinType !== "VESTS" && (
            <div className=" border-t border-gray-400 dark:border-gray-600 mt-1">
              <div
                className={cn(
                  "flex items-center",
                  isTooltipRTL && "flex-row-reverse"
                )}
                style={{ color: colorMap.SAVINGS }}
              >
                {isSavingsPositiveChange ? (
                  <ArrowUp
                    className="bg-green-400 p-[1.2px]"
                    size={16}
                  />
                ) : isSavingsZeroChange ? (
                  <Minus
                    className={cn(
                      "bg-black p-[1.2px]",
                      isTooltipRTL ? "ml-1" : "mr-1"
                    )}
                    color={colorMap.SAVINGS}
                    size={16}
                  />
                ) : (
                  <ArrowDown
                    className="bg-red-400 p-[1.2px]"
                    size={16}
                  />
                )}
                {` ${formatNumber(
                  savingsBalanceChange,
                  selectedCoinType === "VESTS"
                )}`}
              </div>
              <div style={{ color: colorMap.SAVINGS }}>
                {`${t("balanceHistoryChart.savingsBalance")}: ${formatNumber(
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

  const getMinMax = (
    data: {
      balance: number;
      savings_balance?: number;
      dollarValue: string | number | undefined;
    }[]
  ) => {
    if (!data || data.length === 0) {
      return [0, 1];
    }

    let allValues: number[] = data.map((item) => item.balance);

    const dollarValues = data
      .map((item) => item.dollarValue)
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

    allValues = allValues.concat(dollarValues);
    if (showSavingsBalance == "yes" && selectedCoinType !== "VESTS") {
      const savingsValues = data
        .map((item) => item.savings_balance)
        .filter((value) => value !== undefined) as number[];
      allValues = allValues.concat(savingsValues);
    }

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    return [minValue, maxValue];
  };

  const [fullDataMin, fullDataMax] = getMinMax(displayData);
  const [minValue, maxValue] = zoomedDomain || [fullDataMin, fullDataMax];

  const handleBrushAreaChange = (domain: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (
      !domain ||
      domain.startIndex === undefined ||
      domain.endIndex === undefined
    ) {
      // Reset zoom if brush is cleared or start/end index is undefined
      setZoomedDomain([fullDataMin, fullDataMax]);
      return;
    }

    const { startIndex, endIndex } = domain;
    const visibleData = (displayData || []).slice(startIndex, endIndex + 1);

    if (visibleData.length > 0) {
      const [min, max] = getMinMax(visibleData);
      setZoomedDomain([min, max]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {availableCoins.length > 1 && (
        <div
          className={cn("flex mb-4", isRTL ? "justify-start" : "justify-end")}
        >
          {renderCoinButtons()}
        </div>
      )}

      <ResponsiveContainer
        width="100%"
        height="100%"
        className="mb-5 items-start"
      >
        <LineChart
          data={displayData || []}
          margin={{
            top: 20,
            right: isRTL ? (isMobile ? 0 : 10) : isMobile ? 0 : 20,
            left: isRTL ? (isMobile ? 0 : 20) : isMobile ? 0 : 10,
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
            reversed={isRTL}
          />
          <YAxis
            domain={[minValue, maxValue]}
            orientation={isRTL ? "right" : "left"}
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

          <Line
            type="monotone"
            dataKey="dollarValue"
            stroke={colorMap.DOLLAR}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={"DOLLAR"}
            dot={false}
            hide={hiddenDataKeys.includes("dollarValue")}
          />

          {showSavingsBalance == "yes" && selectedCoinType !== "VESTS" && (
            <Line
              type="monotone"
              dataKey="savings_balance"
              stroke={colorMap.SAVINGS}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name={t("balanceHistoryChart.savingsBalance")}
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
            align={isRTL ? "right" : "left"}
            wrapperStyle={{ paddingTop: isMobile ? "20px" : "0px" }}
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
