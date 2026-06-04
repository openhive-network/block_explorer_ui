import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import TimeAgo from "timeago-react";
import { Clock, Loader2, TrendingDown, TrendingUp } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import CopyButton from "@/components/ui/CopyButton";
import CustomPagination from "@/components/CustomPagination";
import DataCountMessage from "@/components/DataCountMessage";
import DataExport from "@/components/DataExport";
import NoResult from "@/components/NoResult";
import { getOperationColor } from "@/components/OperationsTable";

import { config } from "@/Config";
import { useI18n } from "@/i18n/i18n";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useAccountVestingHistory from "@/hooks/api/balanceHistory/useAccountVestingHistory";
import Hive from "@/types/Hive";
import { grabNumericValue } from "@/utils/StringUtils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { convertVestsToHP, computeVestingRatios } from "@/utils/Calculations";
import { cn } from "@/lib/utils";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
} from "@/components/home/hpMomentumUtils";

// Hive op type IDs that produce the three vesting events. Surfaced in the
// Operation column so the user sees the underlying blockchain op type name.
const VESTING_OP_TYPE_NAME: Record<number, string> = {
  3: "transfer_to_vesting_operation",
  4: "withdraw_vesting_operation",
  56: "fill_vesting_withdraw_operation",
};

interface PowerActivityTableProps {
  accountName: string;
  filter: Hive.VestingHistoryFilter;
  onFilterChange: (filter: Hive.VestingHistoryFilter) => void;
  page: number | undefined;
  onPageChange: (page: number) => void;
  fromBlock?: Date | number | undefined;
  toBlock?: Date | number | undefined;
}

// Labels match the AccountHpActivityCard breakdown so users see the same
// vocabulary everywhere: Powered Up / Scheduled Down / Powered Down.
const eventTypeLabelKey: Record<
  Exclude<Hive.VestingHistoryFilter, "all">,
  string
> = {
  power_up: "accountHpActivityCard.poweredUp",
  power_down_init: "accountHpActivityCard.scheduledDown",
  power_down_fill: "accountHpActivityCard.poweredDown",
};

const EventIcon: React.FC<{ type: Hive.VestingHistoryEvent["direction"] }> = ({
  type,
}) => {
  if (type === "power_up") {
    return <TrendingUp size={14} color={VESTING_COLORS.up} />;
  }
  if (type === "power_down_init") {
    return <Clock size={14} color={VESTING_COLORS.downInit} />;
  }
  return <TrendingDown size={14} color={VESTING_COLORS.downFill} />;
};

const PowerActivityTable: React.FC<PowerActivityTableProps> = ({
  accountName,
  filter,
  onFilterChange: _onFilterChange,
  page,
  onPageChange,
  fromBlock,
  toBlock,
}) => {
  const { t, locale: appLocale } = useI18n();
  const router = useRouter();
  const { settings } = useSettings();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

  const [unit, setUnit] = useState<VestingDisplayUnit>(
    settings.displayVestHpMode === "vests" ? "vests" : "hp"
  );

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "vests" ? "vests" : "hp");
  }, [settings.displayVestHpMode]);

  const {
    accountVestingHistory,
    isAccountVestingHistoryLoading,
    isAccountVestingHistoryFetching,
    isAccountVestingHistoryError,
  } = useAccountVestingHistory(
    accountName,
    filter,
    page,
    config.standardPaginationSize,
    "desc",
    fromBlock,
    toBlock
  );

  const vestsToHp = (vests: Hive.Supply | null | undefined): number | null => {
    if (!vests || !vests.amount || vests.amount === "0") return null;
    if (!hiveChain || !dynamicGlobalData) return null;
    const formatted = convertVestsToHP(
      hiveChain,
      vests,
      dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
      dynamicGlobalData.headBlockDetails.rawTotalVestingShares
    );
    return formatted ? grabNumericValue(formatted) : null;
  };

  const formatHive = (hive: Hive.Supply | null | undefined): number | null => {
    if (!hive || !hive.amount || hive.amount === "0") return null;
    return parseFloat(hive.amount) / Math.pow(10, hive.precision);
  };

  const formatVests = (
    vests: Hive.Supply | null | undefined
  ): number | null => {
    if (!vests || !vests.amount || vests.amount === "0") return null;
    return parseFloat(vests.amount) / Math.pow(10, vests.precision);
  };

  // power_up ops carry only HIVE; convert HIVE -> VESTS via the global rate.
  const vestsPerHive = useMemo(() => {
    const r = computeVestingRatios(hiveChain, dynamicGlobalData);
    return r ? r.vestsPerHive : null;
  }, [hiveChain, dynamicGlobalData]);

  const hivePrice = useMemo(() => {
    if (!hiveChain || !dynamicGlobalData?.headBlockDetails) return 0;
    const { rawFeedPrice, rawQuote } = dynamicGlobalData.headBlockDetails;
    if (!rawFeedPrice || !rawQuote) return 0;
    const base = grabNumericValue(hiveChain.formatter.format(rawFeedPrice));
    const quote = grabNumericValue(hiveChain.formatter.format(rawQuote));
    if (!quote) return 0;
    return base / quote;
  }, [hiveChain, dynamicGlobalData]);

  const computeUsd = (op: Hive.VestingHistoryEvent): number | null => {
    if (!hivePrice) return null;
    if (op.direction === "power_down_init") {
      const hp = vestsToHp(op.amount_vests);
      return hp !== null ? hp * hivePrice : null;
    }
    const hive = formatHive(op.amount_hive);
    return hive !== null ? hive * hivePrice : null;
  };

  const totalOperations = accountVestingHistory?.total_operations ?? 0;
  const totalPages = accountVestingHistory?.total_pages ?? 0;
  const operations = useMemo(
    () => accountVestingHistory?.operations_result ?? [],
    [accountVestingHistory]
  );

  const isLoading =
    isAccountVestingHistoryLoading || isAccountVestingHistoryFetching;

  const updatePageInUrl = (newPage: number) => {
    onPageChange(newPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage.toString() },
    });
  };

  // Click anywhere on the row to drill into the block detail page with the
  // specific operation highlighted (same UX as the Operations tab).
  const handleRowClick = (op: Hive.VestingHistoryEvent) => {
    if (!op.block_num) return;
    const params = new URLSearchParams();
    if (op.trx_id) params.append("trxId", op.trx_id);
    if (op.operation_id !== undefined && op.operation_id !== null) {
      params.append("opId", String(op.operation_id));
    }
    const qs = params.toString();
    router.push(`/block/${op.block_num}${qs ? `?${qs}` : ""}`);
  };

  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  const formatAmountCell = (
    op: Hive.VestingHistoryEvent
  ): { value: number | null; unitSuffix: string } => {
    // power_up ships only as HIVE (amount_vests is 0); derive from amount_hive:
    // 1 HIVE powered up == 1 HP added, and HIVE -> VESTS via the current rate.
    if (op.direction === "power_up") {
      const hive = formatHive(op.amount_hive);
      if (hive === null) return { value: null, unitSuffix: unitLabel };
      if (unit === "hp") return { value: hive, unitSuffix: "HP" };
      return {
        value: vestsPerHive !== null ? hive * vestsPerHive : null,
        unitSuffix: "VESTS",
      };
    }
    if (unit === "hp") {
      return { value: vestsToHp(op.amount_vests), unitSuffix: "HP" };
    }
    return { value: formatVests(op.amount_vests), unitSuffix: "VESTS" };
  };

  const opTypeNameFor = (op: Hive.VestingHistoryEvent) =>
    op.op_type_id
      ? getOperationTypeForDisplay(VESTING_OP_TYPE_NAME[op.op_type_id] ?? "")
      : "";

  const exportData = useMemo(() => {
    return operations.map((op) => {
      const amount = formatAmountCell(op);
      const hive = formatHive(op.amount_hive);
      const usd = computeUsd(op);
      const eventLabel = t(eventTypeLabelKey[op.direction]);
      const opName = opTypeNameFor(op);
      return {
        [t("operationsTable.block")]: op.block_num,
        [t("operationsTable.date")]: formatAndDelocalizeTime(op.timestamp),
        [t("operationsTable.operation")]: opName
          ? `${eventLabel} · ${opName}`
          : eventLabel,
        [t("powerActivityTable.amountHive")]:
          hive !== null
            ? `${hive.toLocaleString(undefined, { maximumFractionDigits: 3 })} HIVE`
            : "—",
        [unitLabel]:
          amount.value !== null
            ? `${amount.value.toLocaleString(undefined, {
                maximumFractionDigits: unit === "hp" ? 3 : 0,
              })} ${amount.unitSuffix}`
            : "—",
        [t("balanceHistoryTable.dollarValue")]:
          usd !== null
            ? `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : "—",
        [t("commentPermlinkResultTable.operationId")]: String(
          op.operation_id ?? ""
        ),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations, unit, hivePrice, t]);

  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  return (
    <div>
      {totalPages > 1 && (
        <div className="sticky z-20 top-[7rem] md:top-[7.5rem] scroll-mt-[7.5rem]">
          <CustomPagination
            currentPage={page ?? 1}
            onPageChange={updatePageInUrl}
            pageSize={config.standardPaginationSize}
            totalCount={totalOperations}
            className="rounded"
            isMirrored={false}
          />
        </div>
      )}

      <div
        className={cn("table-toolbar", {
          "justify-between": !!totalOperations,
        })}
      >
        <DataCountMessage
          count={totalOperations}
          dataType="common.operations"
        />
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden text-xs"
            role="group"
            aria-label="HP or VESTS"
          >
            {unitOptions.map((opt, idx) => {
              const isActive = unit === opt.key;
              const isFirst = idx === 0;
              const isLast = idx === unitOptions.length - 1;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setUnit(opt.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "font-medium transition-colors px-2.5 py-0.5",
                    !isLast && "border-r border-navbar-border",
                    isFirst && "rounded-l-full",
                    isLast && "rounded-r-full",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <DataExport
            data={exportData}
            filename={`${accountName}_${t(
              "accountOperationViewTabs.powerActivity"
            ).toLowerCase()}.csv`}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin h-10 w-10" />
        </div>
      )}

      {!isLoading && isAccountVestingHistoryError && (
        <p className="text-center text-red-500 text-sm py-4">
          {t("common.errorLoadingData")}
        </p>
      )}

      {!isLoading &&
        !isAccountVestingHistoryError &&
        operations.length === 0 && <NoResult />}

      {!isLoading && !isAccountVestingHistoryError && operations.length > 0 && (
        <Table
          className="rounded-[6px] overflow-hidden max-w-full text-sm"
          enableMobileScrollArrows
          enableCompactToggle
        >
          <TableHeader>
            <TableRow rowVariant="header">
              <TableHead stickyLeft>{t("operationsTable.block")}</TableHead>
              <TableHead>{t("operationsTable.date")}</TableHead>
              <TableHead>{t("operationsTable.operation")}</TableHead>
              <TableHead>{t("powerActivityTable.amountHive")}</TableHead>
              <TableHead>{unitLabel}</TableHead>
              <TableHead>{t("balanceHistoryTable.dollarValue")}</TableHead>
              <TableHead>
                {t("commentPermlinkResultTable.operationId")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op, idx) => {
              const amount = formatAmountCell(op);
              const hive = formatHive(op.amount_hive);
              const usd = computeUsd(op);
              const eventLabel = t(eventTypeLabelKey[op.direction]);
              const opTypeName = opTypeNameFor(op);
              const opTypeFull = op.op_type_id
                ? VESTING_OP_TYPE_NAME[op.op_type_id]
                : "";
              const operationBgColor = opTypeFull
                ? getOperationColor(opTypeFull)
                : "";
              const opIdStr = String(op.operation_id ?? "");
              const opIdShort =
                opIdStr.length > 12
                  ? `${opIdStr.slice(0, 6)}…${opIdStr.slice(-4)}`
                  : opIdStr;

              return (
                <TableRow
                  key={`${op.operation_id}-${idx}`}
                  data-op-id={op.operation_id}
                  onClick={() => handleRowClick(op)}
                  className="text-xs cursor-pointer hover:bg-rowHover"
                >
                  <TableCell stickyLeft className="whitespace-nowrap">
                    <Link
                      onClick={(e) => e.stopPropagation()}
                      className="text-link"
                      href={`/block/${op.block_num}`}
                    >
                      {op.block_num?.toLocaleString()}
                    </Link>
                    <CopyButton
                      text={op.block_num}
                      tooltipText={t("common.copyBlockNumber")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <TimeAgo
                              locale={appLocale}
                              datetime={
                                new Date(formatAndDelocalizeTime(op.timestamp))
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-theme text-text">
                          {formatAndDelocalizeTime(op.timestamp)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap"
                    data-testid="operation-type"
                  >
                    <div className="flex justify-start items-center rounded">
                      <span
                        className={cn("rounded w-4 mr-2", operationBgColor)}
                      />
                      <EventIcon type={op.direction} />
                      <span className="ml-1.5">{eventLabel}</span>
                    </div>
                    {opTypeName && (
                      <div className=" text-[11px] text-gray-500 dark:text-gray-400 ml-6">
                        {opTypeName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {hive !== null
                      ? `${hive.toLocaleString(undefined, {
                          maximumFractionDigits: 3,
                        })} HIVE`
                      : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {amount.value !== null
                      ? `${amount.value.toLocaleString(undefined, {
                          maximumFractionDigits: unit === "hp" ? 3 : 0,
                        })} ${amount.unitSuffix}`
                      : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {usd !== null
                      ? `$${usd.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}`
                      : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {opIdStr && (
                      <span className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                {opIdShort}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-theme text-text font-mono">
                              {opIdStr}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <CopyButton
                          text={opIdStr}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PowerActivityTable;
