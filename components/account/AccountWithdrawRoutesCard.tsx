import React, { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import { formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "../ui/table";
import Hive from "@/types/Hive";
import { useI18n } from "../../i18n/i18n";
import DataExport from "../DataExport";

type AccountWithdrawRoutesCardProps = {
  routes?: Hive.WithdrawVestingRoute[];
  isInitiallyOpen: boolean;
  accountName: string;
};

const AccountWithdrawRoutesCard: React.FC<AccountWithdrawRoutesCardProps> = ({
  routes,
  isInitiallyOpen,
  accountName,
}) => {
  const { t } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] =
    useState(!isInitiallyOpen);

  if (!routes || !routes.length) {
    return null;
  }

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const autoVestLabel = (autoVest: boolean) =>
    autoVest
      ? t("accountWithdrawRoutesCard.autoPowerUpYes")
      : t("accountWithdrawRoutesCard.autoPowerUpNo");

  const prepareExportData = () =>
    routes.map((route, index) => ({
      [t("common.order")]: index + 1,
      [t("accountWithdrawRoutesCard.destination")]: route.to_account,
      [t("accountWithdrawRoutesCard.percent")]: formatPercent(route.percent),
      [t("accountWithdrawRoutesCard.autoPowerUp")]: autoVestLabel(
        route.auto_vest
      ),
    }));

  return (
    <Card data-testid="withdraw-routes-dropdown" className="overflow-hidden">
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">
            {t("accountWithdrawRoutesCard.routes")} ({routes.length})
          </div>
          <div className="flex items-center space-x-2">
            <DataExport
              data={prepareExportData()}
              filename={`${accountName}_${t(
                "accountWithdrawRoutesCard.routesExport"
              )}.csv`}
              skipColumnSelection={true}
            />
            {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
          </div>
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <p className="text-sm text-gray-400 dark:text-gray-500 pb-2">
          {t("accountWithdrawRoutesCard.description")}
        </p>
        <Table enableMobileScrollArrows>
          <TableHeader className="text-base">
            <TableRow>
              <TableHead className="w-10 text-right" />
              <TableHead className="text-right">
                {t("accountWithdrawRoutesCard.destination")}
              </TableHead>
              <TableHead className="text-right">
                {t("accountWithdrawRoutesCard.percent")}
              </TableHead>
              <TableHead className="text-right">
                {t("accountWithdrawRoutesCard.autoPowerUp")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {routes.map((route, index) => (
              <Fragment key={route.id}>
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="text-link whitespace-nowrap"
                      href={`/@${route.to_account}`}
                    >
                      {route.to_account}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(route.percent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {autoVestLabel(route.auto_vest)}
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

export default AccountWithdrawRoutesCard;
