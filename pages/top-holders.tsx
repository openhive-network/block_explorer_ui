// pages/TopHoldersPage.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import BalanceHistoryModal from "@/components/Modal";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { Info } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import DataExport from "@/components/DataExport";
import TableSearchBar from "@/components/TableSearchBar";
import CustomPagination from "@/components/CustomPagination";
import useTopHolders, { CoinType, BalanceType } from "@/hooks/common/useTopHolders";

export default function TopHoldersPage() {
  const { t } = useI18n();

  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const [balanceType, setBalanceType] = useState<BalanceType>("balance");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const totalCount = 500;

  const { holders, loading, error } = useTopHolders({ page, coinType, balanceType });

  const defaultCoinType: CoinType = "HIVE";
  const defaultBalanceType: BalanceType = "balance";
  const defaultSortOrder: "asc" | "desc" = "desc";

  const filtersChanged =
    coinType !== defaultCoinType || balanceType !== defaultBalanceType || sortOrder !== defaultSortOrder;

  const handleAccountClick = (account: string) => setSelectedAccount(account);
  const closeModal = () => setSelectedAccount(null);

  const filteredHolders = holders
    .filter((holder) => holder.account.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const valA = parseFloat(a.value);
      const valB = parseFloat(b.value);
      if (isNaN(valA) || isNaN(valB)) return 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

  const formatValue = (value: string, coinType: CoinType) => {
    let num = parseFloat(value);
    if (isNaN(num)) return value;
    num = num / 1000;
    const decimals = coinType === "VESTS" ? 6 : 3;
    return parseFloat(num.toFixed(decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

const prepareExportData = () => {
  return filteredHolders.map((holder) => ({
    [t("table.rank")]: holder.rank + (page - 1) * 100,
    [t("table.account")]: holder.account,
    [balanceType === "savings_balance"
      ? t("table.savings")
      : t("table.balance")]: holder.value,
  }));
};

  const exportFileName = `top_holders_${coinType.toLowerCase()}.csv`;

  return (
    <div className="page-container space-y-6 px-6 w-full max-w-[98vw] mx-auto">
      {/* Top Section */}
      <Card className="w-full rounded shadow-md mt-4 px-6 py-4">
        <div className="hidden sm:flex items-start justify-between w-full relative">
          <div className="flex items-start gap-2 relative">
            <PageTitle titleKey={t("pageTitle.topHolders")} className="mt-4" />
            <div className="absolute -top-1 right-[-24px] group">
              <Info
                width={18}
                height={18}
                stroke="#EF4444"
                strokeWidth={2} 
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="cursor-pointer"
              />
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-64 p-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded shadow-md z-10">
                {t("topHoldersPage.infoDescription")}
              </div>
            </div>
          </div>
          <FilterSectionToggle
            isFiltersActive={filtersChanged}
            toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
          />
        </div>

        <div className="flex flex-col sm:hidden items-start gap-3 w-full relative">
          <div className="flex items-start gap-2 relative">
            <PageTitle titleKey={t("pageTitle.topHolders")} className="mt-4" />
            <div className="absolute -top-1 right-[-24px] group">
              <Info
                width={18}
                height={18}
                stroke="#EF4444"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="cursor-pointer"
              />
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-64 p-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded shadow-md z-10">
                {t("topHoldersPage.infoDescription")}
              </div>
            </div>
          </div>
          <FilterSectionToggle
            isFiltersActive={filtersChanged}
            toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
          />
        </div>
      </Card>

      {/* Filter Section */}
      {isFiltersVisible && (
        <Card className="w-full rounded shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
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

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
            >
              <option value="asc">{t("filters.ascending")}</option>
              <option value="desc">{t("filters.descending")}</option>
            </select>

            <div className="flex-1 w-full">
              <TableSearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>
        </Card>
      )}

      {/* Export Button */}
      <div className="w-full flex justify-end mt-2 px-2">
        {!loading && !error && filteredHolders.length > 0 && (
          <DataExport
            data={prepareExportData()}
            filename={exportFileName}
            skipColumnSelection={true}
            className="h-10 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-4"
          />
        )}
      </div>

      {/* Table */}
      <Card className="w-full rounded">
        <div className="p-4">
          {loading && <p>{t("modal.loading")}</p>}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && filteredHolders.length === 0 && <NoResult />}

          {!loading && !error && filteredHolders.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block min-w-[700px]">
                <Table className="rounded border w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left">
                      <TableCell>{t("table.rank")}</TableCell>
                      <TableCell>{t("table.account")}</TableCell>
                      <TableCell className="text-right">
                        {balanceType === "savings_balance" ? t("table.savings") : t("table.balance")}
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHolders.map((holder) => {
                      const displayRank = holder.rank + (page - 1) * 100;
                      return (
                        <TableRow
                          key={holder.account}
                          onClick={() => handleAccountClick(holder.account)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
                        >
                          <TableCell>{displayRank}</TableCell>
                          <TableCell>{holder.account}</TableCell>
                          <TableCell className="text-right">{formatValue(holder.value, coinType)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Table */}
              <div className="sm:hidden space-y-3">
                {filteredHolders.map((holder) => {
                  const displayRank = holder.rank + (page - 1) * 100;
                  return (
                    <div
                      key={holder.account}
                      onClick={() => handleAccountClick(holder.account)}
                      className="border rounded p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{t("table.rank")}</span>
                        <span className="text-sm">{displayRank}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{t("table.account")}</span>
                        <span className="text-sm break-all">{holder.account}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {balanceType === "savings_balance" ? t("table.savings") : t("table.balance")}
                        </span>
                        <span className="text-sm">{formatValue(holder.value, coinType)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex justify-center w-full">
                <CustomPagination
                  currentPage={page}
                  onPageChange={setPage}
                  pageSize={100}
                  totalCount={totalCount}
                  className="rounded"
                  isMirrored={false}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modal */}
      {selectedAccount && (
        <BalanceHistoryModal username={selectedAccount} coinType={coinType} onClose={closeModal} />
      )}
    </div>
  );
}
