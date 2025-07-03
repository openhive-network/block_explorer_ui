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

interface AccountDetailsSectionProps {
  accountName: string;
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
  accountDetails?: Explorer.FormattedAccountDetails;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({
  accountName,
  liveDataEnabled,
  changeLiveRefresh,
  accountDetails,
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

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };
  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  };

  if (!accountDetails) {
    return;
  }

  return (
    <>
      <AccountMainCard
        accountDetails={accountDetails}
        accountName={accountName}
        openVotersModal={handleOpenVotersModal}
        openVotesHistoryModal={handleOpenVotesHistoryModal}
        isWitnessError={isWitnessDetailsError}
        isWitnessLoading={isWitnessDetailsLoading}
        liveDataEnabled={liveDataEnabled}
        changeLiveRefresh={changeLiveRefresh}
      />
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
    </>
  );
};

export default AccountDetailsSection;
