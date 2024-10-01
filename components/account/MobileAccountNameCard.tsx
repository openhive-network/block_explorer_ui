import Image from "next/image";

import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { Card, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";

interface MobileAccountNameCardProps {
  accountName: string;
  liveDataEnabled: boolean;
  accountDetails: Explorer.FormattedAccountDetails;
}

const MobileAccountNameCard: React.FC<MobileAccountNameCardProps> = ({
  accountName,
  liveDataEnabled,
  accountDetails,
}) => {
  if (!accountDetails) return;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between bg-explorer-gray-light dark:bg-explorer-gray-dark text-explorer-orange text-2xl my-4">
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
      </CardHeader>
    </Card>
  );
};

export default MobileAccountNameCard;
