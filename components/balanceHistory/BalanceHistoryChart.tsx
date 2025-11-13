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
  const [zoomedDomain, setZoomedDomain] = useState<{
    main: [number, number];
    secondary: [number, number];
  } | null>(null);

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
        const balanceNum = parseFloat(item.balance || "0");

        if (type === "VESTS") {
         const vests = balanceNum;
          let hpValueRaw = hiveChain.vestsToHp(
            vests,
            dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
            dynamicGlobalData.headBlockDetails.rawTotalVestingShares
          );

          let hpValue: number;
          if (typeof hpValueRaw === "number") {
            hpValue = hpValueRaw;
          } else if (
            hpValueRaw &&
            typeof hpValueRaw === "object" &&
            "amount" in hpValueRaw
          ) {
            hpValue = parseFloat(hpValueRaw.amount);
          } else if (typeof hpValueRaw === "string") {
            hpValue = parseFloat(hpValueRaw);
          } else {
            hpValue = 0;
          }

          const dollarValueFull =
            !isNaN(hpValue) && !isNaN(hivePrice)
              ? (hpValue * hivePrice) 
              : 0;

        return {
            ...item,
            balance: vests, 
            convertedHive: hpValue,
            dollarValue: dollarValueFull,
          };
        } else if (type === "HIVE") {
          const dollarValue =
            !isNaN(balanceNum) && !isNaN(hivePrice)
              ? balanceNum * hivePrice
              : 0;

          return { ...item, balance: balanceNum, dollarValue };
        } else if (type === "HBD") {
          return {
            ...item,
            balance: balanceNum,
            dollarValue: balanceNum,
          };
        }

        return { ...item, balance: balanceNum };
      });
    },
    [dynamicGlobalData, hiveChain, unit] // Keep `unit` here for now, although not strictly needed by the new logic
  );

  const dataMap: Record<string, any[]> = useMemo(() => {
    return {
      [selectedCoinType]:
        processedData(aggregatedAccountBalanceHistory, selectedCoinType) || [],
    };
  }, [processedData, aggregatedAccountBalanceHistory, selectedCoinType]);

  const handleCoinTypeChange = (coinType: string) => {
    setSelectedCoinType(coinType);
  };

  const displayData = useMemo(
    () => dataMap[selectedCoinType],
    [dataMap, selectedCoinType]
  );

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
            {` ${formatNumber(
              balanceChange,
              selectedCoinType === "VESTS" ? unit === "vests" : false
            )}`}
          </div>
          <div style={{ color: currentCoinColor }}>{`${t(
            "common.balance"
          )}: ${formatNumber(
            actualBalance,
            selectedCoinType === "VESTS" ? unit === "vests" : false
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
                  selectedCoinType === "VESTS" ? unit === "vests" : false
                )}`}
              </div>
              <div style={{ color: colorMap.SAVINGS }}>
                {`${t("balanceHistoryChart.savingsBalance")}: ${formatNumber(
                  savingsBalance,
                  selectedCoinType === "VESTS" ? unit === "vests" : false
                )}`}</div>
            </div>
          )}
      </div>
    );
  };

  // ---------------- Coin toggle buttons ----------------
  const renderCoinButtons = () => (
    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-2 mb-4">
      {selectedCoinType === "VESTS" ? (
        <div className="flex items-center space-x-2 rounded-md self-end md:self-auto">
          <Label
            htmlFor="unit-toggle"
            className="text-sm font-medium select-none"
          >
            {t("common.vests")}
          </Label>
          <Switch
            id="unit-toggle"
            checked={unit === "hp"}
            onCheckedChange={(checked) => setUnit(checked ? "hp" : "vests")}
          />
          <Label
            htmlFor="unit-toggle"
            className="text-sm font-medium select-none"
          >
            {t("common.hp")}
          </Label>
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      <div className="flex items-center space-x-1 self-end md:self-auto">
        {availableCoins.map((coinType) => (
          <button
            key={coinType}
            onClick={() => handleCoinTypeChange(coinType)}
            className={cn(
              "px-2 py-1 text-sm rounded",
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
  const getMinMax = (
    data: any[]
  ): { main: [number, number]; secondary: [number, number] } => {
    if (!data || data.length === 0) return { main: [0, 1], secondary: [0, 1] };

    // Main axis scale is ALWAYS based on 'balance' (VESTS) to keep the line shape stable.
    let mainValues: number[] = data.map((item) => item.balance || 0);
    if (showSavingsBalance === "yes" && selectedCoinType !== "VESTS") {
      const savingsValues = data.map((item) => item.savings_balance || 0);
      mainValues = mainValues.concat(savingsValues);
    }

    // Secondary axis is always for dollars.
    let secondaryValues: number[] = data.map((item) => item.dollarValue || 0);

    const mainMax = Math.max(...mainValues, 0);
    const secondaryMax = Math.max(...secondaryValues, 0);

    return {
      main: [0, mainMax === 0 ? 1 : mainMax * 1.1],
      secondary: [0, secondaryMax === 0 ? 1 : secondaryMax * 1.1],
    };
  };

  const {
    main: [fullDataMainMin, fullDataMainMax],
    secondary: [fullDataDollarMin, fullDataDollarMax],
  } = getMinMax(displayData);
  const [minValue, maxValue] = zoomedDomain?.main || [
    fullDataMainMin,
    fullDataMainMax,
  ];
  const [minDollarValue, maxDollarValue] = zoomedDomain?.secondary || [
    fullDataDollarMin,
    fullDataDollarMax,
  ];

  // Update the brush handler
  const handleBrushAreaChange = (domain: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (
      !domain ||
      domain.startIndex === undefined ||
      domain.endIndex === undefined
    ) {
      setZoomedDomain(null);
      return;
    }

    const visibleData = (displayData || []).slice(
      domain.startIndex,
      domain.endIndex + 1
    );
    if (visibleData.length > 0) {
      const { main, secondary } = getMinMax(visibleData);
      setZoomedDomain({ main, secondary });
    }
  };

  if (!displayData || !displayData.length) return null;

  const isDualAxis = true;
  const primaryAxisId = isRTL ? "right" : "left";
  const secondaryAxisId = isRTL ? "left" : "right";

  const leftMargin = isMobile ? 10 : selectedCoinType === "VESTS" ? 50 : 30;

  return (
    <div className={cn("w-full", className)}>
       {quickView && (
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
            allowDecimals={true}
            tickFormatter={(tick) => {
              if (selectedCoinType === "VESTS") {
                if (unit === "hp") {
                  if (!hiveChain || !dynamicGlobalData) return "0"; 
                  const hpTick = hiveChain.vestsToHp(
                    tick,
                    dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
                    dynamicGlobalData.headBlockDetails.rawTotalVestingShares
                  );
                  const hpTickNum = typeof hpTick === 'object' && hpTick !== null && 'amount' in hpTick
                    ? parseFloat(hpTick.amount)
                    : parseFloat(hpTick as string);
                  if (isNaN(hpTickNum)) return "0";
                  if (hpTickNum >= 1000) return `${formatNumber(Number(hpTickNum / 1000), false, false)}K`;
                  return hpTickNum < 1 ? (hpTickNum < 0.01 ? hpTickNum.toFixed(4) : hpTickNum.toFixed(3)) : formatNumber(hpTickNum, false, false);
                }
                return tick < 1000 ? formatNumber(tick, true, false) : `${formatNumber(tick / 1000, true, false)}K`;              }
              return formatNumber(tick, false, false);
            }}
            scale="linear"
            minTickGap={20}
          />

          <YAxis
            yAxisId={secondaryAxisId}
            orientation={secondaryAxisId}
            domain={[minDollarValue, maxDollarValue]}
            style={{ fontSize: "10px" }}
            tickFormatter={(tick) =>
              `$${formatNumber(tick, false, false)}`
            }
            tickCount={6}
            allowDecimals={true}
            scale="linear"
            minTickGap={20}
          />

          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId={primaryAxisId}
            type="monotone"
            dataKey="balance"
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={
              selectedCoinType === "VESTS" && unit === "hp"
                ? "HP"
                : selectedCoinType
            }
            dot={false}
            hide={hiddenDataKeys.includes("balance")}
            connectNulls={true}
            animationDuration={300}
            stroke-linejoin="round"
            stroke-linecap="round"
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
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: isMobile ? "20px" : "0px" }}
            onClick={(event) => {
              const dataKey = event.dataKey as string;
              const isHidden = hiddenDataKeys.includes(dataKey);
              if (isHidden)
                setHiddenDataKeys(
                  hiddenDataKeys.filter((key) => key !== dataKey)
                );
              else setHiddenDataKeys([...hiddenDataKeys, dataKey]);
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceHistoryChart;