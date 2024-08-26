import { useState } from "react";

import useAccountDetails from "@/api/accountPage/useAccountDetails";
import AccountMainCard from "./AccountMainCard";
import AccountDetailsCard from "./AccountDetailsCard";
import JSONCard from "../JSONCard";
import AccountAuthoritiesCard from "./AccountAuthoritiesCard";
import AccountWitnessVotesCard from "./AccountWitnessVotesCard";
import VotersDialog from "../Witnesses/VotersDialog";
import VotesHistoryDialog from "../Witnesses/VotesHistoryDialog";
import useWitnessDetails from "@/api/common/useWitnessDetails";
import AccountVestingDelegationsCard from "./AccountVestingDelegationsCard";
import AccountRcDelegationsCard from "./AccountRcDelegationsCard";
import AccountBalanceCard from "./AccountBalanceCard";
import { QueryObserverResult } from "@tanstack/react-query";
import Hive from "@/types/Hive"; 
import { config } from "@/Config";

interface AccountDetailsSectionProps {
  accountName: string;
  refetchAccountOperations: QueryObserverResult<Hive.AccountOperationsResponse>["refetch"]
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({
  accountName, refetchAccountOperations, liveDataEnabled, changeLiveRefresh,
}) => {
  const { accountDetails } = useAccountDetails(accountName, liveDataEnabled);
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
      <AccountAuthoritiesCard accountName={accountName} liveDataEnabled={liveDataEnabled}/>
      {!isWitnessDetailsError && (
        <AccountDetailsCard
          header="Witness Properties"
          userDetails={witnessDetails}
        />
      )}
      <AccountWitnessVotesCard voters={accountDetails.witness_votes} />
      <AccountVestingDelegationsCard
        delegatorAccount={accountName}
        startAccount={null}
        limit={config.maxDelegatorsCount}
        liveDataEnabled={liveDataEnabled}
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
      />
      <VotesHistoryDialog
        accountName={accountName}
        isVotesHistoryOpen={isVotesHistoryModalOpen}
        changeVoteHistoryDialogue={handleOpenVotesHistoryModal}
        liveDataEnabled={liveDataEnabled}
      />
    </>
  );
};

export default AccountDetailsSection;
