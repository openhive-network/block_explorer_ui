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
  const { t, dir } = useI18n();
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

          let convertedHPRaw = hiveChain.vestsToHp(
            vests,
            dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
            dynamicGlobalData.headBlockDetails.rawTotalVestingShares
          );

          let convertedValue: number;
          if (typeof convertedHPRaw === "number") convertedValue = convertedHPRaw;
          else if (convertedHPRaw && typeof convertedHPRaw === "object" && "amount" in convertedHPRaw)
            convertedValue = parseFloat(convertedHPRaw.amount);
          else if (typeof convertedHPRaw === "string") convertedValue = parseFloat(convertedHPRaw);
          else convertedValue = 0;

          const dollarValueFull =
            !isNaN(convertedValue) && !isNaN(hivePrice) ? (convertedValue * hivePrice) : 0;

          return { ...item, convertedHive: convertedValue, dollarValue: dollarValueFull };
        }

        if (type === "HIVE") {
          const dollarValue = !isNaN(item.balance) && !isNaN(hivePrice) ? item.balance * hivePrice : 0;
          return { ...item, dollarValue };
        }

        if (type === "HBD") {
          return { ...item, dollarValue: !isNaN(item.balance) ? item.balance : 0 };
        }

        return item;
      });
    },
    [dynamicGlobalData, hiveChain]
  );

  const dataMap = useMemo(() => {
    return {
      [selectedCoinType]: processedData(aggregatedAccountBalanceHistory, selectedCoinType) || [],
    };
  }, [processedData, aggregatedAccountBalanceHistory, selectedCoinType]);

  const handleCoinTypeChange = (coinType: string) => {
    setSelectedCoinType(coinType);
  };

  const displayData = useMemo(() => dataMap[selectedCoinType], [selectedCoinType, dataMap]);

  // ---------------- Tooltip ----------------
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    const { dir: tooltipDir } = useI18n();
    if (quickView || !active || !payload || payload.length === 0) return null;
    const isTooltipRTL = tooltipDir === "rtl";
    const selectedData = displayData?.find((item: any) => item.timestamp === label);
    if (!selectedData) return null;

    const actualBalance = selectedCoinType === "VESTS" && unit === "hp"
      ? selectedData?.convertedHive ?? 0
      : selectedData?.balance ?? 0;

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
            {` ${formatNumber(balanceChange, selectedCoinType === "VESTS" ? unit === "vests" : false)}`}
          </div>
          <div style={{ color: currentCoinColor }}>
            {`${t("common.balance")}: ${formatNumber(actualBalance, selectedCoinType === "VESTS" && unit === "vests")}`}
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
                )}`}
              </div>
            </div>
          )}
      </div>
    );
  };

  // ---------------- Coin toggle buttons ----------------
  const renderCoinButtons = () => (
    <div className="flex items-center justify-end mb-2 space-x-3 relative">
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
          {coinType === "VESTS" ? t("common.vestshp") : coinType}
        </button>
      ))}
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

  const primaryAxisId = isRTL ? "right" : "left";
  const secondaryAxisId = isRTL ? "left" : "right";

  return (
    <div className={cn("w-full max-w-[900px] relative", className)}>
      {renderCoinButtons()}
      <ResponsiveContainer width="110%" height="90%">
        <LineChart
          data={displayData}
          margin={{
            top: 20,
            right: 30,
            left: 10,
            bottom: isMobile ? 200 : 60,
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

          <YAxis
            yAxisId={secondaryAxisId}
            orientation={secondaryAxisId}
            style={{ fontSize: "10px" }}
            tickFormatter={(tick) => `$${formatNumber(tick, false, false)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId={primaryAxisId}
            type="monotone"
            dataKey={selectedCoinType === "VESTS" && unit === "hp" ? "convertedHive" : "balance"}
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            dot={false}
            name={selectedCoinType === "VESTS" && unit === "hp" ? "HP" : selectedCoinType === "VESTS" ? "VESTS" : selectedCoinType}
            hide={hiddenDataKeys.includes(selectedCoinType === "VESTS" && unit === "hp" ? "convertedHive" : "balance")}
          />
          <Line
            yAxisId={secondaryAxisId}
            type="monotone"
            dataKey="dollarValue"
            stroke={colorMap.DOLLAR}
            strokeWidth={2}
            dot={false}
            name="DOLLAR"
            hide={hiddenDataKeys.includes("dollarValue")}
          />
          {showSavingsBalance === "yes" && selectedCoinType !== "VESTS" && (
            <Line
              yAxisId={primaryAxisId}
              type="monotone"
              dataKey="savings_balance"
              stroke={colorMap.SAVINGS}
              strokeWidth={2}
              dot={false}
              name="Savings Balance"
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
              y={250}
              x={50}
              className="text-xs"
              onChange={handleBrushAreaChange}
            />
          )}
          <Legend
            wrapperStyle={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              paddingTop: isMobile ? 10 : 0,
              position: "absolute",
              bottom: isMobile ? (selectedCoinType === "VESTS" ? 80 : 60) : 20, // Keep original legend bottom values
              left: isMobile ? 8 : 20,
              // Removed dynamic right/width for legend; toggle will be positioned relative to it.
              // Adjusted width to allow space for the toggle on the right
              width: isMobile ? "calc(100% - 150px)" : "auto", // Leave space for toggle
            }}
            verticalAlign="bottom"
            onClick={(event) => {
              const dataKey = event.dataKey;
              const actualDataKey =
                (dataKey === selectedCoinType || dataKey === "HP" || dataKey === "VESTS") ?
                  (selectedCoinType === "VESTS" && unit === "hp" ? "convertedHive" : "balance") :
                  dataKey;

              const isHidden = hiddenDataKeys.includes(actualDataKey);
              if (isHidden)
                setHiddenDataKeys(hiddenDataKeys.filter((key) => key !== actualDataKey));
              else
                setHiddenDataKeys([...hiddenDataKeys, actualDataKey]);
            }}
          />

        </LineChart>
      </ResponsiveContainer>

      {/* Toggle next to legend (if VESTS is selected) */}
      {selectedCoinType === "VESTS" && (
        <div
          className="flex items-center space-x-2 absolute" // Added 'absolute' here
          style={{
            // Position it relative to the Legend's wrapper
            bottom: isMobile ? (selectedCoinType === "VESTS" ? 80 : 60) : 20, // Match legend's bottom
            right: isMobile ? 10 : 0, // Position it on the far right
            transform: 'translateY(0%)', // Ensure no vertical offset by default
          }}
        >
          <Label htmlFor="unit-toggle" className="text-sm font-medium select-none">
            {t("common.vests")}
          </Label>
          <Switch
            id="unit-toggle"
            checked={unit === "hp"}
            onCheckedChange={(checked) => setUnit(checked ? "hp" : "vests")}
          />
          <Label htmlFor="unit-toggle" className="text-sm font-medium select-none">
            {t("common.hp")}
          </Label>
        </div>
      )}
    </div>
  );
};

export default BalanceHistoryChart;