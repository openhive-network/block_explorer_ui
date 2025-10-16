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
import { convertVestsToHive, convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const { settings } = useSettings();
  const isRTL = dir === "rtl";

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 480);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);
  const [unit, setUnit] = useState<"vests" | "hp">(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  );

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);

  const availableCoins = ["HIVE", "VESTS", "HBD"];
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedData = useCallback(
    (data: any, type: string) => {
      if (!dynamicGlobalData || !hiveChain || !data) return [];

      return data.map((item: any) => {
        const hivePrice = parseFloat(item.hivePrice || "0");

        if (type === "VESTS") {
          const vests = item.balance?.toString() || "0";

          let convertedHPRaw =
            unit === "hp"
              ? hiveChain.vestsToHp(
                  vests,
                  dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
                  dynamicGlobalData.headBlockDetails.rawTotalVestingShares
                )
              : hiveChain.vestsToHp(
                  vests,
                  dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
                  dynamicGlobalData.headBlockDetails.rawTotalVestingShares
                );

          let convertedValue: number;
          if (typeof convertedHPRaw === "number") {
            convertedValue = convertedHPRaw;
          } else if (
            convertedHPRaw &&
            typeof convertedHPRaw === "object" &&
            "amount" in convertedHPRaw
          ) {
            convertedValue = parseFloat(convertedHPRaw.amount);
          } else if (typeof convertedHPRaw === "string") {
            convertedValue = parseFloat(convertedHPRaw);
          } else {
            convertedValue = 0;
          }

          const dollarValueFull =
            !isNaN(convertedValue) && !isNaN(hivePrice)
              ? (convertedValue * hivePrice) / 100
              : 0;

          return {
            ...item,
            convertedHive: convertedValue,
            dollarValue: dollarValueFull,
          };
        }

        if (type === "HIVE") {
          const dollarValue =
            !isNaN(item.balance) && !isNaN(hivePrice)
              ? item.balance * hivePrice
              : 0;

          return { ...item, dollarValue };
        }

        if (type === "HBD") {
          return {
            ...item,
            dollarValue: !isNaN(item.balance) ? item.balance : 0,
          };
        }

        return item;
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

  const displayData = useMemo(() => dataMap[selectedCoinType], [selectedCoinType]);

  // ---------------- Tooltip ----------------
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
    const dollarValue = selectedData?.dollarValue ?? 0;

    const isPositiveChange = balanceChange > 0;
    const isZeroChange = balanceChange === 0;
    const isSavingsPositiveChange = savingsBalanceChange > 0;
    const isSavingsZeroChange = savingsBalanceChange === 0;

    const currentCoinColor = colorMap[selectedCoinType];

    return (
      <div className="bg-theme dark:bg-theme p-2 rounded border border-explorer-light-gray">
        <p className="font-bold">{`${t("common.date")}: ${label}`}</p>
        <div className="mb-1" style={{ color: currentCoinColor }}>
          <div
            className={cn("flex items-center", isTooltipRTL && "flex-row-reverse")}
            style={{ color: currentCoinColor }}
          >
            {isPositiveChange ? (
              <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
            ) : isZeroChange ? (
              <Minus
                className={cn("bg-black p-[1.2px]", isTooltipRTL ? "ml-1" : "mr-1")}
                color={currentCoinColor}
                size={16}
              />
            ) : (
              <ArrowDown className="bg-red-400  p-[1.2px]" size={16} />
            )}
            {` ${formatNumber(
              balanceChange,
              selectedCoinType === "VESTS" ? unit === "vests" : false
            )}`}
          </div>
          <div style={{ color: currentCoinColor }}>
            {`${t("common.balance")}: ${formatNumber(
              actualBalance,
              selectedCoinType === "VESTS" ? unit === "vests" : false
            )}`}
          </div>
          {dollarValue ? (
            <div style={{ color: colorMap.DOLLAR }}>
              Dollar Value: ${formatNumber(dollarValue, false, selectedCoinType === "VESTS")}
            </div>
          ) : null}
        </div>

        {showSavingsBalance === "yes" &&
          savingsBalance !== undefined &&
          selectedCoinType !== "VESTS" && (
            <div className=" border-t border-gray-400 dark:border-gray-600 mt-1">
              <div
                className={cn("flex items-center", isTooltipRTL && "flex-row-reverse")}
                style={{ color: colorMap.SAVINGS }}
              >
                {isSavingsPositiveChange ? (
                  <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
                ) : isSavingsZeroChange ? (
                  <Minus
                    className={cn("bg-black p-[1.2px]", isTooltipRTL ? "ml-1" : "mr-1")}
                    color={colorMap.SAVINGS}
                    size={16}
                  />
                ) : (
                  <ArrowDown className="bg-red-400 p-[1.2px]" size={16} />
                )}
                {` ${formatNumber(
                  savingsBalanceChange,
                  selectedCoinType === "VESTS" ? unit === "vests" : false
                )}`}
              </div>
              <div style={{ color: colorMap.SAVINGS }}>
                {`${t("balanceHistoryChart.savingsBalance")}: ${formatNumber(
                  savingsBalance,
                  selectedCoinType === "VESTS" ? unit === "vests" : false
                )}`}
              </div>
            </div>
          )}
      </div>
    );
  };

  // ---------------- Coin toggle buttons ----------------
  const renderCoinButtons = () => (
    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mb-2">
      {/* Coin buttons container — right of toggle */}
      <div className="flex flex-wrap gap-2">
        {availableCoins.map((coinType) => (
          <button
            key={coinType}
            onClick={() => handleCoinTypeChange(coinType)}
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors",
              selectedCoinType === coinType
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-600 dark:text-white hover:dark:bg-gray-500"
            )}
          >
            {coinType === "VESTS" ? t("common.vestshp") : coinType}
          </button>
        ))}
      </div>
    </div>
  );

  // ---------------- Min/Max for Y-axis ----------------
  const getMinMax = (data: any[]): [number, number] => {
    if (!data || data.length === 0) return [0, 1];

    let allValues: number[] = [];

    if (selectedCoinType === "VESTS") {
      allValues = data.map((item) => item.convertedHive || 0);
      const dollarValues = data
        .map((item) => item.dollarValue)
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      allValues = allValues.concat(dollarValues);
    } else {
      allValues = data.map((item) => item.balance);
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

    return [Math.min(...allValues), Math.max(...allValues)];
  };

  const [fullDataMin, fullDataMax] = getMinMax(displayData);
  const [minValue, maxValue] = zoomedDomain || [fullDataMin, fullDataMax];

  const handleBrushAreaChange = (domain: { startIndex?: number; endIndex?: number }) => {
    if (!domain || domain.startIndex === undefined || domain.endIndex === undefined) {
      setZoomedDomain([fullDataMin, fullDataMax]);
      return;
    }
    const visibleData = (displayData || []).slice(domain.startIndex, domain.endIndex + 1);
    if (visibleData.length > 0) {
      const [min, max] = getMinMax(visibleData);
      setZoomedDomain([min, max]);
    }
  };

  if (!displayData || !displayData.length) return null;

  // Show secondary axis whenever there is dollarValue data
  const isDualAxis = displayData.some((d) => d.dollarValue !== undefined);
  const primaryAxisId = isRTL ? "right" : "left";
  const secondaryAxisId = isRTL ? "left" : "right";

  const leftMargin = isMobile ? 10 : selectedCoinType === "VESTS" ? 50 : 30;

  return (
    <div className={cn("w-full", className)}>
      {renderCoinButtons()}
      <ResponsiveContainer width="100%" height="100%" className="mb-5 items-start">
        <LineChart
          data={displayData}
          margin={{
            top: 20,
            right: isRTL ? (isMobile ? 0 : 10) : isMobile ? 0 : 20,
            left: isRTL ? (isMobile ? 0 : 20) : leftMargin,
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
                if (unit === "hp") return `${formatNumber(tick, false, false)}`;
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
            dataKey={selectedCoinType === "VESTS" && unit === "hp" ? "convertedHive" : "balance"}
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={selectedCoinType === "VESTS" && unit === "hp" ? "HP" : selectedCoinType}
            dot={false}
            hide={hiddenDataKeys.includes("balance")}
          />
          {displayData.some((d) => d.dollarValue !== undefined) && (
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
          )}
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

          {/* ---------- LEGEND with inline toggle ---------- */}
          <Legend
            align={isRTL ? "right" : "left"}
            verticalAlign="bottom"
            wrapperStyle={{
              display: "flex",
              justifyContent: isRTL ? "flex-end" : "flex-start",
              flexWrap: "wrap", // allow wrapping on small screens
              gap: "12px", // space between legend items
              paddingTop: "0px", // keep legend in same vertical position
            }}
            content={(props) => {
              const { payload } = props;
              return (
                <ul className="flex items-center gap-4 flex-wrap">
                  {payload?.map((entry, index) => {
                    const dataKey = (entry as any).dataKey;
                    const isHidden = hiddenDataKeys.includes(dataKey);
                    return (
                      <li
                        key={index}
                        className={`flex items-center cursor-pointer flex-shrink-0 ${isHidden ? "opacity-50" : ""}`}
                        onClick={() => {
                          if (isHidden)
                            setHiddenDataKeys(hiddenDataKeys.filter((key) => key !== dataKey));
                          else
                            setHiddenDataKeys([...hiddenDataKeys, dataKey]);
                        }}
                      >
                        <div
                          className="w-4 h-2 mr-2 rounded-full"
                          style={{ backgroundColor: (entry as any).color }}
                        />
                        <span className="text-sm">{(entry as any).value}</span>
                      </li>
                    );
                  })}

                  {selectedCoinType === "VESTS" && (
                    <li className="flex items-center gap-1 flex-shrink-0">
                      <Label className="text-xs font-medium select-none">{t("common.vests")}</Label>
                      <Switch
                        id="unit-toggle"
                        checked={unit === "hp"}
                        onCheckedChange={(checked) => setUnit(checked ? "hp" : "vests")}
                        className="w-10 h-5" // slightly bigger toggle
                      />
                      <Label className="text-xs font-medium select-none">{t("common.hp")}</Label>
                    </li>
                  )}
                </ul>
              );
            }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceHistoryChart;
