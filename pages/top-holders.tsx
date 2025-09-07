import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import TopHoldersPagination from "@/components/ui/TopHoldersPagination";
import SearchBar from "@/components/SearchBar";
import BalanceHistoryModal from "@/components/Modal";
import { useI18n } from "@/i18n/i18n";

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

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-300 font-bold";
    if (rank === 2) return "bg-gray-300 font-bold";
    if (rank === 3) return "bg-yellow-800 text-white font-bold";
    return "";
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitle titleKey={t("pageTitle.topHolders")} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filters.filtersAndSearch")}</CardTitle>
        </CardHeader>
        <div className="p-4 flex flex-wrap gap-4">
          <select
            value={coinType}
            onChange={(e) => setCoinType(e.target.value as "HIVE" | "HBD" | "VESTS")}
            className="border rounded px-2 py-1"
          >
            <option value="HIVE">{"HIVE"}</option>
            <option value="HBD">{("HBD")}</option>
            <option value="VESTS">{("VESTS")}</option>
          </select>

          <select
            value={balanceType}
            onChange={(e) => setBalanceType(e.target.value as "balance" | "savings_balance")}
            disabled={coinType === "VESTS"}
            className="border rounded px-2 py-1"
          >
            <option value="balance">{t("filters.balance")}</option>
            <option value="savings_balance">{t("filters.savings")}</option>
          </select>

          <div className="flex-1 min-w-[200px]">
            <SearchBar onSearch={(value: string) => setSearchTerm(value)} open={true} />
          </div>
        </div>
      </Card>

      {/* Top Holders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pageTitle.topHolders")}</CardTitle>
        </CardHeader>
        <div className="p-4">
          {loading && <p>{t("modal.loading")}</p>}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && filteredHolders.length === 0 && <NoResult />}
          {!loading && !error && filteredHolders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
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
                      className={getRankStyle(displayRank)}
                      onClick={() => handleAccountClick(holder.account)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell>{displayRank}</TableCell>
                      <TableCell>{holder.account}</TableCell>
                      <TableCell className="text-right">{formatValue(holder.value)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex justify-center">
            <TopHoldersPagination currentPage={page} onPageChange={setPage} totalPages={1000} />
          </div>
        </div>
      </Card>

      {/* Modal */}
      {selectedAccount && (
        <BalanceHistoryModal username={selectedAccount} coinType="HIVE" onClose={closeModal} />
      )}
    </div>
  );
}
