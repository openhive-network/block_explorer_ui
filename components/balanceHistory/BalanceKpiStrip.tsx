import React, { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { config } from "@/Config";
import { useI18n } from "@/i18n/i18n";
import { compactFormat, fullFormat } from "@/utils/BalanceHistoryUtils";

interface BalanceKpiStripProps {
  data: {
    timestamp: string;
    balance: number;
    hivePrice: string;
  }[];
  coinType: string;
  unit: "vests" | "hp";
}

const BalanceKpiStrip: React.FC<BalanceKpiStripProps> = ({
  data,
  coinType,
  unit,
}) => {
  const { t } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

  const kpis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const first = data[0];
    const last = data[data.length - 1];
    const isHpMode = coinType === "VESTS" && unit === "hp";
    const isVests = coinType === "VESTS";
    const unitLabel = isHpMode ? "HP" : coinType;

    const lastHivePrice = parseFloat(last.hivePrice || "0");

    let currentNumeric: number;
    let changeNumeric: number;
    let displayDecimals: number;
    let dollarValue: number;

    if (isVests && hiveChain && dynamicGlobalData) {
      const fund = dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive;
      const shares = dynamicGlobalData.headBlockDetails.rawTotalVestingShares;

      if (isHpMode) {
        const lastHpStr =
          convertVestsToHP(hiveChain, String(last.balance), fund, shares) ??
          "0 HP";
        const firstHpStr =
          convertVestsToHP(hiveChain, String(first.balance), fund, shares) ??
          "0 HP";
        currentNumeric = grabNumericValue(lastHpStr);
        const firstHp = grabNumericValue(firstHpStr);
        changeNumeric = currentNumeric - firstHp;
        displayDecimals = config.precisions.hivePower;
        dollarValue = currentNumeric * lastHivePrice;
      } else {
        currentNumeric =
          last.balance / Math.pow(10, config.precisions.vests);
        const firstVests =
          first.balance / Math.pow(10, config.precisions.vests);
        changeNumeric = currentNumeric - firstVests;
        displayDecimals = config.precisions.vests;
        const lastHpStr =
          convertVestsToHP(hiveChain, String(last.balance), fund, shares) ??
          "0 HP";
        dollarValue = grabNumericValue(lastHpStr) * lastHivePrice;
      }
    } else {
      currentNumeric =
        last.balance / Math.pow(10, config.precisions.hivePower);
      const firstValue =
        first.balance / Math.pow(10, config.precisions.hivePower);
      changeNumeric = currentNumeric - firstValue;
      displayDecimals = config.precisions.hivePower;
      dollarValue =
        coinType === "HIVE" ? currentNumeric * lastHivePrice : currentNumeric;
    }

    const firstNumeric = currentNumeric - changeNumeric;
    const changePercent =
      firstNumeric !== 0 ? (changeNumeric / firstNumeric) * 100 : 0;
    const changeSign: 1 | -1 | 0 =
      changeNumeric > 0 ? 1 : changeNumeric < 0 ? -1 : 0;

    return {
      currentDisplay: `${compactFormat(currentNumeric)} ${unitLabel}`,
      currentTitle: `${fullFormat(currentNumeric, displayDecimals)} ${unitLabel}`,
      changeDisplay: `${changeNumeric >= 0 ? "+" : ""}${compactFormat(
        changeNumeric
      )} ${unitLabel}`,
      changeTitle: `${changeNumeric >= 0 ? "+" : ""}${fullFormat(
        changeNumeric,
        displayDecimals
      )} ${unitLabel}`,
      changePercent,
      changeSign,
      dollarValue,
      unitLabel,
    };
  }, [data, coinType, unit, hiveChain, dynamicGlobalData]);

  if (!kpis) return null;

  const TrendIcon =
    kpis.changeSign > 0 ? ArrowUp : kpis.changeSign < 0 ? ArrowDown : Minus;
  const trendColor =
    kpis.changeSign > 0
      ? "#22c55e"
      : kpis.changeSign < 0
        ? "#ef4444"
        : "#6b7280";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 pt-2 mb-4">
      <KpiCard
        label={t("balanceHistoryKpi.currentBalance")}
        value={kpis.currentDisplay}
        title={kpis.currentTitle}
      />
      <KpiCard
        label={t("balanceHistoryKpi.changeOverRange")}
        title={kpis.changeTitle}
        value={
          <span className="inline-flex items-center gap-1">
            <TrendIcon size={16} color={trendColor} />
            <span>{kpis.changeDisplay}</span>
            <span className="text-xs text-gray-500">
              ({kpis.changePercent >= 0 ? "+" : ""}
              {kpis.changePercent.toFixed(2)}%)
            </span>
          </span>
        }
      />
      <KpiCard
        label={t("balanceHistoryKpi.dollarValue")}
        value={`$${compactFormat(kpis.dollarValue)}`}
        title={`$${fullFormat(kpis.dollarValue, 2)}`}
      />
    </div>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: React.ReactNode;
  title?: string;
}> = ({ label, value, title }) => (
  <div
    title={title}
    className={cn(
      "rounded-md border border-gray-200 dark:border-gray-700",
      "bg-theme px-4 py-3 shadow-sm"
    )}
  >
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-base font-semibold">{value}</div>
  </div>
);

export default BalanceKpiStrip;
