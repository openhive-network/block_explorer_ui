import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { useI18n } from "@/i18n/i18n";
import DataExport from "@/components/DataExport";
import CustomPagination from "@/components/CustomPagination";
import useTopHolders, { CoinType, BalanceType } from "@/hooks/common/useTopHolders";
import { config } from "@/Config";
import { formatNumber } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";
import Link from "next/link";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TopHoldersPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const [balanceType, setBalanceType] = useState<BalanceType>("balance");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [unit, setUnit] = useState<"vests" | "hp">("vests");

  const totalCount = config.topHolders.totalCount;

  const { holdersData, isTopHoldersLoading, isTopHoldersError } = useTopHolders(
    coinType,
    balanceType,
    page
  );

  const defaultCoinType: CoinType = "HIVE";
  const defaultBalanceType: BalanceType = "balance";
  const defaultSortOrder: "asc" | "desc" = "desc";

  const filtersChanged =
    coinType !== defaultCoinType ||
    balanceType !== defaultBalanceType ||
    sortOrder !== defaultSortOrder;

  const filteredHolders = holdersData.sort((a, b) => {
    const valA = parseFloat(a.value);
    const valB = parseFloat(b.value);
    if (isNaN(valA) || isNaN(valB)) return 0;
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const { dynamicGlobalData } = useDynamicGlobal() as any;
  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );
  const { hiveChain } = useHiveChainContext();

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(dynamicGlobalData.headBlockDetails.rawTotalVestingShares);
      setTotalVestingFundHive(dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive);
    }
  }, [dynamicGlobalData]);

  const fetchHivePower = (value: string, isHP: boolean): string => {
    if (isHP) {
      if (!hiveChain) return "";
      return convertVestsToHP(
        hiveChain,
        value,
        totalVestingFundHive,
        totalVestingShares
      );
    }
    return `${formatNumber(value, true)} VESTS`;
  };

  const formatValueForDisplay = (value: string, coinType: CoinType) => {
    if (coinType === "VESTS" && unit === "hp") {
      return fetchHivePower(value, true);
    }
    return formatNumber(value, coinType === "VESTS") + (coinType === "VESTS" ? " VESTS" : "");
  };

  // Fixed: export respects the toggle (HP / VESTS)
  const prepareExportData = () =>
    filteredHolders.map((holder) => {
      let displayValue = holder.value;

      if (coinType === "VESTS") {
        displayValue = unit === "hp"
          ? fetchHivePower(holder.value, true)
          : `${formatNumber(holder.value, true)} VESTS`;
      }

      return {
        [t("table.rank")]: holder.rank + (page - 1) * 100,
        [t("table.account")]: holder.account,
        [balanceType === "savings_balance" ? t("table.savings") : t("table.balance")]: displayValue,
      };
    });

  const exportFileName = `top_holders_${coinType.toLowerCase()}.csv`;

  const HolderRow = ({ rank, account, value }: { rank: number; account: string; value: string }) => (
    <TableRow key={account} className="hover:bg-rowHover cursor-pointer text-sm" data-testid="top-holders-table-row">
      <TableCell>{rank}</TableCell>
      <TableCell className="text-link">
        <div className="flex items-center space-x-2">
          <Image src={getHiveAvatarUrl(account)} alt={`${account}'s profile`} width={30} height={30} className="rounded-full " />
          <Link className="text-link" href={`/@${account}`}>{account}</Link>
        </div>
      </TableCell>
      <TableCell className="text-right">{formatValueForDisplay(value, coinType)}</TableCell>
    </TableRow>
  );

  const TableHeaderRow = () => (
    <TableHeader>
      <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left">
        <TableHead className="cursor-pointer" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          <div className="flex items-center">
            {t("table.rank")}
            {sortOrder === "asc" ? <ChevronDown size={15} className="ml-1" /> : <ChevronUp size={15} className="ml-1" />}
          </div>
        </TableHead>
        <TableHead>{t("table.account")}</TableHead>
        <TableHead className="text-right cursor-pointer" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          <div className="flex items-center justify-end">
            {balanceType === "savings_balance" ? t("table.savings") : t("table.balance")}
            <ChevronsUpDown size={15} className="ml-1" />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="page-container">
      {/* Top Section */}
      <Card className="w-full rounded-[0px] rounded-t shadow-md mt-4 py-2">
        <div className="flex flex-row  items-start justify-between w-full relative gap-3">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <PageTitle titleKey="pageTitle.topHolders" className="py-4" />
          </div>
          <div className="flex-shrink-0 md:mt-2">
            <FilterSectionToggle
              isFiltersActive={filtersChanged}
              toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
            />
          </div>
        </div>
      </Card>

      {/* Filter Section */}
      {isFiltersVisible && (
        <Card className="w-full rounded-[0px] rounded-b shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start p-4">
            <select value={coinType} onChange={(e) => setCoinType(e.target.value as CoinType)} className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto">
              <option value="HIVE">HIVE</option>
              <option value="HBD">HBD</option>
              <option value="VESTS">VESTS</option>
            </select>

            <select value={balanceType} onChange={(e) => setBalanceType(e.target.value as BalanceType)} disabled={coinType === "VESTS"} className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto">
              <option value="balance">{t("filters.balance")}</option>
              <option value="savings_balance">{t("filters.savings")}</option>
            </select>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex justify-center w-full mt-4 ">
        <CustomPagination currentPage={page} onPageChange={setPage} pageSize={100} totalCount={totalCount} />
      </div>

      {/* Export + Unit Toggle */}
      <div className="table-toolbar w-full flex">
        <div className="ml-auto flex items-center space-x-4">
          {coinType === "VESTS" && (
            <div className="flex items-center space-x-2 rounded-md p-1.5">
              <Label htmlFor="unit-toggle" className="text-sm">{t("common.vests")}</Label>
              <Switch id="unit-toggle" checked={unit === "hp"} onCheckedChange={(checked) => setUnit(checked ? "hp" : "vests")} />
              <Label htmlFor="unit-toggle" className="text-sm">{t("common.hp")}</Label>
            </div>
          )}
          <DataExport data={prepareExportData()} filename={exportFileName} />
        </div>
      </div>

      {/* Table */}
      <Card className="w-full rounded">
        {isTopHoldersLoading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        )}
        {!isTopHoldersLoading && isTopHoldersError && (
          <p className="text-sm text-center">
            <ErrorMessage message={isTopHoldersError.message} />
          </p>
        )}
        {!isTopHoldersLoading && !isTopHoldersError && filteredHolders.length === 0 && <NoResult />}
        {!isTopHoldersLoading && !isTopHoldersError && filteredHolders.length > 0 && (
          <Table className="w-full">
            <TableHeaderRow />
            <TableBody data-testid="table-body">
              {filteredHolders.map((holder) => {
                const displayRank = holder.rank + (page - 1) * 100;
                return <HolderRow key={holder.account} rank={displayRank} account={holder.account} value={holder.value} />;
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
