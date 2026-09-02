import { Card, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import { cn } from "@/lib/utils";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import { Link, Star } from "lucide-react";

import { useEffect, useState } from "react";
import { isBadActor } from "@/utils/badActors";
import ErrorMessage from "../ErrorMessage";
import { useI18n } from "@/i18n/i18n";
import HiveAvatar from "@/components/ui/HiveAvatar";

interface MobileAccountNameCardProps {
  accountName: string;
  communityName: string | undefined;
  liveDataEnabled: boolean;
  accountDetails: Explorer.FormattedAccountDetails;
}

const MobileAccountNameCard: React.FC<MobileAccountNameCardProps> = ({
  accountName,
  communityName,
  liveDataEnabled,
  accountDetails,
}) => {
  const { t } = useI18n();
  const { witnessDetails } = useWitnessDetails(
    accountName,
    accountDetails.is_witness
  );
  const isWitnessActive =
    witnessDetails?.signing_key !== config.inactiveWitnessKey;

  // Only the dismissal needs state; the flag itself is a pure lookup. The old
  // effect only ever set it true, so a flagged account's warning carried over
  // to the next, clean account.
  const [warningDismissed, setWarningDismissed] = useState(false);
  useEffect(() => {
    setWarningDismissed(false);
  }, [accountName]);
  const showBadActorWarning = isBadActor(accountName) && !warningDismissed;

  const handleCloseWarning = () => {
    setWarningDismissed(true);
  };

  if (!accountDetails) return;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-theme dark:bg-theme">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <HiveAvatar
              accountName={accountName}
              size={60}
              alt="avatar"
              className="rounded-full border-2 border-explorer-orange"
              data-testid="user-avatar"
            />
            <div>
              <h1
                className="text-lg font-semibold text-gray-800 dark:text-white"
                data-testid="account-name"
              >
                {communityName ? communityName : accountDetails.name}
              </h1>
              {accountDetails.is_witness && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span
                    className={cn({
                      "line-through text-red-500": !isWitnessActive,
                    })}
                  >
                    {t("accountMainCard.witness")}
                  </span>
                  {witnessDetails?.rank && isWitnessActive && (
                    <span className="flex items-center gap-1">
                      <Star
                        data-testid="witness-rank-icon"
                        fill="currentColor"
                        size={16}
                      />
                      <span>{witnessDetails.rank}</span>
                    </span>
                  )}
                  {witnessDetails?.url && isWitnessActive && (
                    <a
                      href={witnessDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link size={15} strokeWidth={3} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Warning Message */}
        <div>
          {showBadActorWarning && (
            <ErrorMessage
              message={t("accountMainCard.badActorMessage")}
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
