import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { config } from "@/Config";
import useAccountFollowing from "@/hooks/api/accountPage/useAccountFollowing";

type FollowingDialogProps = {
  accountName: string;
  isFollowingOpen: boolean;
  changeFollowingDialogue: (isOpen: boolean) => void;
};

const AccountFollowingDialog: React.FC<FollowingDialogProps> = ({
  accountName,
  isFollowingOpen,
  changeFollowingDialogue,
}) => {
  // HIGHLIGHT: Added 'dir' to get the text direction. This is required for the logic.
  const { t, dir } = useI18n();

  const [pageNum, setPageNum] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");
  const [isAsc, setIsAsc] = useState<boolean>(true);

  const {
    accountFollowing,
    isAccountFollowingLoading,
    isAccountFollowingError,
  } = useAccountFollowing(accountName, { enabled: isFollowingOpen });
  const processedFollowing = useMemo(() => {
    if (!accountFollowing)
      return { paginated: [], totalFiltered: 0, allFiltered: [] };

    const followingNames = accountFollowing.map((f) => f.following);

    const filtered = followingNames.filter((name) =>
      name.toLowerCase().includes(filter.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      return isAsc ? a.localeCompare(b) : b.localeCompare(a);
    });

    const startIndex = (pageNum - 1) * config.standardPaginationSize;
    const endIndex = startIndex + config.standardPaginationSize;

    return {
      paginated: sorted.slice(startIndex, endIndex),
      totalFiltered: sorted.length,
      allFiltered: sorted,
    };
  }, [accountFollowing, pageNum, filter, isAsc]);

  const onHeaderClick = () => {
    setIsAsc((prev) => !prev);
    setPageNum(1);
  };

  const showSorter = () => {
    return isAsc ? <ChevronDown size={15} /> : <ChevronUp size={15} />;
  };

  const prepareExportData = () => {
    return processedFollowing.allFiltered.map((followingName) => ({
      [t("accountFollowingDialog.followingHeader")]: followingName,
    }));
  };

  return (
    <Dialog
      open={isFollowingOpen}
      onOpenChange={changeFollowingDialogue}
    >
      <DialogContent
        className="h-3/4 max-w-4xl bg-explorer-bg-start flex flex-col p-4"
        data-testid="following-dialog"
      >
        <h2 className="text-xl font-bold">
          {t("accountFollowingDialog.title")} - @{accountName.toUpperCase()}{" "}
        </h2>

        {isAccountFollowingLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : isAccountFollowingError ? (
          <div className="flex justify-center items-center w-full h-full">
            <p className="text-red-500">{t("common.errorLoadingData")}</p>
          </div>
        ) : accountFollowing && accountFollowing.length === 0 ? (
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
                  placeholder={t("accountFollowingDialog.searchPlaceholder")}
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
              totalCount={processedFollowing.totalFiltered}
              className="rounded"
              isMirrored={false}
            />

            <div
              className={cn("table-toolbar", {
                "justify-between": !!processedFollowing.totalFiltered,
                "justify-end": !processedFollowing.totalFiltered,
              })}
            >
              <DataCountMessage
                count={processedFollowing.totalFiltered}
                dataType={t("accountFollowingDialog.followingDataType")}
              />
              <DataExport
                data={prepareExportData()}
                filename={`${accountName}_${t(
                  "accountFollowingDialog.followingDataType"
                ).toLowerCase()}.csv`}
              />
            </div>

            <div className="relative rounded-md flex-grow overflow-y-auto">
              <div className="text-text w-full h-full overflow-auto bg-theme rounded-md">
                {processedFollowing.paginated.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow rowVariant="header">
                        <TableHead
                          className="cursor-pointer"
                          onClick={onHeaderClick}
                        >
                          <span className="flex items-center gap-1">
                            {t("accountFollowingDialog.followingHeader")}{" "}
                            {showSorter()}
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedFollowing.paginated.map((followingName) => (
                        <TableRow key={followingName}>
                          <TableCell>
                            <Link
                              href={`/@${followingName}`}
                              className="flex items-center space-x-4 py-1 text-link hover:underline"
                            >
                              <Image
                                src={getHiveAvatarUrl(followingName)}
                                alt={followingName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <span className="font-medium">
                                {followingName}
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <NoResult
                    descriptionKey={t("accountFollowingDialog.noResultsFound")}
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

export default AccountFollowingDialog;
