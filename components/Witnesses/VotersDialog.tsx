import { useState, useEffect } from "react";
import Link from "next/link";
import { MoveDown, MoveUp, Loader2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { cn, formatNumber } from "@/lib/utils";
import useWitnessVoters from "@/hooks/api/common/useWitnessVoters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";
import LastUpdatedTooltip from "../LastUpdatedTooltip";
import { convertVestsToHP } from "@/utils/Calculations";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import NoResult from "../NoResult";
import DataCountMessage from "../DataCountMessage";
import Explorer from "@/types/Explorer";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import Hive from "@/types/Hive";

type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  changeVotersDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
  accountDetails?: Explorer.FormattedAccountDetails;
};

const tableColums = [
  { key: "voter", name: "Voter" },
  { key: "vests", name: "Votes", isRightAligned: true },
  { key: "account_vests", name: "Account", isRightAligned: true },
  { key: "proxied_vests", name: "Proxy", isRightAligned: true },
];

const VotersDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotersOpen,
  changeVotersDialogue,
  liveDataEnabled,
  accountDetails,
}) => {
  const [sortKey, setSortKey] = useState<string>("vests");
  const [isAsc, setIsAsc] = useState<boolean>(false);
  const [pageNum, setPageNum] = useState<number>(1);
  const [isHP, setIsHP] = useState<boolean>(true); // Toggle state

  const { witnessDetails } = useWitnessDetails(
    accountName,
    !!accountDetails?.is_witness
  );
  const { witnessVoters, isWitnessVotersLoading } = useWitnessVoters(
    accountName,
    isVotersOpen,
    isAsc,
    sortKey,
    liveDataEnabled,
    pageNum
  );
  const changeSorter = (newIsAsc: boolean, newSortKey: string) => {
    const isAscForChange = newSortKey === sortKey ? newIsAsc : false;
    setSortKey(newSortKey);
    setIsAsc(isAscForChange);
  };

  const onHeaderClick = (propertyKey: string) => {
    if (!changeSorter) return;

    changeSorter(!isAsc, propertyKey);
  };

  const showSorter = (columnName: string) => {
    if (columnName === sortKey) {
      return isAsc ? <MoveDown /> : <MoveUp />;
    } else return null;
  };

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
      setTotalVestingFundHive(
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive
      );
    }
  }, [dynamicGlobalData]);


  const fetchHivePower = (value: string, isHP: boolean): string => {
    if (isHP) {
      if (!hiveChain) return "";
      return convertVestsToHP(
        hiveChain,
        value,
        totalVestingFundHive,
        totalVestingShares
      );
    }
    return formatNumber(parseInt(value), true, false) + " Vests"; // Return raw vests if not toggled to HP
  };
  return (
    <Dialog
      open={isVotersOpen}
      onOpenChange={changeVotersDialogue}
    >
      <DialogContent
        className={`h-3/4 max-w-4xl bg-explorer-bg-start ${
          !witnessVoters && "flex justify-center items-center"
        }`}
        data-testid="voters-dialog"
      >
        {witnessVoters ? (
          <>
            <div>
              <div
                className="flex justify-center  items-centertext-center font-semibold	"
                data-testid="voters-dialog-witness-name"
              >
                {accountName.toUpperCase()} - Voters
                {isWitnessVotersLoading && (
                  <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
                )}
              </div>
              <div className="flex justify-between items-center w-full pt-4 pb-4">
                <div className="flex items-center">
                  {witnessDetails && (
                    <LastUpdatedTooltip
                      lastUpdatedAt={witnessDetails.votes_updated_at}
                    />
                  )}
                </div>

                <div className="flex items-center">
                  <label className="mr-2">Vests</label>
                  <Switch
                    checked={isHP}
                    onCheckedChange={() => setIsHP((prev) => !prev)}
                    className="mx-1"
                  />
                  <label>HP</label>
                </div>
              </div>
            </div>
            <CustomPagination
              currentPage={pageNum}
              onPageChange={(newPage: number) => {
                setPageNum(newPage);
              }}
              pageSize={config.standardPaginationSize}
              totalCount={witnessVoters.total_votes}
              className="rounded"
              isMirrored={false}
            />

            <div
              className={cn("flex justify-end items-center", {
                "justify-between": !!witnessVoters.total_votes,
              })}
            >
              <DataCountMessage
                count={witnessVoters.total_votes}
                dataType="voters"
              />
            </div>
            {witnessVoters?.voters?.length === 0 && !isWitnessVotersLoading ? (
              <div>
                <NoResult />
              </div>
            ) : (
              <>
                <Table className="text-white">
                  <TableHeader>
                    <TableRow>
                      {tableColums.map((column, index) => (
                        <TableHead
                          onClick={() => {
                            onHeaderClick(column.key);
                          }}
                          key={column.key}
                          className={cn({
                            "sticky md:static left-0": !index,
                          })}
                        >
                          <span
                            className={cn("flex", {
                              "justify-end": column.isRightAligned,
                            })}
                          >
                            {column.name} {showSorter(column.key)}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="voters-dialog-table-body">
                    {witnessVoters &&
                      witnessVoters.voters.map((voter, index) => (
                        <TableRow
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-rowEven" : "bg-rowOdd"
                          }`}
                        >
                          <TableCell className="text-link sticky md:static left-0 bg-inherit">
                            <Link
                              href={`/@${voter.voter_name}`}
                              data-testid="voter-name"
                            >
                              {voter.voter_name}
                            </Link>
                          </TableCell>
                          <TableCell
                            className="text-right"
                            data-testid="vote-power"
                          >
                            {fetchHivePower(voter.vests.toString(), isHP)}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            data-testid="account-power"
                          >
                            {fetchHivePower(
                              voter.account_vests.toString(),
                              isHP
                            )}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            data-testid="proxied-power"
                          >
                            {fetchHivePower(
                              voter.proxied_vests.toString(),
                              isHP
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </>
            )}
          </>
        ) : (
          <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VotersDialog;
