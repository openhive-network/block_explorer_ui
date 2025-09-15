import { useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
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
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export default function TopHoldersPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const [balanceType, setBalanceType] = useState<BalanceType>("balance");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  // Navigate to user's profile page on click
  const handleAccountClick = (account: string) => {
    router.push(`/@${account}`);
  };

  // Sort holders based on value and sortOrder
  const filteredHolders = holdersData.sort((a, b) => {
    const valA = parseFloat(a.value);
    const valB = parseFloat(b.value);
    if (isNaN(valA) || isNaN(valB)) return 0;
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const formatValueForDisplay = (value: string, coinType: CoinType) => {
    const isVest = coinType === "VESTS";
    return formatNumber(value, isVest);
  };

  const prepareExportData = () =>
    filteredHolders.map((holder) => ({
      [t("table.rank")]: holder.rank + (page - 1) * 100,
      [t("table.account")]: holder.account,
      [balanceType === "savings_balance" ? t("table.savings") : t("table.balance")]: holder.value,
    }));

  const exportFileName = `top_holders_${coinType.toLowerCase()}.csv`;

  const HolderRow = ({
    rank,
    account,
    value,
  }: {
    rank: number;
    account: string;
    value: string;
  }) => (
    <TableRow
      key={account}
      onClick={() => handleAccountClick(account)}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
      data-testid="top-holders-table-row"
    >
      <TableCell>{rank}</TableCell>
      <TableCell>{account}</TableCell>
      <TableCell className="text-right">{formatValueForDisplay(value, coinType)}</TableCell>
    </TableRow>
  );

  // Table header with sortable arrows
  const TableHeaderRow = () => (
    <TableHeader>
      <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left">
        <TableCell
          className="cursor-pointer"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <div className="flex items-center">
            {t("table.rank")}
            {sortOrder === "asc" ? (
              <ChevronDown size={15} className="ml-1" />
            ) : (
              <ChevronUp size={15} className="ml-1" />
            )}
          </div>
        </TableCell>
        <TableCell>{t("table.account")}</TableCell>
        <TableCell
          className="text-right cursor-pointer"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <div className="flex items-center justify-end">
            {balanceType === "savings_balance" ? t("table.savings") : t("table.balance")}
            <ChevronsUpDown size={15} className="ml-1" />
          </div>
        </TableCell>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="page-container space-y-6 w-full">
      {/* Top Section */}
      <Card className="w-full rounded shadow-md mt-4 py-2">
        <div className="flex flex-col sm:flex-row items-start justify-between w-full relative gap-3">
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
        <Card className="w-full rounded shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start p-4">
            <select
              value={coinType}
              onChange={(e) => setCoinType(e.target.value as CoinType)}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
            >
              <option value="HIVE">HIVE</option>
              <option value="HBD">HBD</option>
              <option value="VESTS">VESTS</option>
            </select>

            <select
              value={balanceType}
              onChange={(e) => setBalanceType(e.target.value as BalanceType)}
              disabled={coinType === "VESTS"}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
            >
              <option value="balance">{t("filters.balance")}</option>
              <option value="savings_balance">{t("filters.savings")}</option>
            </select>
          </div>
        </Card>
      )}

      {/* Export Button */}
      <div className="w-full flex justify-end mt-2">
        {!isTopHoldersLoading && !isTopHoldersError && filteredHolders.length > 0 && (
          <DataExport
            data={prepareExportData()}
            filename={exportFileName}
            className="h-10 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-4"
          />
        )}
      </div>

      {/* Table */}
      <Card className="w-full rounded">
        <div>
          {isTopHoldersLoading && <p>{t("modal.loading")}</p>}
          {isTopHoldersError && <ErrorMessage message={isTopHoldersError.message} />}
          {!isTopHoldersLoading && !isTopHoldersError && filteredHolders.length === 0 && <NoResult />}

          {!isTopHoldersLoading && !isTopHoldersError && filteredHolders.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block min-w-[700px]">
                <Table className="rounded border w-full">
                  <TableHeaderRow />
                  <TableBody data-testid="table-body">
                    {filteredHolders.map((holder) => {
                      const displayRank = holder.rank + (page - 1) * 100;
                      return (
                        <HolderRow
                          key={holder.account}
                          rank={displayRank}
                          account={holder.account}
                          value={holder.value}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Table */}
              <div className="sm:hidden overflow-x-auto">
                <Table className="rounded border w-full text-sm">
                  <TableHeaderRow />
                  <TableBody data-testid="table-body">
                    {filteredHolders.map((holder) => {
                      const displayRank = holder.rank + (page - 1) * 100;
                      return (
                        <HolderRow
                          key={holder.account}
                          rank={displayRank}
                          account={holder.account}
                          value={holder.value}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex justify-center w-full">
                <CustomPagination
                  currentPage={page}
                  onPageChange={setPage}
                  pageSize={100}
                  totalCount={totalCount}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
