import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import moment from "moment";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Hive from "@/types/Hive";
import useManabars from "@/api/accountPage/useManabars";

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
  const {manabarsData} = useManabars(accountName);
  return (
    <div className='bg-explorer-dark-gray p-2 rounded-["6px] mx-2 md:mx-6 h-fit rounded'>
      <div className="flex justify-between bg-explorer-dark-gray text-explorer-orange text-2xl my-4">
        {accountDetails.is_witness ? (
          <div>
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
      <div>
        <div className="text-center">
          <p className="text-xl">Vote weight</p>
          <p className="text-lg">50</p>
        </div>
        {!!manabarsData &&
          <>
            <div className="text-center">
              <p className="my-2">Voting Power</p>
              <Progress
                value={manabarsData?.upvote.percentageValue}
                color="#00c040"
                style={{ background: "#03182c" }}
              />
              <p className="text-sm text-gray-400">{manabarsData?.upvote.current} / {manabarsData?.upvote.max}</p>
            </div>

            <div className="text-center">
              <p className="my-2">Downvote power </p>
              <Progress
                value={manabarsData?.downvote.percentageValue}
                color="#c01000"
                style={{ background: "#03182c" }}
              />
              <p className="text-sm text-gray-400">{manabarsData?.downvote.current} / {manabarsData?.downvote.max}</p>
            </div>

            <div className="text-center">
              <p className="my-2">Recourse credits </p>
              <Progress
                value={manabarsData?.rc.percentageValue}
                color="#cecafa"
                style={{ background: "#03182c" }}
              />
              <p className="text-sm text-gray-400">{manabarsData?.rc.current} / {manabarsData?.rc.max}</p>
            </div>
          </>
        }
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
            className="bg-explorer-orange text-explorer-dark-gray rounded-[5px] p-2"
          >
            Voters
          </button>
          <button
            onClick={openVotesHistoryModal}
            className="bg-explorer-orange text-explorer-dark-gray rounded-[5px] p-2"
          >
            Votes History
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMainCard;
