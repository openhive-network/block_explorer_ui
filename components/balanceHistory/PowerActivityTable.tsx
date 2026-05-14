import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import TimeAgo from "timeago-react";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Zap } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/hybrid-tooltip";
import CopyButton from "../ui/CopyButton";
import CustomPagination from "../CustomPagination";
import DataCountMessage from "../DataCountMessage";
import NoResult from "../NoResult";

import { config } from "@/Config";
import { useI18n } from "@/i18n/i18n";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useAccountVestingHistory from "@/hooks/api/balanceHistory/useAccountVestingHistory";
import Hive from "@/types/Hive";
import { grabNumericValue } from "@/utils/StringUtils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

interface PowerActivityTableProps {
  accountName: string;
  filter: Hive.VestingHistoryFilter;
  onFilterChange: (filter: Hive.VestingHistoryFilter) => void;
  page: number | undefined;
  onPageChange: (page: number) => void;
  fromBlock?: Date | number | undefined;
  toBlock?: Date | number | undefined;
}

const eventTypeLabelKey: Record<
  Exclude<Hive.VestingHistoryFilter, "all">,
  string
> = {
  power_up: "powerActivityTable.eventPowerUp",
  power_down_init: "powerActivityTable.eventPowerDownInit",
  power_down_fill: "powerActivityTable.eventPowerDownFill",
};

const PowerActivityTable: React.FC<PowerActivityTableProps> = ({
  accountName,
  filter,
  onFilterChange,
  page,
  onPageChange,
  fromBlock,
  toBlock,
}) => {
  const { t, locale: appLocale } = useI18n();
  const router = useRouter();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

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

  const formatVests = (vests: Hive.Supply | null | undefined) => {
    if (!vests || !vests.amount || vests.amount === "0") return null;
    if (!hiveChain || !dynamicGlobalData) return null;
    const hpAsset = hiveChain.vestsToHp(
      vests,
      dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
      dynamicGlobalData.headBlockDetails.rawTotalVestingShares
    );
    return grabNumericValue(hiveChain.formatter.format(hpAsset));
  };

  const formatHive = (hive: Hive.Supply | null | undefined) => {
    if (!hive || !hive.amount || hive.amount === "0") return null;
    const amount = parseFloat(hive.amount) / Math.pow(10, hive.precision);
    return amount;
  };

  const totalOperations = accountVestingHistory?.total_operations ?? 0;
  const totalPages = accountVestingHistory?.total_pages ?? 0;
  const operations = useMemo(
    () => accountVestingHistory?.operations_result ?? [],
    [accountVestingHistory]
  );

  const isLoading =
    isAccountVestingHistoryLoading || isAccountVestingHistoryFetching;

  const handleFilterChange = (value: string) => {
    onFilterChange(value as Hive.VestingHistoryFilter);
  };

  const updatePageInUrl = (newPage: number) => {
    onPageChange(newPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage.toString() },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">
            {t("powerActivityTable.filter")}
          </label>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("powerActivityTable.filterAll")}
              </SelectItem>
              <SelectItem value="power_up">
                {t("powerActivityTable.filterPowerUp")}
              </SelectItem>
              <SelectItem value="power_down_init">
                {t("powerActivityTable.filterPowerDownInit")}
              </SelectItem>
              <SelectItem value="power_down_fill">
                {t("powerActivityTable.filterPowerDownFill")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataCountMessage
          count={totalOperations}
          dataType="common.operations"
        />
      </div>

      {totalPages > 1 && (
        <CustomPagination
          currentPage={page ?? 1}
          onPageChange={updatePageInUrl}
          pageSize={config.standardPaginationSize}
          totalCount={totalOperations}
          className="rounded"
        />
      )}

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

      {!isLoading && !isAccountVestingHistoryError && operations.length === 0 && (
        <NoResult />
      )}

      {!isLoading && !isAccountVestingHistoryError && operations.length > 0 && (
        <Table
          className="rounded-[6px] overflow-hidden max-w-full text-xs"
          enableMobileScrollArrows
          enableCompactToggle
        >
          <TableHeader>
            <TableRow rowVariant="header">
              <TableHead stickyLeft>
                {t("powerActivityTable.event")}
              </TableHead>
              <TableHead>{t("powerActivityTable.date")}</TableHead>
              <TableHead>{t("powerActivityTable.block")}</TableHead>
              <TableHead>{t("powerActivityTable.amountHive")}</TableHead>
              <TableHead>{t("powerActivityTable.amountHp")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op, idx) => {
              const hp = formatVests(op.amount_vests);
              const hive = formatHive(op.amount_hive);
              const eventLabel = t(eventTypeLabelKey[op.event_type]);
              const icon =
                op.event_type === "power_up" ? (
                  <ArrowUpFromLine size={14} className="text-emerald-500" />
                ) : op.event_type === "power_down_fill" ? (
                  <ArrowDownToLine size={14} className="text-rose-500" />
                ) : (
                  <Zap size={14} className="text-amber-500" />
                );

              return (
                <TableRow key={`${op.operation_id}-${idx}`}>
                  <TableCell stickyLeft>
                    <span className="flex items-center gap-2">
                      {icon}
                      {eventLabel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <TimeAgo
                              locale={appLocale}
                              datetime={
                                new Date(
                                  formatAndDelocalizeTime(op.timestamp)
                                )
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
                  <TableCell className="whitespace-nowrap">
                    <Link
                      className="text-link"
                      href={`/block/${op.block_num}`}
                    >
                      {op.block_num?.toLocaleString()}
                    </Link>
                    <CopyButton
                      text={op.block_num}
                      tooltipText={t("common.copyBlockNumber")}
                    />
                  </TableCell>
                  <TableCell>
                    {hive !== null
                      ? `${hive.toLocaleString(undefined, {
                          maximumFractionDigits: 3,
                        })} HIVE`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {hp !== null
                      ? `${hp.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })} HP`
                      : "—"}
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
