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

interface AccountDetailsSectionProps {
  accountName: string;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({
  accountName,
}) => {
  const { accountDetails } = useAccountDetails(accountName);
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
      <AccountAuthoritiesCard accountName={accountName} />
      {!isWitnessDetailsError && (
        <AccountDetailsCard
          header="Witness Properties"
          userDetails={witnessDetails}
        />
      )}
      <AccountWitnessVotesCard voters={accountDetails.witness_votes} />
      <VotersDialog
        accountName={accountName}
        isVotersOpen={isVotersModalOpen}
        changeVotersDialogue={handleOpenVotersModal}
      />
      <VotesHistoryDialog
        accountName={accountName}
        isVotesHistoryOpen={isVotesHistoryModalOpen}
        changeVoteHistoryDialogue={handleOpenVotesHistoryModal}
      />
    </>
  );
};

export default AccountDetailsSection;
