import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import moment from "moment";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Hive from "@/types/Hive";
import useManabars from "@/api/accountPage/useManabars";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";

interface AccountMainCardProps {
  accountDetails: Hive.AccountDetailsQueryResponse;
  accountName: string;
  openVotersModal: () => void;
  openVotesHistoryModal: () => void;
}

const AccountMainCard: React.FC<AccountMainCardProps> = ({
  accountDetails,
  accountName,
  openVotersModal,
  openVotesHistoryModal,
}) => {
  const { manabarsData } = useManabars(accountName);
  return (
    <Card className="mx-2 pb-4" data-testid="account-details">
      <CardHeader className="px-4">
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
            />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          {!!manabarsData ? (
            <>
              <div className="text-center">
                <p className="my-2">Voting Power</p>
                <Progress
                  value={manabarsData?.upvote.percentageValue}
                  color="#00c040"
                  style={{ background: "#03182c" }}
                />
                <p className="text-sm text-gray-400">
                  {manabarsData?.upvote.current} / {manabarsData?.upvote.max}
                </p>
              </div>

              <div className="text-center">
                <p className="my-2">Downvote power </p>
                <Progress
                  value={manabarsData?.downvote.percentageValue}
                  color="#c01000"
                  style={{ background: "#03182c" }}
                />
                <p className="text-sm text-gray-400">
                  {manabarsData?.downvote.current} /{" "}
                  {manabarsData?.downvote.max}
                </p>
              </div>

              <div className="text-center">
                <p className="my-2">Resource credits </p>
                <Progress
                  value={manabarsData?.rc.percentageValue}
                  color="#cecafa"
                  style={{ background: "#03182c" }}
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
          <div className="flex justify-between p-5 break-all">
            <div className="text-center">
              <p className="text-xl">Posts</p>
              <p className="text-lg">{accountDetails.post_count}</p>
            </div>
            <div className="text-center">
              <p className="text-lg">Creation Date</p>
              <p className="text-lg">
                {moment(accountDetails.created).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
        </div>
        {accountDetails.is_witness && (
          <div className="flex justify-between">
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
        )}
      </CardContent>
    </Card>
  );
};

export default AccountMainCard;
