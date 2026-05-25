import { useState, useRef, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import { colorByOperationCategory } from "../OperationTypesDialog";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/hybrid-tooltip";
import { useRouter } from "next/router";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useOperation from "@/hooks/api/common/useOperation";
import { formatNumber } from "@/lib/utils";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import {
  ChevronDown,
  ChevronUp,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";
import CopyButton from "../ui/CopyButton";
import DataExport from "../DataExport";
import DataCountMessage from "../DataCountMessage";
import { useI18n } from "@/i18n/i18n";
import { grabNumericValue } from "@/utils/StringUtils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHive, convertVestsToHP } from "@/utils/Calculations";
import { useSettings } from "@/contexts/SettingsContext";

interface BalanceHistoryTableProps {
  operations: Explorer.BalanceHistoryForTable[];
  total_operations: number;
  total_pages: number;
  current_page: number;
  account_name: string;
  unit?: "vests" | "hp";
}

const BalanceHistoryTable: React.FC<BalanceHistoryTableProps> = ({
  operations,
  total_operations,
  total_pages,
  current_page,
  account_name,
  unit,
}) => {
  const router = useRouter();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const { locale: appLocale, t } = useI18n();
  const {
    settings: { rawJsonView, prettyJsonView, displayVestHpMode },
  } = useSettings();

  const coinName = router.query.coinType ? router.query.coinType : "HIVE";
  const effectiveUnit: "vests" | "hp" =
    unit ?? (displayVestHpMode === "hp" ? "hp" : "vests");
  const isHpMode = coinName === "VESTS" && effectiveUnit === "hp";

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const { operationsTypes: operationsTypesRaw } = useOperationsTypes();

  const operationsTypesById = useMemo(() => {
    const list = operationsTypesRaw || [];
    const map = new Map<number, (typeof list)[number]>();
    list.forEach((op) => map.set(op.op_type_id, op));
    return map;
  }, [operationsTypesRaw]);

  const colorByOperationName = useMemo(() => {
    const map = new Map<string, string>();
    categorizedOperationTypes.forEach((cat) => {
      const color = colorByOperationCategory[cat.name] ?? "";
      cat.types.forEach((name) => map.set(name, color));
    });
    return map;
  }, []);

  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const detailRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const paginationRef = useRef<HTMLDivElement | null>(null);

  const vestsConvertedRows = useMemo(() => {
    if (coinName !== "VESTS" || !hiveChain || !dynamicGlobalData) return null;
    const fundHive = dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive;
    const totalShares =
      dynamicGlobalData.headBlockDetails.rawTotalVestingShares;
    const toHp = (rawVests: number | string) =>
      convertVestsToHP(hiveChain, String(rawVests), fundHive, totalShares) ??
      "0 HP";
    const map = new Map<
      number,
      {
        balance: string;
        prev_balance: string;
        balanceChange: string;
        balanceHpNumeric: number;
      }
    >();
    operations.forEach((op) => {
      const balanceStr = toHp(op.balance);
      map.set(op.operationId, {
        balance: balanceStr,
        prev_balance: toHp(op.prev_balance),
        balanceChange: toHp(op.balanceChange),
        balanceHpNumeric: grabNumericValue(balanceStr),
      });
    });
    return map;
  }, [coinName, operations, hiveChain, dynamicGlobalData]);

  const hpConvertedRows = isHpMode ? vestsConvertedRows : null;

  const formatRawCoin = (coinValue: number) =>
    coinName === "VESTS"
      ? formatNumber(coinValue, true, false)
      : formatNumber(coinValue, false, false);

  const getOperationColor = (op_type_id: number) => {
    const operation = operationsTypesById.get(op_type_id);
    if (!operation) return "";
    return colorByOperationName.get(operation.operation_name) ?? "";
  };

  const getOperationTypeForDisplayById = (op_type_id: number) =>
    getOperationTypeForDisplay(
      operationsTypesById.get(op_type_id)?.operation_name || ""
    );

  const updateUrl = (page: number) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: page.toString() },
      },
      undefined,
      { scroll: false }
    );
    paginationRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const OperationDetails: React.FC<{ operationId: number }> = ({
    operationId,
  }) => {
    const router = useRouter();
    const { operationData, operationDataIsFetched, operationDataError } =
      useOperation(operationId.toString());

    const formattedAccountOperations = useOperationsFormatter(operationData);

    const handleDetailsClick = (opDetails: any) => {
      if (!opDetails?.block) return;

      const { block, trx_id, operation_id } = opDetails;
      const params = new URLSearchParams();

      if (trx_id) {
        params.append("trxId", trx_id);
      }
      if (operation_id !== undefined) {
        params.append("opId", String(operation_id));
      }

      const queryString = params.toString();
      const url = `/block/${block}${queryString ? `?${queryString}` : ""}`;
      router.push(url);
    };

    if (operationDataIsFetched) {
      if (!operationData || Object.keys(operationData).length === 0) {
        return <p>{t("balanceHistoryTable.noRecordsForOperation")}</p>;
      }

      return (
        <div
          className="cursor-pointer hover:bg-rowHover"
          onClick={() => handleDetailsClick(formattedAccountOperations)}
        >
          {!rawJsonView && !prettyJsonView ? (
            <div>{getOneLineDescription(formattedAccountOperations)}</div>
          ) : prettyJsonView ? (
            <pre>{JSON.stringify(operationData.op, null, 2)}</pre>
          ) : (
            <pre>{JSON.stringify(operationData.op)}</pre>
          )}
        </div>
      );
    }

    if (operationDataError) {
      return <p>{t("balanceHistoryTable.errorFetchingOperationDetails")}</p>;
    }

    return <p>{t("balanceHistoryTable.loadingOperationDetails")}</p>;
  };

  const getOneLineDescription = (operation: any) => {
    const value = operation.op.value;
    if (typeof value === "string" || React.isValidElement(value)) {
      if (operation.trx_id) {
        return (
          <>
            {value}
            <div>
              <span>{t("common.transaction")} : </span>
              <Link
                className="text-link"
                href={`/tx/${operation.trx_id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {operation.trx_id?.slice(0, 10)}{" "}
              </Link>
              <CopyButton
                text={operation.trx_id || ""}
                tooltipText={t("common.copyTransactionId")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </>
        );
      }
      return value;
    }

    return null;
  };

  const handleRowClick = (operationId: number) => {
    setExpandedRow((prev) => (prev === operationId ? null : operationId));

    const rowElement = rowRefs.current.get(operationId);
    const detailElement = detailRefs.current.get(operationId);

    if (rowElement && detailElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const vestsToHive = (vests: string) => {
    if (hiveChain && vests && dynamicGlobalData) {
      const result = convertVestsToHive(
        hiveChain,
        vests,
        dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive,
        dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
      );
      return result;
    }
  };

  const getDollarValue = (
    coin: string,
    balance: number,
    hivePrice: number,
    cachedHp?: number
  ) => {
    if (coin === "HIVE") {
      return hivePrice * balance;
    }
    if (coin === "HBD") {
      return balance;
    }
    if (coin === "VESTS") {
      if (cachedHp !== undefined) {
        return (cachedHp * hivePrice).toFixed(2);
      }
      const vests = vestsToHive(String(balance));
      const convertToNumber = grabNumericValue(String(vests));
      const result = convertToNumber * hivePrice;
      return result.toFixed(2);
    } else return undefined;
  };

  const exportData = useMemo(() => {
    return operations.map((operation) => {
      const hivePrice = Number(operation.hivePrice);
      const vestsCached = vestsConvertedRows?.get(operation.operationId);
      const dollarValue = getDollarValue(
        coinName as string,
        operation.balance,
        hivePrice,
        vestsCached?.balanceHpNumeric
      );

      const dollarNumeric = Number(dollarValue);
      const dollarCell =
        dollarValue == null || isNaN(dollarNumeric)
          ? "—"
          : `$${formatNumber(dollarNumeric, false, coinName === "VESTS")}`;

      const converted = hpConvertedRows?.get(operation.operationId);
      const prevCell = converted
        ? converted.prev_balance
        : `${formatRawCoin(operation.prev_balance)} ${coinName}`;
      const changeCell = converted
        ? converted.balanceChange
        : `${formatRawCoin(operation.balanceChange)} ${coinName}`;
      const balanceCell = converted
        ? converted.balance
        : `${formatRawCoin(operation.balance)} ${coinName}`;

      return {
        [t("balanceHistoryTable.operationType")]:
          getOperationTypeForDisplayById(operation.opTypeId),
        [t("balanceHistoryTable.timestamp")]: formatAndDelocalizeTime(
          operation.timestamp
        ),
        [t("balanceHistoryTable.blockNumber")]:
          operation.blockNumber?.toLocaleString() || "",
        [t("balanceHistoryTable.balance")]: prevCell,
        [t("balanceHistoryTable.balanceChange")]: changeCell,
        [t("balanceHistoryTable.newBalance")]: balanceCell,
        [t("balanceHistoryTable.dollarValue")]: dollarCell,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operations,
    coinName,
    hpConvertedRows,
    vestsConvertedRows,
    operationsTypesById,
    t,
  ]);

  return (
    <>
      <div
        ref={paginationRef}
        className="sticky z-20 top-[7rem] md:top-[7.5rem] scroll-mt-[7.5rem]"
      >
        <CustomPagination
          currentPage={current_page ? current_page : total_pages}
          onPageChange={updateUrl}
          pageSize={config.standardPaginationSize}
          totalCount={total_operations}
          className="rounded"
          isMirrored={true}
        />
      </div>
      {total_operations === 0 ? (
        <div className="flex justify-center w-full">
          {t("balanceHistoryTable.noResultsMatchingCriteria")}
        </div>
      ) : (
        <>
          <div
            className={cn("table-toolbar", {
              "justify-between": !!total_operations,
            })}
          >
            <DataCountMessage
              count={total_operations}
              dataType="common.operations"
            />
            <DataExport
              data={exportData}
              filename={`${account_name}_${t(
                "accountDetailsSection.balanceHistory"
              ).toLowerCase()}.csv`}
            />
          </div>

          <Table
            className={cn("rounded-[6px] overflow-hidden max-w-full text-xs")}
            enableMobileScrollArrows
            enableCompactToggle
          >
            <TableHeader>
              <TableRow rowVariant="header">
                <TableHead stickyLeft>
                  {t("balanceHistoryTable.operationType")}
                </TableHead>
                <TableHead>{t("balanceHistoryTable.date")}</TableHead>
                <TableHead>{t("balanceHistoryTable.blockNumber")}</TableHead>
                <TableHead>{t("balanceHistoryTable.balance")}</TableHead>
                <TableHead>{t("balanceHistoryTable.balanceChange")}</TableHead>
                <TableHead>{t("balanceHistoryTable.newBalance")}</TableHead>
                <TableHead>{t("balanceHistoryTable.dollarValue")}</TableHead>
                <TableHead>{t("balanceHistoryTable.details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation, index) => {
                const operationBgColor = getOperationColor(operation.opTypeId);
                const isExpanded = expandedRow === operation.operationId;
                const hivePrice = Number(operation.hivePrice);
                const vestsCached = vestsConvertedRows?.get(
                  operation.operationId
                );
                const dollarValue = getDollarValue(
                  coinName as string,
                  operation.balance,
                  hivePrice,
                  vestsCached?.balanceHpNumeric
                );

                const dollarNumeric = Number(dollarValue);
                const dollarCell =
                  dollarValue == null || isNaN(dollarNumeric)
                    ? "—"
                    : `$${formatNumber(dollarNumeric, false, coinName === "VESTS")}`;

                const converted = hpConvertedRows?.get(operation.operationId);
                const prevCell = converted
                  ? converted.prev_balance
                  : `${formatRawCoin(operation.prev_balance)} ${coinName}`;
                const changeCell = converted
                  ? converted.balanceChange
                  : `${formatRawCoin(operation.balanceChange)} ${coinName}`;
                const balanceCell = converted
                  ? converted.balance
                  : `${formatRawCoin(operation.balance)} ${coinName}`;

                const trendColor =
                  operation.balanceChange > 0
                    ? "#22c55e"
                    : operation.balanceChange < 0
                      ? "#ef4444"
                      : "#6b7280";

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      ref={(el) => {
                        if (el) {
                          rowRefs.current.set(operation.operationId, el);
                        }
                      }}
                      className={isExpanded ? "bg-rowOdd" : ""}
                    >
                      <TableCell stickyLeft data-testid="operation-type">
                        <div className="flex justify-start rounded">
                          <span
                            className={`rounded w-4 mr-2 ${operationBgColor}`}
                          ></span>
                          <span>
                            {getOperationTypeForDisplayById(operation.opTypeId)}
                          </span>
                        </div>
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
                                      formatAndDelocalizeTime(
                                        operation.timestamp
                                      )
                                    )
                                  }
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-theme text-text">
                              {formatAndDelocalizeTime(operation.timestamp)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell
                        data-testid="block-number"
                        className="whitespace-nowrap"
                      >
                        <Link
                          className="text-link"
                          href={`/block/${operation.blockNumber}`}
                          onClick={(e) => e.stopPropagation()} // <-- ADDED stopPropagation
                        >
                          {operation.blockNumber?.toLocaleString()}
                        </Link>
                        <CopyButton
                          text={operation.blockNumber}
                          tooltipText={t("common.copyBlockNumber")}
                          onClick={(e) => e.stopPropagation()} // <-- ADDED stopPropagation
                        />
                      </TableCell>
                      <TableCell data-testid="operation-prev-balance">
                        {prevCell}
                      </TableCell>
                      <TableCell data-testid="operation-balance-change">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          {operation.balanceChange > 0 ? (
                            <ArrowUp
                              size={14}
                              color={trendColor}
                              aria-label={t(
                                "balanceHistoryTable.trendIncreased"
                              )}
                            />
                          ) : operation.balanceChange < 0 ? (
                            <ArrowDown
                              size={14}
                              color={trendColor}
                              aria-label={t(
                                "balanceHistoryTable.trendDecreased"
                              )}
                            />
                          ) : (
                            <Minus
                              size={14}
                              color={trendColor}
                              aria-label={t(
                                "balanceHistoryTable.trendUnchanged"
                              )}
                            />
                          )}
                          {changeCell}
                        </span>
                      </TableCell>
                      <TableCell>{balanceCell}</TableCell>

                      <TableCell>{dollarCell}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRowClick(operation.operationId)}
                          className="text-link"
                        >
                          {isExpanded ? (
                            <ChevronUp
                              size={20}
                              data-testid="last-updated-icon"
                            />
                          ) : (
                            <ChevronDown
                              size={20}
                              data-testid="last-updated-icon"
                            />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow
                        ref={(el) => {
                          if (el) {
                            detailRefs.current.set(operation.operationId, el);
                          }
                        }}
                      >
                        <TableCell colSpan={7} className="p-4">
                          <div className="border rounded-2xl p-4 bg-theme">
                            <h3 className="text-lg font-bold">
                              {t("balanceHistoryTable.operationDetails")}
                            </h3>
                            <OperationDetails
                              operationId={operation.operationId}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
};

export default BalanceHistoryTable;
