import Explorer from "@/types/Explorer";
import { grabNumericValue, asCsvString } from "@/utils/StringUtils";
import { ASSET_CONFIG, cardNameMapKeys } from "./AccountBalanceCard";

// Define the types for the data we expect to receive
type ChartSegment = {
  label: string;
  displayValue: string;
  percent: number;
};

type FinancialSummary = {
  formatted: {
    totalValue: string;
    effectiveHp: string;
    totalHive: string;
    totalHbd: string;
    totalHiveUsd: string;
    totalHbdUsd: string;
    dollars: Record<keyof Explorer.AccountDetailsDollars, string>;
    vests: Record<keyof Explorer.AccountDetailsVests, string>;
  };
};

type FinancialKey = keyof Explorer.FormattedAccountDetails &
  keyof Explorer.AccountDetailsDollars;

export const prepareAccountBalanceReport = (
  userDetails: Explorer.FormattedAccountDetails,
  financialSummary: FinancialSummary,
  chartSegments: ChartSegment[],
  hbdInterestApr: string | null,
  t: (key: string) => string
) => {
  if (!userDetails) return [];

  const headers = {
    metric: t("accountBalanceCardExport.metric"),
    value: t("accountBalanceCardExport.value"),
    valueUSD: t("accountBalanceCardExport.valueUSD"),
    percentage: t("accountBalanceCardExport.percentage"),
    vestsValue: t("accountBalanceCardExport.vestsValue"),
    notes: t("accountBalanceCardExport.notes"),
  };

  const reportData: { [key: string]: string | number }[] = [];
  const baseRow = {
    [headers.metric]: "",
    [headers.value]: "",
    [headers.valueUSD]: "",
    [headers.percentage]: "",
    [headers.vestsValue]: "",
    [headers.notes]: "",
  };

  // --- Report Header ---
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.reportFor"),
    [headers.value]: userDetails.name,
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.totalValueUSD"),
    [headers.value]: asCsvString(financialSummary.formatted.totalValue),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.exportDate"),
    [headers.value]: new Date().toLocaleString(),
  });
  reportData.push({});

  // --- Financial Summary Section (from Chart) ---
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.financialSummaryTitle"),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.category"),
    [headers.valueUSD]: t("accountBalanceCardExport.valueUSD"),
    [headers.percentage]: t("accountBalanceCardExport.percentage"),
  });

  chartSegments.forEach((segment) => {
    reportData.push({
      ...baseRow,
      [headers.metric]: segment.label,
      [headers.valueUSD]: asCsvString(segment.displayValue),
      [headers.percentage]: `${segment.percent.toFixed(2)}%`,
    });
  });
  reportData.push({});

  // --- Detailed Breakdown Section ---
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.detailedBreakdownTitle"),
  });
  reportData.push({});

  // --- Hive Power (HP) Section ---
  const hpConfig = ASSET_CONFIG.find((a) => a.key === "hp")!;
  reportData.push({
    ...baseRow,
    [headers.metric]: `--- ${t(hpConfig.name)} ---`,
    [headers.notes]: t(hpConfig.description),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.asset"),
    [headers.value]: "HP",
    [headers.vestsValue]: "VESTS",
    [headers.valueUSD]: t("accountBalanceCardExport.valueUSD"),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCard.effectiveHp"),
    [headers.value]: financialSummary.formatted.effectiveHp,
  });

  const getCountSuffix = (key: string) => {
    let count = null;
    if (key === "open_orders_hive_amount")
      count = userDetails.open_orders_hive_count;
    if (key === "open_orders_hbd_amount")
      count = userDetails.open_orders_hbd_count;
    if (key === "conversion_pending_amount_hive")
      count = userDetails.conversion_pending_count_hive;
    if (key === "conversion_pending_amount_hbd")
      count = userDetails.conversion_pending_count_hbd;
    if (key.includes("escrow_pending_amount"))
      count = userDetails.escrow_pending_count;

    return count !== null && count !== undefined && Number(count) > 0
      ? ` (${count})`
      : "";
  };

  const addHpRow = (metricKey: FinancialKey, sign: "" | "+" | "-" = "") => {
    const formattedVests = financialSummary.formatted.vests[metricKey as keyof typeof userDetails.vests] || "";

    const notes = metricKey.startsWith("reward_") ? t("accountBalanceCardExport.unclaimedRewardNote") : "";

    reportData.push({
      ...baseRow,
      [headers.metric]: t(cardNameMapKeys.get(metricKey)!),
      [headers.value]: `${sign}${userDetails[metricKey]}`,
      [headers.vestsValue]: formattedVests,
      [headers.valueUSD]: asCsvString(financialSummary.formatted.dollars[metricKey]),
      [headers.notes]: notes,
    });
  };
  addHpRow("vesting_shares");
  addHpRow("received_vesting_shares", "+");
  addHpRow("delegated_vesting_shares", "-");
  addHpRow("reward_vesting_balance");
  if (grabNumericValue(userDetails.vesting_withdraw_rate) > 0)
    addHpRow("vesting_withdraw_rate");
  reportData.push({});

  // --- HIVE Section ---
  const hiveConfig = ASSET_CONFIG.find((a) => a.key === "hive")!;
  reportData.push({
    ...baseRow,
    [headers.metric]: `--- ${t(hiveConfig.name)} ---`,
    [headers.notes]: t(hiveConfig.description),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.asset"),
    [headers.value]: "HIVE",
    [headers.valueUSD]: t("accountBalanceCardExport.valueUSD"),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.total"),
    [headers.value]: financialSummary.formatted.totalHive,
  });
  hiveConfig.fields.forEach((metricKey) => {
    const numericValue = grabNumericValue(String(userDetails[metricKey]));
    // Skip pending fields with 0 values to match UI behavior
    if (
      (metricKey.includes("savings_pending") ||
        metricKey.includes("conversion_pending") ||
        metricKey.includes("open_orders") ||
        metricKey.includes("escrow")) &&
      numericValue === 0
    ) {
      return;
    }

    const notes = metricKey.startsWith("reward_")
      ? t("accountBalanceCardExport.unclaimedRewardNote")
      : "";
    const displayValue = `${userDetails[metricKey]}${getCountSuffix(metricKey)}`;

    reportData.push({
      ...baseRow,
      [headers.metric]: t(cardNameMapKeys.get(metricKey)!),
      [headers.value]: displayValue,
      [headers.valueUSD]: asCsvString(
        financialSummary.formatted.dollars[metricKey as FinancialKey],
      ),
      [headers.notes]: notes,
    });
  });
  reportData.push({});

  // --- HBD Section ---
  const hbdConfig = ASSET_CONFIG.find((a) => a.key === "hbd")!;
  reportData.push({
    ...baseRow,
    [headers.metric]: `--- ${t(hbdConfig.name)} ---`,
    [headers.notes]: t(hbdConfig.description),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.asset"),
    [headers.value]: "HBD",
    [headers.valueUSD]: t("accountBalanceCardExport.valueUSD"),
    [headers.notes]: t("accountBalanceCardExport.notes"),
  });
  reportData.push({
    ...baseRow,
    [headers.metric]: t("accountBalanceCardExport.total"),
    [headers.value]: financialSummary.formatted.totalHbd,
  });
  hbdConfig.fields.forEach((metricKey) => {
    const numericValue = grabNumericValue(String(userDetails[metricKey]));
    // Skip pending fields with 0 values to match UI behavior
    if (
      (metricKey.includes("savings_pending") ||
        metricKey.includes("conversion_pending") ||
        metricKey.includes("open_orders") ||
        metricKey.includes("escrow")) &&
      numericValue=== 0
    ) {
      return;
    }
    let notes = "";
    if (metricKey.startsWith("reward_")) {
      notes = t("accountBalanceCardExport.unclaimedRewardNote");
    }
    if (metricKey === "hbd_saving_balance" && hbdInterestApr) {
      notes = `${hbdInterestApr} APR (${t("accountBalanceCard.hbdAprTooltip")})`;
    }

    const displayValue = `${userDetails[metricKey]}${getCountSuffix(metricKey)}`;

    reportData.push({
      ...baseRow,
      [headers.metric]: t(cardNameMapKeys.get(metricKey)!),
      [headers.value]: displayValue,
      [headers.valueUSD]: asCsvString(
        financialSummary.formatted.dollars[metricKey as FinancialKey],
      ),
      [headers.notes]: notes,
    });
  });

  return reportData;
};