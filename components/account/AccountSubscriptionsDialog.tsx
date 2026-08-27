import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import CustomPagination from "../CustomPagination";
import NoResult from "../NoResult";
import DataCountMessage from "../DataCountMessage";
import DataExport from "../DataExport";
import { cn } from "@/lib/utils";

import { useI18n } from "@/i18n/i18n";
import { config } from "@/Config";
import HiveAvatar from "@/components/ui/HiveAvatar";

type SubscriptionsDialogProps = {
  accountName: string;
  isSubscriptionsOpen: boolean;
  changeSubscriptionsDialogue: (isOpen: boolean) => void;
  subscriptions: string[] | null;
};

const AccountSubscriptionsDialog: React.FC<SubscriptionsDialogProps> = ({
  accountName,
  isSubscriptionsOpen,
  changeSubscriptionsDialogue,
  subscriptions,
}) => {
  const { t, dir } = useI18n();

  const [pageNum, setPageNum] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");
  const [isAsc, setIsAsc] = useState<boolean>(true);

  const processedSubscriptions = useMemo(() => {
    if (!subscriptions)
      return { paginated: [], totalFiltered: 0, allFiltered: [] };

    const filtered = subscriptions
      .map((sub) => ({
        id: sub[0],
        name: sub[1],
      }))
      .filter((community) =>
        community.name.toLowerCase().includes(filter.toLowerCase())
      );

    const sorted = filtered.sort((a, b) => {
      return isAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    const startIndex = (pageNum - 1) * config.standardPaginationSize;
    const endIndex = startIndex + config.standardPaginationSize;

    return {
      paginated: sorted.slice(startIndex, endIndex),
      totalFiltered: sorted.length,
      allFiltered: sorted,
    };
  }, [subscriptions, pageNum, filter, isAsc]);

  const onHeaderClick = () => {
    setIsAsc((prev) => !prev);
    setPageNum(1);
  };

  const showSorter = () => {
    return isAsc ? <ChevronDown size={15} /> : <ChevronUp size={15} />;
  };

  const prepareExportData = () => {
    return processedSubscriptions.allFiltered.map((community) => ({
      [t("accountSubscriptionsDialog.communityID")]: community.id,
      [t("accountSubscriptionsDialog.communityHeader")]: community.name,
    }));
  };

  return (
    <Dialog
      open={isSubscriptionsOpen}
      onOpenChange={changeSubscriptionsDialogue}
    >
      <DialogContent
        className="h-3/4 max-w-4xl bg-explorer-bg-start flex flex-col p-4 gap-y-0"
        data-testid="subscriptions-dialog"
      >
        <h2 className="text-xl font-bold">
          {accountName.toUpperCase()} - {t("accountSubscriptionsDialog.title")}
        </h2>

        {!subscriptions ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : subscriptions.length === 0 ? (
          <NoResult />
        ) : (
          <>
            <div
              className={cn("flex items-center w-full mb-2", {
                "justify-start": dir !== "rtl",
                "justify-end": dir === "rtl",
              })}
            >
              <div className="relative w-full sm:w-auto my-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-explorer-dark-gray" />
                <Input
                  placeholder={t(
                    "accountSubscriptionsDialog.searchPlaceholder"
                  )}
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPageNum(1);
                  }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>

            <CustomPagination
              currentPage={pageNum}
              onPageChange={setPageNum}
              pageSize={config.standardPaginationSize}
              totalCount={processedSubscriptions.totalFiltered}
              className="rounded"
              isMirrored={false}
            />

            <div
              className={cn("table-toolbar", {
                "justify-between": !!processedSubscriptions.totalFiltered,
                "justify-end": !processedSubscriptions.totalFiltered,
              })}
            >
              <DataCountMessage
                count={processedSubscriptions.totalFiltered}
                dataType={t("accountSubscriptionsDialog.subscriptionsDataType")}
              />
              <DataExport
                data={prepareExportData()}
                filename={`${accountName}_${t(
                  "accountSubscriptionsDialog.subscriptionsDataType"
                ).toLowerCase()}.csv`}
              />
            </div>

            <div className="relative rounded-md flex-grow overflow-y-auto">
              <div className="text-text w-full h-full overflow-auto bg-theme rounded-md">
                {processedSubscriptions.paginated.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow rowVariant="header">
                        <TableHead
                          className="cursor-pointer"
                          onClick={onHeaderClick}
                        >
                          <span className="flex items-center gap-1">
                            {t("accountSubscriptionsDialog.communityHeader")}{" "}
                            {showSorter()}
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedSubscriptions.paginated.map((community) => (
                        <TableRow key={community.id}>
                          <TableCell>
                            <Link
                              href={`/@${community.id}`}
                              className="flex items-center space-x-4 py-1 text-link hover:underline"
                              target="_blank"
                            >
                              <HiveAvatar
                                accountName={community.id}
                                alt={community.name}
                                size={40}
                              />
                              <span className="font-medium">
                                {community.name}
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <NoResult
                    descriptionKey={t(
                      "accountSubscriptionsDialog.noResultsFound"
                    )}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccountSubscriptionsDialog;
