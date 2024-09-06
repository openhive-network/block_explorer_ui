import { Loader2 } from "lucide-react";
import Image from "next/image";

import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useManabars from "@/hooks/api/accountPage/useManabars";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Toggle } from "../ui/toggle";
import { Progress } from "@/components/ui/progress";

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

  return (
    <Card data-testid="account-details">
      <CardHeader>
        <div className="flex justify-between bg-explorer-dark-gray text-explorer-orange text-2xl my-4">
          {accountDetails.is_witness ? (
            <div data-testid="account-name">
              {accountDetails.name} <span className="text-sm">(witness)</span>
            </div>
          ) : (
            <div>{accountDetails.name}</div>
          )}
          <span>
            <Image
              className="rounded-full border-2 border-explorer-orange"
              src={getHiveAvatarUrl(accountName)}
              alt="avatar"
              width={50}
              height={50}
              data-testid="user-avatar"
            />
          </span>
        </div>
        <Toggle
          checked={liveDataEnabled}
          onClick={changeLiveRefresh}
          className="text-base"
          leftLabel="Live Data"
        />
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
                style={{ background: "#03182c", zIndex: 0 }}
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
                style={{ background: "#03182c", zIndex: 0 }}
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
                style={{ background: "#03182c", zIndex: 0 }}
              />
              <p className="text-sm text-gray-400">
                {manabarsData?.rc.current} / {manabarsData?.rc.max}
              </p>
            </div>
          </>
        ) : (
          <div className="flex justify-center text-center items-center">
            <Loader2 className="animate-spin mt-1h-12 w-12 ml-3 ..." />
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
              className="bg-explorer-orange text-explorer-dark-gray rounded p-2"
            >
              Voters
            </button>
            <button
              onClick={openVotesHistoryModal}
              className="bg-explorer-orange text-explorer-dark-gray rounded p-2"
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
