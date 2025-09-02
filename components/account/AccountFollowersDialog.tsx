import React, { useState, useMemo } from "react";
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
import useAccountFollowers from "@/hooks/api/accountPage/useAccountFollowers";

type FollowersDialogProps = {
  accountName: string;
  isFollowersOpen: boolean;
  changeFollowersDialogue: (isOpen: boolean) => void;
};

const AccountFollowersDialog: React.FC<FollowersDialogProps> = ({
  accountName,
  isFollowersOpen,
  changeFollowersDialogue,
}) => {
  const { t, dir } = useI18n();
  const [pageNum, setPageNum] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");
  const [isAsc, setIsAsc] = useState<boolean>(true);

  const {
    accountFollowers,
    isAccountFollowersLoading,
    isAccountFollowersError,
  } = useAccountFollowers(accountName, { enabled: isFollowersOpen });

  const processedFollowers = useMemo(() => {
    // If the data hasn't loaded yet, return an empty structure.
    if (!accountFollowers) {
      return { paginated: [], totalFiltered: 0, allFiltered: [] };
    }
    const followerNames = accountFollowers.map((f) => f.follower);
    const filtered = followerNames.filter((name) =>
      name.toLowerCase().includes(filter.toLowerCase())
    );
    const sorted = filtered.sort((a, b) =>
      isAsc ? a.localeCompare(b) : b.localeCompare(a)
    );
    const startIndex = (pageNum - 1) * config.standardPaginationSize;
    const endIndex = startIndex + config.standardPaginationSize;
    return {
      paginated: sorted.slice(startIndex, endIndex),
      totalFiltered: sorted.length,
      allFiltered: sorted,
    };
  }, [accountFollowers, pageNum, filter, isAsc]);

  const onHeaderClick = () => {
    setIsAsc((prev) => !prev);
    setPageNum(1);
  };

  const showSorter = () =>
    isAsc ? <ChevronDown size={15} /> : <ChevronUp size={15} />;

  const prepareExportData = () => {
    return processedFollowers.allFiltered.map((followerName) => ({
      [t("accountFollowersDialog.followerHeader")]: followerName,
    }));
  };

  return (
    <Dialog open={isFollowersOpen} onOpenChange={changeFollowersDialogue}>
      <DialogContent
        className="h-3/4 max-w-4xl bg-explorer-bg-start flex flex-col p-4 gap-y-0"
        data-testid="followers-dialog"
      >
        <h2 className="text-xl font-bold">
          {accountName.toUpperCase()} - {t("accountFollowersDialog.title")}
        </h2>

        {isAccountFollowersLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : isAccountFollowersError ? (
          <div className="flex justify-center items-center w-full h-full">
            <p className="text-red-500">{t("common.errorLoadingData")}</p>
          </div>
        ) : accountFollowers && accountFollowers.length === 0 ? (
          <NoResult />
        ) : (
          <>
            <div
              className={cn("flex items-center w-full", {
                "justify-start": dir !== "rtl",
                "justify-end": dir === "rtl",
              })}
            >
              <div className="relative w-full sm:w-auto my-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-explorer-dark-gray" />
                <Input
                  placeholder={t("accountFollowersDialog.searchPlaceholder")}
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
              totalCount={processedFollowers.totalFiltered}
              className="rounded-t"
              isMirrored={false}
            />
            <div
              className={cn("table-toolbar", {
                "justify-between": !!processedFollowers.totalFiltered,
                "justify-end": !processedFollowers.totalFiltered,
              })}
            >
              <DataCountMessage
                count={processedFollowers.totalFiltered}
                dataType={t("accountFollowersDialog.followersDataType")}
              />
              <DataExport
                data={prepareExportData()}
                filename={`${accountName}_followers.csv`}
              />
            </div>
            <div className="relative rounded-md flex-grow overflow-y-auto">
              <div className="text-text w-full h-full overflow-auto bg-theme rounded-md">
                {processedFollowers.paginated.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow rowVariant="header">
                        <TableHead
                          className="cursor-pointer"
                          onClick={onHeaderClick}
                        >
                          <span className="flex items-center gap-1">
                            {t("accountFollowersDialog.followerHeader")}{" "}
                            {showSorter()}
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedFollowers.paginated.map((followerName) => (
                        <TableRow key={followerName}>
                          <TableCell>
                            <Link
                              href={`/@${followerName}`}
                              className="flex items-center space-x-4 py-1 text-link hover:underline"
                            >
                              <Image
                                src={getHiveAvatarUrl(followerName)}
                                alt={followerName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <span className="font-medium">
                                {followerName}
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <NoResult
                    descriptionKey={t("accountFollowersDialog.noResultsFound")}
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

export default AccountFollowersDialog;
