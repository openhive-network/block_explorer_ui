import React, { useState, Fragment, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

import { useI18n } from "@/i18n/i18n";
import useProxyPower from "@/hooks/api/accountPage/useProxyPower";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { formatNumber } from "@/lib/utils";
import { convertVestsToHP } from "@/utils/Calculations";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { useSettings } from "@/contexts/SettingsContext";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DataExport from "@/components/DataExport";

// Page size used by the hafbe-api proxy-power endpoint — controls Next button visibility
const PROXY_POWER_PAGE_SIZE = 1000;

interface AccountProxyPowerCardProps {
  accountName: string;
  isInitiallyOpen: boolean;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
}

const AccountProxyPowerCard: React.FC<AccountProxyPowerCardProps> = ({
  accountName,
  isInitiallyOpen,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { hiveChain } = useHiveChainContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [isHP, setIsHP] = useState<boolean>(
    settings.displayVestHpMode === "hp"
  );

  useEffect(() => {
    setIsHP(settings.displayVestHpMode === "hp");
  }, [settings.displayVestHpMode]);

  const [isPropertiesHidden, setIsPropertiesHidden] =
    useState(!isInitiallyOpen);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Hive.ProxyPowerResponse;
    isAscending: boolean;
  }>({ key: "proxied_vests", isAscending: false });

  const sortDirection: Hive.Direction = sortConfig.isAscending ? "asc" : "desc";

  const { accountProxyPower, isAccountProxyPowerFetching } = useProxyPower(
    accountName,
    currentPage,
    sortConfig.key,
    sortDirection
  );

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden((v) => !v);
  };

  const sortBy = (key: keyof Hive.ProxyPowerResponse) => {
    setSortConfig((prev) => ({
      key,
      isAscending: prev.key === key ? !prev.isAscending : true,
    }));
    setCurrentPage(1);
  };

  const prepareExportData = () => {
    return (accountProxyPower ?? []).map((proxy) => {
      let powerValue = "";
      if (isHP) {
        if (hiveChain && dynamicGlobalData?.headBlockDetails) {
          powerValue = convertVestsToHP(
            hiveChain,
            proxy.proxied_vests,
            dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
            dynamicGlobalData.headBlockDetails.rawTotalVestingShares
          );
        }
      } else {
        powerValue = `${formatNumber(proxy.proxied_vests, true)} VESTS`;
      }
      return {
        [t("accountProxyPowerCard.proxiedBy")]: proxy.account,
        [t("common.date")]: formatAndDelocalizeTime(proxy.proxy_date),
        [t("accountProxyPowerCard.power")]: powerValue,
      };
    });
  };

  if (!accountProxyPower || accountProxyPower.length === 0) {
    return null;
  }

  const isLastPage = accountProxyPower.length < PROXY_POWER_PAGE_SIZE;
  const showPagination = currentPage > 1 || !isLastPage;

  const renderSortIcon = (columnKey: keyof Hive.ProxyPowerResponse) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.isAscending ? (
        <ChevronUp size={15} className="ml-2" />
      ) : (
        <ChevronDown size={15} className="ml-2" />
      );
    }
    return <ChevronsUpDown size={15} className="ml-2" />;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">
            {t("accountProxyPowerCard.proxyPowerReceived")} (
            {accountProxyPower.length})
          </div>
          <div className="flex items-center space-x-2">
            <DataExport
              data={prepareExportData()}
              filename={`${accountName}_proxy_power.csv`}
              skipColumnSelection={true}
            />
            {isAccountProxyPowerFetching && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
          </div>
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden} className="p-0">
        <div className="flex items-center justify-between space-x-4 p-2 border-b">
          {showPagination ? (
            <div className="flex items-center space-x-1 my-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isAccountProxyPowerFetching}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm whitespace-nowrap">
                {t("common.page")} {currentPage}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={isLastPage || isAccountProxyPowerFetching}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center space-x-1">
            <Label htmlFor="hp-vests-toggle" className="text-xs my-4">
              {t("common.vests")}
            </Label>
            <Switch
              id="hp-vests-toggle"
              checked={isHP}
              onCheckedChange={() => setIsHP((prev) => !prev)}
              className="transform scale-90"
            />{" "}
            <Label htmlFor="hp-vests-toggle" className="text-xs">
              {t("common.hp")}
            </Label>
          </div>
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableCell
                className="cursor-pointer w-28 p-1"
                onClick={() => sortBy("account")}
              >
                <span className="flex items-center whitespace-nowrap">
                  {t("accountProxyPowerCard.proxiedBy")}{" "}
                  {renderSortIcon("account")}
                </span>
              </TableCell>
              <TableCell
                className="cursor-pointer p-1"
                onClick={() => sortBy("proxy_date")}
              >
                <span className="flex items-center whitespace-nowrap">
                  {t("common.date")} {renderSortIcon("proxy_date")}
                </span>
              </TableCell>
              <TableCell
                className="cursor-pointer text-right p-1"
                onClick={() => sortBy("proxied_vests")}
              >
                <span className="flex items-center justify-end whitespace-nowrap">
                  {t("accountProxyPowerCard.power")}{" "}
                  {renderSortIcon("proxied_vests")}
                </span>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountProxyPower.map((proxy) => (
              <Fragment key={proxy.account}>
                <TableRow className="text-sm">
                  <TableCell className="w-28 p-1">
                    <Link className="text-link" href={`/@${proxy.account}`}>
                      {proxy.account}
                    </Link>
                  </TableCell>
                  <TableCell className="p-1 w-28">
                    {formatAndDelocalizeTime(proxy.proxy_date)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap p-1">
                    {isHP ? (
                      <>
                        {hiveChain && dynamicGlobalData?.headBlockDetails && (
                          <>
                            {convertVestsToHP(
                              hiveChain,
                              proxy.proxied_vests,
                              dynamicGlobalData.headBlockDetails
                                .rawTotalVestingFundHive,
                              dynamicGlobalData.headBlockDetails
                                .rawTotalVestingShares
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>{formatNumber(proxy.proxied_vests, true)} VESTS</>
                    )}
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountProxyPowerCard;
