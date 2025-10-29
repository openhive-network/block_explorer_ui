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
import { Label } from "@/components/ui/label";
import { Payload } from "recharts/types/component/DefaultLegendContent"; // Import Payload type

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
  const isRTL = dir === "rtl";

  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 480 : false
  );
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);
  const [vestsHpUnit, setVestsHpUnit] = useState<"vests" | "hp">("hp");

  const availableCoins = ["HIVE", "VESTS", "HBD"];
  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

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
          const convertedHP = hiveChain.vestsToHp(
            vests,
            dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
            dynamicGlobalData.headBlockDetails.rawTotalVestingShares
          );

          let convertedHPNumeric: number;
          if (typeof convertedHP === "number") {
            convertedHPNumeric = convertedHP;
          } else if (
            convertedHP &&
            typeof convertedHP === "object" &&
            "amount" in convertedHP
          ) {
            convertedHPNumeric = parseFloat(String(convertedHP.amount));
          } else if (typeof convertedHP === "string") {
            convertedHPNumeric = parseFloat(convertedHP);
          } else {
            convertedHPNumeric = 0;
          }

          const dollarValueFull =
            !isNaN(convertedHPNumeric) && !isNaN(hivePrice)
              ? convertedHPNumeric * hivePrice
              : 0;

          return {
            ...item,
            convertedHive: convertedHPNumeric,
            dollarValue: dollarValueFull,
          };
        }

        if (type === "HIVE") {
          const dollarValue =
            !isNaN(item.balance) && !isNaN(hivePrice)
              ? item.balance * hivePrice
              : 0;

          return {
            ...item,
            dollarValue,
          };
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
    [dynamicGlobalData, hiveChain]
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

  const displayData = useMemo(() => {
    return dataMap[selectedCoinType];
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoinType, vestsHpUnit]);

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

    const actualBalance =
      selectedCoinType === "VESTS" && vestsHpUnit === "hp"
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
            className={cn(
              "flex items-center",
              isTooltipRTL && "flex-row-reverse"
            )}
            style={{ color: currentCoinColor }}
          >
            {isPositiveChange ? (
              <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
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
              <ArrowDown className="bg-red-400  p-[1.2px]" size={16} />
            )}
            {` ${formatNumber(
              balanceChange,
              selectedCoinType === "VESTS" && vestsHpUnit === "vests"
            )}`}
          </div>
          <div style={{ color: currentCoinColor }}>{`${t(
            "common.balance"
          )}: ${formatNumber(
            actualBalance,
            selectedCoinType === "VESTS" && vestsHpUnit === "vests"
          )}`}</div>

          {dollarValue || dollarValue === 0 ? (
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
                  <ArrowUp className="bg-green-400 p-[1.2px]" size={16} />
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
                  <ArrowDown className="bg-red-400 p-[1.2px]" size={16} />
                )}
                {` ${formatNumber(
                  savingsBalanceChange,
                  selectedCoinType === "VESTS" && vestsHpUnit === "vests"
                )}`}
              </div>
              <div style={{ color: colorMap.SAVINGS }}>
                {`${t("balanceHistoryChart.savingsBalance")}: ${formatNumber(
                  savingsBalance,
                  selectedCoinType === "VESTS" && vestsHpUnit === "vests"
                )}`}
              </div>
            </div>
          )}
      </div>
    );
  };

  const renderCoinButtons = () => {
    return (
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
  };

  const getMinMax = (
    data: {
      balance: number;
      savings_balance?: number;
      dollarValue?: number;
      convertedHive?: number;
    }[]
  ): [number, number] => {
    if (!data || data.length === 0) {
      return [0, 1];
    }

    let allValues: number[] = [];

    if (selectedCoinType === "VESTS") {
      allValues = data.map((item) =>
        vestsHpUnit === "hp" ? item.convertedHive || 0 : item.balance
      );

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

  const secondaryAxisDomain =
    selectedCoinType === "HBD" ? [minValue, maxValue] : undefined;

  const chartBottomMargin = useMemo(() => {
    let margin = 60;
    margin += 50;
    if (isMobile) {
      margin += 30;
    }
    return margin;
  }, [isMobile]);

  // Construct the payload for the Legend component
  const legendPayload: Payload[] = useMemo(() => {
    const payloadItems: Payload[] = [
      {
        value:
          selectedCoinType === "VESTS" && vestsHpUnit === "hp"
            ? "HP"
            : selectedCoinType,
        id:
          selectedCoinType === "VESTS" && vestsHpUnit === "hp"
            ? "convertedHive"
            : "balance", // Use the actual dataKey as the id for toggling
        type: "line", // Shape for the legend item
        color: colorMap[selectedCoinType],
      },
      {
        value: "DOLLAR",
        id: "dollarValue", // Use the actual dataKey as the id for toggling
        type: "line",
        color: colorMap.DOLLAR,
      },
    ];

    if (showSavingsBalance === "yes" && selectedCoinType !== "VESTS") {
      payloadItems.push({
        value: t("balanceHistoryChart.savingsBalance"),
        id: "savings_balance", // Use the actual dataKey as the id for toggling
        type: "line",
        color: colorMap.SAVINGS,
      });
    }

    // Filter based on hiddenDataKeys using the 'id' of the payload
    return payloadItems.filter((item) => !hiddenDataKeys.includes(item.id as string));
  }, [selectedCoinType, vestsHpUnit, showSavingsBalance, hiddenDataKeys, t]);

  return (
    <div className={cn("w-full relative", className)}>
      {quickView && (
        <div
          className={cn("flex mb-4", isRTL ? "justify-start" : "justify-end")}
        >
          {renderCoinButtons()}
        </div>
      )}

      <ResponsiveContainer
        width={quickView ? "110%" : "100%"}
        height="100%"
        className="items-start"
      >
        <LineChart
          data={displayData || []}
          margin={{
            top: 20,
            right: isMobile ? 75 : 52,
            left: isMobile ? 20 : 12,
            bottom: chartBottomMargin,
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
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId={primaryAxisId}
            domain={[minValue, maxValue]}
            orientation={primaryAxisId}
            style={{ fontSize: "10px" }}
            tickCount={6}
            tickFormatter={(tick) => {
              if (selectedCoinType === "VESTS") {
                if (vestsHpUnit === "hp") {
                  return formatNumber(tick, false, false);
                }
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
            {...(secondaryAxisDomain ? { domain: secondaryAxisDomain } : {})}
            tickFormatter={(tick) => `$${formatNumber(tick, false, false)}`}
          />

          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId={primaryAxisId}
            type="monotone"
            dataKey={
              selectedCoinType === "VESTS" && vestsHpUnit === "hp"
                ? "convertedHive"
                : "balance"
            }
            stroke={colorMap[selectedCoinType]}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name={
              selectedCoinType === "VESTS" && vestsHpUnit === "hp"
                ? "HP"
                : selectedCoinType
            }
            dot={false}
            hide={hiddenDataKeys.includes(
              (selectedCoinType === "VESTS" && vestsHpUnit === "hp")
                ? "convertedHive"
                : "balance"
            )}
          />

          <Line
            yAxisId={secondaryAxisId}
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
              y={350}
              x={50}
              className="text-xs"
              onChange={handleBrushAreaChange}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Container for Legend and VESTS/HP toggle */}
      <div
        className={cn(
          "absolute w-full flex items-center justify-between",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}
        style={{
          bottom: quickView ? (isMobile ? 0 : 0) : 120,
          left: 0,
          padding: "0 20px",
        }}
      >
        <Legend
          payload={legendPayload}
          wrapperStyle={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            order: isRTL ? 2 : 1,
            maxWidth: selectedCoinType === "VESTS" ? "calc(100% - 150px)" : "100%",
          }}
          onClick={(event) => {
            // The event.payload.id contains the dataKey we manually assigned
            const clickedId = event.payload?.id;
            if (clickedId) {
              const isHidden = hiddenDataKeys.includes(clickedId as string);
              if (isHidden) {
                setHiddenDataKeys(
                  hiddenDataKeys.filter((key) => key !== clickedId)
                );
              } else {
                setHiddenDataKeys([...hiddenDataKeys, clickedId]);
              }
            }
          }}
        />

        {selectedCoinType === "VESTS" && (
          <div
            className="flex items-center space-x-2"
            style={{ order: isRTL ? 1 : 2 }}
          >
            <Label
              htmlFor="vests-hp-toggle"
              className="text-sm font-medium select-none"
            >
              {t("common.vests")}
            </Label>
            <Switch
              id="vests-hp-toggle"
              checked={vestsHpUnit === "hp"}
              onCheckedChange={(checked) =>
                setVestsHpUnit(checked ? "hp" : "vests")
              }
            />
            <Label
              htmlFor="vests-hp-toggle"
              className="text-sm font-medium select-none"
            >
              {t("common.hp")}
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceHistoryChart;