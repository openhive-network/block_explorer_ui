import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import moment from "moment";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Hive from "@/types/Hive";

interface AccountMainCardProps {
  accountDetails: Hive.AccountDetailsQueryResponse;
  accountName: string;
  openVotersModal: () => void;
}

const AccountMainCard: React.FC<AccountMainCardProps> = ({
  accountDetails,
  accountName,
  openVotersModal,
}) => {
  return (
    <div className='bg-explorer-dark-gray p-2 rounded-["6px] mx-6 h-fit rounded'>
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
        <div className="text-center">
          <p className="my-2">Voting Power</p>
          <Progress
            value={53}
            color="#cecafa"
            style={{ background: "#03182c" }}
          />
        </div>

        <div className="text-center">
          <p className="my-2">Downvote power </p>
          <Progress
            value={25}
            color="#cecafa"
            style={{ background: "#03182c" }}
          />
        </div>

        <div className="text-center">
          <p className="my-2">Recourse credits </p>
          <Progress
            value={75}
            color="#cecafa"
            style={{ background: "#03182c" }}
          />
        </div>
        <div className="flex justify-between p-5 break-all">
          <div className="text-center">
            <p className="text-xl">Reputation</p>
            <p className="text-lg">75</p>
            <p className="text-xs text-gray-500">
              {accountDetails.post_count} posts
            </p>
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
        <div className="flex justify-end">
          <button
            onClick={openVotersModal}
            className="bg-explorer-orange text-explorer-dark-gray rounded-[5px] p-2"
          >
            Show Voters
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMainCard;
