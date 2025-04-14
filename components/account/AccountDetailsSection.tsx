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
  const { witnessDetails, isWitnessDetailsLoading, isWitnessDetailsError } =
    useWitnessDetails(accountName, !!accountDetails?.is_witness);

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
        header="Wallet"
        userDetails={accountDetails}
      />
      <AccountBalanceHistoryCard
        header="Balance History"
        userDetails={accountDetails}
      />

      <AccountDetailsCard
        header="Properties"
        userDetails={accountDetails}
      />
      <JSONCard
        header="JSON Metadata"
        json={accountDetails.json_metadata}
        showCollapseButton={true}
      />
      <JSONCard
        header="Posting JSON Metadata"
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
            header="Witness Properties"
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
