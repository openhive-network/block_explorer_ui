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
import useTopHolders, { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";
import { config } from "@/Config";
import { Loader2 } from "lucide-react";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";
import Link from "next/link";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";
import ScrollTopButton from "@/components/ScrollTopButton";

export default function TopHoldersPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { settings } = useSettings();

  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const [balanceType, setBalanceType] = useState<BalanceType>("balance");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const [unit, setUnit] = useState<"vests" | "hp">(settings.displayVestHpMode === "hp" ? "hp" : "vests");

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);

  const totalCount = config.topHolders.totalCount;
  const pageSize = config.topHolders.pageSize;

  const { holdersData, isTopHoldersLoading, isTopHoldersError } = useTopHolders(
    coinType,
    balanceType,
    page
  );

  const defaultCoinType: CoinType = "HIVE";
  const defaultBalanceType: BalanceType = "balance";

  const filtersChanged = coinType !== defaultCoinType || balanceType !== defaultBalanceType;

  const filteredHolders = holdersData;

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

  useEffect(() => {
    setPage(1);
  }, [coinType, balanceType]);

  const formatBalance = (value: string, coin: CoinType): string => {
    if (!hiveChain) return value;

    if (coin === "VESTS") {
      return unit === "hp"
        ? convertVestsToHP(hiveChain, value, totalVestingFundHive, totalVestingShares)
        : hiveChain.formatter.format(hiveChain.vests(value)); // only append VESTS once in UI
    } else if (coin === "HIVE") {
      return hiveChain.formatter.format(hiveChain.hive(value));
    } else if (coin === "HBD") {
      return hiveChain.formatter.format(hiveChain.hbd(value));
    }
    return value;
  };

  const prepareExportData = () =>
    filteredHolders.map((holder, index) => {
      const displayValue = formatBalance(holder.value, coinType);

      return {
        [t("topholders.tablerank")]:
          holder.rank > 0 ? holder.rank : index + 1 + (page - 1) * pageSize,
        [t("topholders.tableaccount")]: holder.account,
        [balanceType === "savings_balance" ? t("topholders.tablesavings") : t("topholders.tablebalance")]: displayValue,
      };
    });

  const exportFileName = `${t("export.topHolders")}_${coinType.toLowerCase()}.csv`;


  const HolderRow = ({ rank, account, value, index }: { rank: number; account: string; value: string; index: number }) => {
    const displayRank = rank > 0 ? rank : index + 1 + (page - 1) * pageSize;

    return (
      <TableRow key={account} className="hover:bg-rowHover cursor-pointer text-sm" data-testid="top-holders-table-row">
        <TableCell>{displayRank}</TableCell>
        <TableCell className="text-link">
          <div className="flex items-center space-x-2">
            <Image src={getHiveAvatarUrl(account)} alt={`${account}'s profile`} width={30} height={30} className="rounded-full " />
            <Link className="text-link" href={`/@${account}`}>{account}</Link>
          </div>
        </TableCell>
        <TableCell className="text-right">{formatBalance(value, coinType)}</TableCell>
      </TableRow>
    );
  };

  const TableHeaderRow = () => (
    <TableHeader>
      <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left">
        <TableHead>{t("table.rank")}</TableHead>
        <TableHead>{t("table.account")}</TableHead>
        <TableHead className="text-right pr-6">
          {balanceType === "savings_balance" ? t("topholders.tablesavings") : t("topholders.tablebalance")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="page-container">
      <Card className="w-full rounded-[0px] rounded-t shadow-md mt-4 py-2">
        <div className="flex flex-row items-start justify-between w-full relative gap-3">
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

      {isFiltersVisible && (
        <Card className="w-full rounded-[0px] rounded-b shadow-sm">
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
              <option value="balance">{t("topholders.filtersbalance")}</option>
              <option value="savings_balance">{t("topholders.filterssavings")}</option>
            </select>
          </div>
        </Card>
      )}

      <div className="flex justify-center w-full mt-4 ">
        <CustomPagination currentPage={page} onPageChange={setPage} pageSize={pageSize} totalCount={totalCount} />
      </div>

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
          <Table className="w-full" enableMobileScrollArrows enableCompactToggle>
            <TableHeaderRow />
            <TableBody data-testid="table-body">
              {filteredHolders.map((holder, index) => (
                <HolderRow
                  key={holder.account}
                  rank={holder.rank}
                  account={holder.account}
                  value={holder.value}
                  index={index}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
        <ScrollTopButton />
      </div>
    </div>
  );
}
