import { Loader2 } from "lucide-react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faStar } from "@fortawesome/free-solid-svg-icons";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useManabars from "@/hooks/api/accountPage/useManabars";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Toggle } from "../ui/toggle";
import { Progress } from "@/components/ui/progress";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import { config } from "@/Config";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";

interface AccountMainCardProps {
  accountDetails: Explorer.FormattedAccountDetails;
  accountName: string;
  isWitnessError?: boolean;
  isWitnessLoading?: boolean;
  openVotersModal: () => void;
  openVotesHistoryModal: () => void;
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
}

const AccountMainCard: React.FC<AccountMainCardProps> = ({
  accountDetails,
  accountName,
  isWitnessError,
  isWitnessLoading,
  openVotersModal,
  openVotesHistoryModal,
  liveDataEnabled,
  changeLiveRefresh,
}) => {
  const { manabarsData } = useManabars(accountName, liveDataEnabled);
  const { witnessDetails } = useWitnessDetails(
    accountName,
    accountDetails.is_witness
  );
  const isWitnessActive =
    witnessDetails?.witness.signing_key !== config.inactiveWitnessKey;

  return (
    <Card data-testid="account-details">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-theme dark:bg-theme">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Image
              className="rounded-full border-2 border-explorer-orange"
              src={getHiveAvatarUrl(accountName)}
              alt="avatar"
              width={60}
              height={60}
              data-testid="user-avatar"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {accountDetails.name}
              </h2>
              {accountDetails.is_witness && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span
                    className={cn({
                      "line-through text-red-500": !isWitnessActive,
                    })}
                  >
                    Witness
                  </span>
                  {witnessDetails?.witness.rank && isWitnessActive && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faStar}
                              data-testid="witness-rank-icon"
                            />
                            <span>{witnessDetails.witness.rank}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">
                            Witness Rank: {witnessDetails.witness.rank}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {witnessDetails?.witness.url && isWitnessActive && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={witnessDetails.witness.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FontAwesomeIcon
                              icon={faLink}
                              data-testid="witness-url-icon"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">Witness Link</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Live Data Toggle */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0 top-0">
            <Toggle
              checked={liveDataEnabled}
              onClick={changeLiveRefresh}
              className="text-base"
              leftLabel="Live Data"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!!manabarsData ? (
          <>
            <div className="text-center">
              <p
                className="my-2"
                data-testid="voting-power"
              >
                Voting Power
              </p>
              <Progress
                value={manabarsData?.upvote.percentageValue}
                color="#00c040"
              />
              <p className="text-sm text-gray-400">
                {manabarsData?.upvote.current} / {manabarsData?.upvote.max}
              </p>
            </div>

            <div className="text-center">
              <p
                className="my-2"
                data-testid="downvote-power"
              >
                Downvote power{" "}
              </p>
              <Progress
                value={manabarsData?.downvote.percentageValue}
                color="#c01000"
              />
              <p className="text-sm text-gray-400">
                {manabarsData?.downvote.current} / {manabarsData?.downvote.max}
              </p>
            </div>

            <div className="text-center">
              <p
                className="my-2"
                data-testid="resources-credits"
              >
                Resource credits{" "}
              </p>
              <Progress
                value={manabarsData?.rc.percentageValue}
                color="#cecafa"
              />
              <p className="text-sm text-gray-400">
                {manabarsData?.rc.current} / {manabarsData?.rc.max}
              </p>
            </div>
          </>
        ) : (
          <div className="flex justify-center text-center items-center">
            <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3 ..." />
          </div>
        )}
        <div className="flex justify-between p-4">
          <div className="text-center flex flex-col justify-space-between w-full gap-2">
            <span className="text">Creation Date:</span>
            <span
              className="text" 
              data-testid="creation-date"
            >
              {formatAndDelocalizeTime(accountDetails.created)}
            </span>
          </div>
          <div className="text-center flex flex-col justify-space-between w-full gap-2">
            <span className="text">Reputation:</span>
            <span
              className="text" 
              data-testid="creation-date"
            >
              {accountDetails.reputation}
            </span>
          </div>
        </div>
      </CardContent>
      {!isWitnessError && !isWitnessLoading && (
        <CardFooter>
          <div className="w-full flex justify-between">
            <button
              onClick={openVotersModal}
              className="bg-explorer-orange text-explorer-gray-light dark:explorer-gray-dark rounded p-2"
            >
              Voters
            </button>
            <button
              onClick={openVotesHistoryModal}
              className="bg-explorer-orange text-explorer-gray-light dark:explorer-gray-dark rounded p-2"
            >
              Votes History
            </button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AccountMainCard;
