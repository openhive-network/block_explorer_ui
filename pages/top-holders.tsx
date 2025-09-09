import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import SearchBar from "@/components/SearchBar";
import BalanceHistoryModal from "@/components/Modal";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { useI18n } from "@/i18n/i18n";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import DataExport from "@/components/DataExport";

interface Holder {
  rank: number;
  account: string;
  value: string;
}

export default function TopHoldersPage() {
  const { t } = useI18n();
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<"HIVE" | "HBD" | "VESTS">("HIVE");
  const [balanceType, setBalanceType] = useState<"balance" | "savings_balance">("balance");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  useEffect(() => {
    if (coinType === "VESTS" && balanceType !== "balance") setBalanceType("balance");
    fetchHolders();
  }, [page, coinType, balanceType]);

  const fetchHolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.syncad.com/balance-api/top-holders?coin-type=${coinType}&balance-type=${balanceType}&page=${page}`
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setHolders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (account: string) => setSelectedAccount(account);
  const closeModal = () => setSelectedAccount(null);

  const filteredHolders = holders.filter((holder) =>
    holder.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatValue = (value: string) => Number(value).toLocaleString();

  return (
    <div className="space-y-6 px-6">
      {/* Header: outer Card*/}
      <Card className="w-[98vw] max-w-[calc(100vw-2rem)] mx-auto rounded shadow-md mt-4 px-6 py-4">
        {/* Desktop header*/}
        <div className="hidden sm:flex items-center justify-between w-full">
          <PageTitle titleKey={t("pageTitle.topHolders")} />
          <FilterSectionToggle
            isFiltersActive={isFiltersVisible}
            toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
          />
        </div>

        {/* Mobile header */}
        <div className="flex flex-col sm:hidden items-start gap-3 w-full">
          <div className="w-full">
            <PageTitle titleKey={t("pageTitle.topHolders")} />
          </div>
          <div className="w-full flex justify-start">
            <FilterSectionToggle
              isFiltersActive={isFiltersVisible}
              toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
            />
          </div>
        </div>
      </Card>

      {/* Filters/Search*/}
      {isFiltersVisible && (
        <Card className="w-full sm:max-w-[800px] mx-auto rounded shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <select
              value={coinType}
              onChange={(e) => setCoinType(e.target.value as "HIVE" | "HBD" | "VESTS")}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
            >
              <option value="HIVE">HIVE</option>
              <option value="HBD">HBD</option>
              <option value="VESTS">VESTS</option>
            </select>

            <select
              value={balanceType}
              onChange={(e) => setBalanceType(e.target.value as "balance" | "savings_balance")}
              disabled={coinType === "VESTS"}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
            >
              <option value="balance">{t("filters.balance")}</option>
              <option value="savings_balance">{t("filters.savings")}</option>
            </select>

            <div className="flex-1 w-full">
              <SearchBar onSearch={(value: string) => setSearchTerm(value)} open={true} />
            </div>
          </div>
        </Card>
      )}

      {/* Export button: */}
      <div className="w-full sm:max-w-[800px] mx-auto flex justify-end mt-2 px-2 sm:px-0">
        {!loading && !error && filteredHolders.length > 0 && (
          <DataExport
            data={filteredHolders.map(holder => ({
              Rank: holder.rank + (page - 1) * 100,
              Account: holder.account,
              [balanceType === "savings_balance" ? "Savings" : "Balance"]: holder.value,
            }))}
            filename={`top_holders_${coinType.toLowerCase()}.csv`}
            skipColumnSelection={true}
            className="h-10 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-4"
          />
        )}
      </div>

      {/* Table Card  */}
      <Card className="w-full sm:max-w-[800px] mx-auto rounded">
        <div className="p-4">
          {loading && <p>{t("modal.loading")}</p>}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && filteredHolders.length === 0 && <NoResult />}

          {!loading && !error && filteredHolders.length > 0 && (
            <>
              {/* Desktop table  */}
              <div className="hidden sm:block">
                <div className="min-w-[700px]">
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
                            <TableCell className="text-right">{formatValue(holder.value)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile compact list  */}
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
                        <span className="text-sm">{formatValue(holder.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination: */}
          <div className="hidden sm:flex mt-4 justify-center">
            <Pagination>
              <PaginationPrevious onClick={() => setPage((prev) => Math.max(prev - 1, 1))} />
              <PaginationContent>
                {Array.from({ length: 5 }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === pageNumber}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </PaginationContent>
              <PaginationNext onClick={() => setPage((prev) => Math.min(prev + 1, 5))} />
            </Pagination>
          </div>
        </div>
      </Card>

      {/* Mobile pagination  */}
      <div className="sm:hidden w-full px-4">
        <div className="mt-4 flex justify-center w-full">
          <Pagination>
            <PaginationPrevious onClick={() => setPage((prev) => Math.max(prev - 1, 1))} />
            <PaginationContent>
              {Array.from({ length: 5 }).map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === pageNumber}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            </PaginationContent>
            <PaginationNext onClick={() => setPage((prev) => Math.min(prev + 1, 5))} />
          </Pagination>
        </div>
      </div>

      {/* Modal */}
      {selectedAccount && (
        <BalanceHistoryModal username={selectedAccount} coinType={coinType} onClose={closeModal} />
      )}
    </div>
  );
}
