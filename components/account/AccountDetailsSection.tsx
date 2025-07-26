import { useState } from "react";

import { config } from "@/Config";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import AccountMainCard from "./AccountMainCard";
import AccountDetailsCard from "./AccountDetailsCard";
import JSONCard from "../JSONCard";
import AccountAuthoritiesCard from "./AccountAuthoritiesCard";
import AccountWitnessVotesCard from "./AccountWitnessVotesCard";
import VotersDialog from "../Witnesses/VotersDialog";
import VotesHistoryDialog from "../Witnesses/VotesHistoryDialog";
import AccountVestingDelegationsCard from "./AccountVestingDelegationsCard";
import AccountRcDelegationsCard from "./AccountRcDelegationsCard";
import AccountBalanceCard from "./AccountBalanceCard";
import Explorer from "@/types/Explorer";
import AccountBalanceHistoryCard from "./AccountBalanceHistoryCard";
import AccountRecurrentTransfersCard from "./AccountRecurrentTransfersCard";
import useAccountRecurrentTransfers from "@/hooks/api/accountPage/useAccoutRecurrentTransfers";
import { AllTransfers } from "./AccountRecurrentTransfersCard";
import { useI18n } from "@/i18n/i18n";
import AccountFollowersDialog from "./AccountFollowersDialog";
import AccountFollowingDialog from "./AccountFollowingDialog";
import AccountSubscriptionsDialog from "./AccountSubscriptionsDialog";
import Hive from "@/types/Hive";
import CommunityMainCard from "./CommunityMainCard";

interface AccountDetailsSectionProps {
  accountName: string;
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
  accountDetails?: Explorer.FormattedAccountDetails;
  communityDetails?: Hive.CommunityDetails;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({
  accountName,
  liveDataEnabled,
  changeLiveRefresh,
  accountDetails,
  communityDetails,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const { witnessDetails, isWitnessDetailsLoading, isWitnessDetailsError } =
    useWitnessDetails(accountName, !!accountDetails?.is_witness);

  const { recurrentTransfers } = useAccountRecurrentTransfers(
    accountName,
    liveDataEnabled
  );

  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);
  const [isAccountFollowersModalOpen, setIsAccountFollowersModalOpen] = useState(false);
  const [isAccountFollowingModalOpen , setIsAccountFollowingModalOpen] = useState(false);
  const [isAccountSubscriptionModalOpen , setIsAccountSubscriptionModalOpen] = useState(false);

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };
  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  };
  const handleOpenAccountFollowersModal = () => {
    setIsAccountFollowersModalOpen(!isAccountFollowersModalOpen);
  };
  const handleOpenAccountFollowingModal = () => {
    setIsAccountFollowingModalOpen(!isAccountFollowingModalOpen);
  };
  const handleOpenAccountSubscriptionModal = () => {
    setIsAccountSubscriptionModalOpen(!isAccountSubscriptionModalOpen);
  };

  if (!accountDetails) {
    return;
  }

  const isCommunity = !!communityDetails;

  return (
    <>
      {isCommunity ? (
        <>
          <CommunityMainCard
            communityDetails={communityDetails}
            accountDetails={accountDetails}
            liveDataEnabled={liveDataEnabled}
            changeLiveRefresh={changeLiveRefresh}
          />
          <AccountMainCard
            isForCommunity={true}
            accountDetails={accountDetails}
            accountName={accountName}
            openVotersModal={handleOpenVotersModal}
            openVotesHistoryModal={handleOpenVotesHistoryModal}
            openFollowersModal={handleOpenAccountFollowersModal}
            openFollowingModal={handleOpenAccountFollowingModal}
            openSubscriptionsModal={handleOpenAccountSubscriptionModal}
            liveDataEnabled={liveDataEnabled}
            changeLiveRefresh={changeLiveRefresh}
          />
        </>
      ) : (
        <AccountMainCard
          accountDetails={accountDetails}
          accountName={accountName}
          openVotersModal={handleOpenVotersModal}
          openVotesHistoryModal={handleOpenVotesHistoryModal}
          openFollowersModal={handleOpenAccountFollowersModal}
          openFollowingModal={handleOpenAccountFollowingModal}
          openSubscriptionsModal={handleOpenAccountSubscriptionModal}
         isWitnessError={isWitnessDetailsError}
         isWitnessLoading={isWitnessDetailsLoading}
          liveDataEnabled={liveDataEnabled}
          changeLiveRefresh={changeLiveRefresh}
        />
        )}
      <AccountBalanceCard
        header={t("accountDetailsSection.wallet")}
        userDetails={accountDetails}
      />
      <AccountBalanceHistoryCard
        header={t("accountDetailsSection.balanceHistory")}
        userDetails={accountDetails}
      />

      <AccountDetailsCard
        header={t("accountDetailsSection.properties")}
        userDetails={accountDetails}
      />
      <JSONCard
        header={t("accountDetailsSection.jsonMetadata")}
        json={accountDetails.json_metadata}
        showCollapseButton={true}
      />
      <JSONCard
        header={t("accountDetailsSection.postingJsonMetadata")}
        json={accountDetails.posting_json_metadata}
        showCollapseButton={true}
      />
      <AccountAuthoritiesCard
        accountName={accountName}
        liveDataEnabled={liveDataEnabled}
      />
      {accountDetails.is_witness &&
        !isWitnessDetailsError &&
        !!witnessDetails && (
          <AccountDetailsCard
            header={t("accountDetailsSection.witnessProperties")}
            userDetails={witnessDetails}
          />
        )}
      <AccountWitnessVotesCard
        voters={accountDetails.witness_votes}
        accountName={accountName}
        proxy={accountDetails.proxy}
      />
      <AccountVestingDelegationsCard
        direction="outgoing"
        delegatorAccount={accountName}
        liveDataEnabled={liveDataEnabled}
        dynamicGlobalData={dynamicGlobalData}
      />
      <AccountVestingDelegationsCard
        direction="incoming"
        delegatorAccount={accountName}
        liveDataEnabled={liveDataEnabled}
        dynamicGlobalData={dynamicGlobalData}
      />
      <AccountRcDelegationsCard
        delegatorAccount={accountName}
        limit={config.maxDelegatorsCount}
        liveDataEnabled={liveDataEnabled}
      />
      <AccountRecurrentTransfersCard
        direction="outgoing"
        transfers={
          recurrentTransfers?.outgoing_recurrent_transfers as AllTransfers[]
        }
      />
      <AccountRecurrentTransfersCard
        direction="incoming"
        transfers={
          recurrentTransfers?.incoming_recurrent_transfers as AllTransfers[]
        }
      />
      <VotersDialog
        accountName={accountName}
        isVotersOpen={isVotersModalOpen}
        changeVotersDialogue={handleOpenVotersModal}
        liveDataEnabled={liveDataEnabled}
        accountDetails={accountDetails}
      />
      <VotesHistoryDialog
        accountName={accountName}
        isVotesHistoryOpen={isVotesHistoryModalOpen}
        changeVoteHistoryDialogue={handleOpenVotesHistoryModal}
        liveDataEnabled={liveDataEnabled}
        accountDetails={accountDetails}
      />
      <AccountFollowersDialog
        accountName={accountName}
        isFollowersOpen={isAccountFollowersModalOpen}
        changeFollowersDialogue={handleOpenAccountFollowersModal}
      />
      <AccountFollowingDialog
        accountName={accountName}
        isFollowingOpen={isAccountFollowingModalOpen}
        changeFollowingDialogue={handleOpenAccountFollowingModal}
      />
      <AccountSubscriptionsDialog
        accountName={accountName}
        isSubscriptionsOpen={isAccountSubscriptionModalOpen}
        changeSubscriptionsDialogue={handleOpenAccountSubscriptionModal}
        subscriptions={accountDetails.subscriptions}
      />
    </>
  );
};

export default AccountDetailsSection;
