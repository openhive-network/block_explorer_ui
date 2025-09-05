// pages/top-holders.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import TopHoldersPagination from "@/components/ui/TopHoldersPagination";

interface Holder {
  account: string;
  balance: string;
}

export default function TopHoldersPage() {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState("HIVE");
  const [balanceType, setBalanceType] = useState("balance");

  useEffect(() => {
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
      setHolders(data?.holders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitle titleKey="Top Holders (Richlist)" />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <div className="flex gap-4 p-4">
          <Select value={coinType} onValueChange={setCoinType}>
            <option value="HIVE">HIVE</option>
            <option value="HBD">HBD</option>
          </Select>

          <Select value={balanceType} onValueChange={setBalanceType}>
            <option value="balance">Balance</option>
            <option value="savings">Savings</option>
            <option value="staked">Staked</option>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Richlist</CardTitle>
        </CardHeader>
        <div className="p-4">
          {loading && <p>Loading...</p>}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && holders.length === 0 && <NoResult />}
          {!loading && !error && holders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Balance</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holders.map((holder, idx) => (
                  <TableRow key={holder.account}>
                    <TableCell>{idx + 1 + (page - 1) * 50}</TableCell>
                    <TableCell>{holder.account}</TableCell>
                    <TableCell>{holder.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex justify-center">
            <TopHoldersPagination
              currentPage={page}
              onPageChange={setPage}
              totalPages={1000} // ideally from API if available
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
