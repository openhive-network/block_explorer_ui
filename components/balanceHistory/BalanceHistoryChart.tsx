import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
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
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";

interface BalanceHistoryChartProps {
  aggregatedAccountBalanceHistory?: {
    timestamp: string;
    balance_change: number;
    balance: number;
    savings_balance?: number;
    savings_balance_change?: number;
    hivePrice: string;
    dollarValue?: number;
    convertedHive?: number;
  }[];
  className?: string;
  quickView?: boolean;
  showSavingsBalance?: string;
  selectedCoinType: string;
  setSelectedCoinType: Dispatch<SetStateAction<string>>;
}

export const colorMap: Record<string, string> = {
  HIVE: "#8884d8",
  VESTS: "#82ca9d",
  HBD: "#ff7300",
  SAVINGS: "#1E90FF",
  DOLLAR: "#4be7f0",
};

const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  aggregatedAccountBalanceHistory,
  className = "",
  quickView = false,
  showSavingsBalance = "yes",
  selectedCoinType,
  setSelectedCoinType,
}) => {
  const { t, dir, locale } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const { settings } = useSettings(); // <-- Get user's VESTS/HP setting
  const isRTL = dir === "rtl";

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 480);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);
  const [unit, setUnit] = useState<"vests" | "hp">(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  ); // <-- Added VESTS/HP toggle state

  // Sync unit with user settings
  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);

  // State to store available coins
  const availableCoins = ["HIVE", "VESTS", "HBD"];
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Process data for chart depending on selectedCoinType
const processedData = useCallback(
  (data: any, type: string) => {
    if (!dynamicGlobalData || !hiveChain || !data) return [];

    const parseAssetField = (field: any): number => {
      if (field == null) return 0;

      if (typeof field === "number" && !Number.isNaN(field)) return field;

      if (typeof field === "string") {
        const numericStr = String(grabNumericValue(field));
        const parsed = Number(numericStr);
        if (!Number.isNaN(parsed)) return parsed;

        const cleaned = field.replace(/[^0-9.\-]/g, "");
        const parsedAlt = Number(cleaned);
        return Number.isNaN(parsedAlt) ? 0 : parsedAlt;
      }

      if (typeof field === "object") {
        if ("amount" in field) {
          const amount = Number(field.amount ?? 0);
          const precision = Number(field.precision ?? 0);
          if (!Number.isNaN(amount)) {
            return amount / Math.pow(10, precision);
          }
        }

        try {
          const asString = JSON.stringify(field);
          const numericStr = String(grabNumericValue(asString));
          const parsed = Number(numericStr);
          if (!Number.isNaN(parsed)) return parsed;
        } catch {
          return 0;
        }
      }

      return 0;
    };

    // Safely extract total vesting fund and shares
    const fundHive =
      parseAssetField(dynamicGlobalData.total_vesting_fund_hive) ||
      parseAssetField(dynamicGlobalData.headBlockDetails?.rawTotalVestingFundHive) ||
      0;

    const totalVests =
      parseAssetField(dynamicGlobalData.total_vesting_shares) ||
      parseAssetField(dynamicGlobalData.headBlockDetails?.rawTotalVestingShares) ||
      0;

    return data.map((item: any) => {
      const hivePrice = parseFloat(item.hivePrice || "0");
      const parsedItemBalance = parseAssetField(item.balance ?? item.vests ?? item.value ?? 0);

      if (type === "VESTS") {
        let displayValue = parsedItemBalance;

        if (fundHive > 0 && totalVests > 0) {
          const convertedHP = (fundHive * parsedItemBalance) / totalVests;
          displayValue = unit === "hp" ? convertedHP : parsedItemBalance;
        }

        const dollarValue = !Number.isNaN(displayValue) && !Number.isNaN(hivePrice)
          ? displayValue * hivePrice
          : 0;

        return {
          ...item,
          convertedHive: displayValue,
          dollarValue,
          displayBalance: displayValue,
        };
      }

      if (type === "HIVE") {
        const balanceValue = parseAssetField(item.balance ?? item.hive ?? 0);
        const dollarValue = !Number.isNaN(balanceValue) && !Number.isNaN(hivePrice)
          ? balanceValue * hivePrice
          : 0;

        return { ...item, displayBalance: balanceValue, dollarValue };
      }

      if (type === "HBD") {
        const balanceValue = parseAssetField(item.balance ?? item.hbd ?? 0);
        return { ...item, displayBalance: balanceValue, dollarValue: balanceValue };
      }

      return { ...item, displayBalance: parseAssetField(item.balance ?? 0) };
    });
  },
  [dynamicGlobalData, hiveChain, unit]
);




  const dataMap: Record<
    string,
    {
      timestamp: string;
      balance_change: number;
      balance: number;
      savings_balance?: number;
      savings_balance_change?: number;
      hivePrice: string;
      dollarValue?: number;
      convertedHive?: number;
      displayBalance?: number;
    }[]
  > = useMemo(() => {
    return {
      [selectedCoinType]:
        processedData(aggregatedAccountBalanceHistory, selectedCoinType) || [],
    };
  }, [processedData, aggregatedAccountBalanceHistory, selectedCoinType]);

  const handleCoinTypeChange = (coinType: string) => {
    setSelectedCoinType(coinType);
  };

  const displayData = useMemo(() => {
    return dataMap[selectedCoinType];
  }, [dataMap, selectedCoinType]);

  // Custom tooltip
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

    const actualBalance = selectedData?.displayBalance ?? 0; // <-- Use displayBalance
    const balanceChange = selectedData?.balance_change ?? 0;
    const savingsBalance = selectedData?.savings_balance ?? undefined;
    const savingsBalanceChange = selectedData?.savings_balance_change ?? 0;
    const dollarValue = selectedData?.dollarValue ?? 0;

    const isPositiveChange = balanceChange > 0;
    const isZeroChange = balanceChange === 0;
    const isSavingsPositiveChange = savingsBalanceChange > 0;
    const isSavingsZeroChange = savingsBalanceChange === 0;

    const currentCoinColor = colorMap[selectedCoinType];

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
              {formatNumber(dollarValue, false, selectedCoinType === "VESTS")}
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

  // Render buttons for coin selection
  const renderCoinButtons = () => {
    return (
      <div className="flex items-center space-x-2">
        {availableCoins.map((coinType) => (
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
        ))}

        {/* VESTS / HP toggle */}
        {selectedCoinType === "VESTS" && (
          <div className="flex items-center space-x-1 ml-4">
            <span className="text-sm">{t("common.vests")}</span>
            <Switch
              id="unit-toggle"
              checked={unit === "hp"}
              onCheckedChange={(checked) =>
                setUnit(checked ? "hp" : "vests")
              }
            />
            <span className="text-sm">{t("common.hp")}</span>
          </div>
        )}
      </div>
    );
  };

  const getMinMax = (
    data: {
      balance: number;
      savings_balance?: number;
      dollarValue?: number;
      convertedHive?: number;
      displayBalance?: number;
    }[]
  ): [number, number] => {
    if (!data || data.length === 0) {
      return [0, 1];
    }

    let allValues: number[] = [];

    if (selectedCoinType === "VESTS") {
      const dollarValues = data
        .map((item) => item.dollarValue)
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

      allValues = allValues.concat(dollarValues);
      const balances = data
        .map((item) => item.displayBalance)
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      allValues = allValues.concat(balances);
    } else {
      allValues = data.map((item) => item.displayBalance ?? item.balance);

      const dollarValues = data
        .map((item) => item.dollarValue)
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      allValues = allValues.concat(dollarValues);

      if (showSavingsBalance === "yes") {
        const savingsValues = data
          .map((item) => item.savings_balance)
          .filter((v): v is number => typeof v === "number");
        allValues = allValues.concat(savingsValues);
      }
    }

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    return [minValue, maxValue];
  };

  const [fullDataMin, fullDataMax] = getMinMax(displayData);
  const [minValue, maxValue] = zoomedDomain || [fullDataMin, fullDataMax];

  const handleBrushAreaChange = (domain: { startIndex?: number; endIndex?: number }) => {
    if (!domain || domain.startIndex === undefined || domain.endIndex === undefined) {
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

  if (!displayData || !displayData.length) return null;

  const isDualAxis = selectedCoinType === "VESTS";
  const primaryAxisId = isRTL ? "right" : "left";
  const secondaryAxisId = isRTL ? "left" : "right";

  return (
    <div className={cn("w-full", className)}>
      {quickView && <div className={cn("flex mb-4", isRTL ? "justify-start" : "justify-end")}>{renderCoinButtons()}</div>}

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
            yAxisId={primaryAxisId}
            domain={[minValue, maxValue]}
            orientation={primaryAxisId}
            style={{ fontSize: "10px" }}
            tickCount={6}
            tickFormatter={(tick) => {
              if (selectedCoinType === "VESTS") {
                const valueInK = tick / 1_000;
                return `${formatNumber(valueInK, true, false).split(".")[0]} K`;
              }
              return formatNumber(tick, false, false);
            }}
          />

          {isDualAxis && (
            <YAxis
              yAxisId={secondaryAxisId}
              orientation={secondaryAxisId}
              style={{ fontSize: "10px" }}
              tickFormatter={(tick) => `$${Math.round(tick)}`}
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId={primaryAxisId}
            type="monotone"
            dataKey="displayBalance" // <-- Use displayBalance for toggle
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={selectedCoinType}
            dot={false}
            hide={hiddenDataKeys.includes("displayBalance")}
          />

          <Line
            yAxisId={isDualAxis ? secondaryAxisId : primaryAxisId}
            type="monotone"
            dataKey="dollarValue"
            stroke={colorMap.DOLLAR}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="DOLLAR"
            dot={false}
            hide={hiddenDataKeys.includes("dollarValue")}
          />

          {showSavingsBalance === "yes" && selectedCoinType !== "VESTS" && (
            <Line
              yAxisId={primaryAxisId}
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
                setHiddenDataKeys(hiddenDataKeys.filter((key) => key !== dataKey));
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
