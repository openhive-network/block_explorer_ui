import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { Card, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import { cn } from "@/lib/utils";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import { Link, Star } from "lucide-react";

import { useEffect, useState } from "react";
import list from '../../utils/BadActorList';
import ErrorMessage from "../ErrorMessage";
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
  const { witnessDetails } = useWitnessDetails(
    accountName,
    accountDetails.is_witness
  );
  const isWitnessActive =
    witnessDetails?.witness.signing_key !== config.inactiveWitnessKey;

  const [isBadActor, setIsBadActor] = useState(false);
  useEffect(() => {
       // Check if the accountName is in the list
       if (list.includes(accountName)) {
           setIsBadActor(true);
       }
   }, [accountName]);

  const handleCloseWarning = () => {
       setIsBadActor(false); // Clear the error by setting state to false
   };

  if (!accountDetails) return;

  const [isBadActor, setIsBadActor] = useState(false);
  useEffect(() => {
       // Check if the accountName is in the list
       if (list.includes(accountName)) {
           setIsBadActor(true);
       }
   }, [accountName]);

  const handleCloseWarning = () => {
       setIsBadActor(false); // Clear the error by setting state to false
   };

  return (
    <Card>
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white" data-testid="account-name">
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
                    <span className="flex items-center gap-1">
                      <Star 
                        data-testid="witness-rank-icon"
                        fill="currentColor"
                        size={16}
                        />
                      <span>{witnessDetails.witness.rank}</span>
                    </span>
                  )}
                  {witnessDetails?.witness.url && isWitnessActive && (
                    <a
                      href={witnessDetails.witness.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link 
                        size={15}
                        strokeWidth={3}
                      />
                    </a>
                  )}
                </div>
              )}
            </div>            
          </div>
        </div>
         {/* Warning Message */}
         <div>
            {isBadActor && (
              <ErrorMessage
                message="This account is listed as a potential bad actor. Please exercise caution."
                isWarning={true}
                onClose={handleCloseWarning}
              />
            )}
          </div>
      </CardHeader>
    </Card>
  );
};

export default MobileAccountNameCard;
