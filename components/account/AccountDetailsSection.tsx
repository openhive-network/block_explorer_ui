import { useState, useMemo } from "react";

import { config } from "@/Config";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import useRcDelegations from "@/hooks/api/common/useRcDelegations";
import AccountMainCard from "./AccountMainCard";
import AccountDetailsCard from "./AccountDetailsCard";
import JSONCard from "../JSONCard";
import AccountAuthoritiesCard from "./AccountAuthoritiesCard";
import AccountWitnessVotesCard from "./AccountWitnessVotesCard";
import VotersDialog from "../Witnesses/VotersDialog";
import VotesHistoryDialog from "../Witnesses/VotesHistoryDialog";
import AccountVestingDelegationsCard from "./AccountVestingDelegationsCard";
import AccountRcDelegationsCard from "./AccountRcDelegationsCard";
import AccountBalanceCard from "./AccountBalanceCard/AccountBalanceCard";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Wallet,
  ArrowRightLeft,
  Gavel,
  FileText,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";
import useProxyPower from "@/hooks/api/accountPage/useProxyPower";
import AccountProxyPowerCard from "./AccountProxyPowerCard"; // <-- 1. Import the new card

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
  const { settings } = useSettings();
  const [areAllCardsOpen, setAreAllCardsOpen] = useState(false);

  const { witnessDetails, isWitnessDetailsLoading, isWitnessDetailsError } =
    useWitnessDetails(accountName, !!accountDetails?.is_witness);

  const { recurrentTransfers } = useAccountRecurrentTransfers(
    accountName,
    liveDataEnabled
  );

  const outgoingVestingDelegations = useConvertedVestingShares(
    "outgoing",
    accountName,
    liveDataEnabled,
    dynamicGlobalData
  );

  const incomingVestingDelegations = useConvertedVestingShares(
    "incoming",
    accountName,
    liveDataEnabled,
    dynamicGlobalData
  );

  const { rcDelegationsData } = useRcDelegations(
    accountName,
    config.maxDelegatorsCount,
    liveDataEnabled
  );

  const { accountProxyPower } = useProxyPower(accountName, 1);

  const hasDelegationsContent = useMemo(() => {
    const hasOutgoingVesting =
      outgoingVestingDelegations && outgoingVestingDelegations.length > 0;
    const hasIncomingVesting =
      incomingVestingDelegations && incomingVestingDelegations.length > 0;
    const hasRc = rcDelegationsData && rcDelegationsData.length > 0;
    return hasOutgoingVesting || hasIncomingVesting || hasRc;
  }, [
    outgoingVestingDelegations,
    incomingVestingDelegations,
    rcDelegationsData,
  ]);

  const hasGovernanceContent = useMemo(() => {
    const hasWitnessVotes =
      (accountDetails?.witness_votes &&
        accountDetails.witness_votes.length > 0) ||
      !!accountDetails?.proxy;
    const hasProxyPower = accountProxyPower && accountProxyPower.length > 0;
    return hasWitnessVotes || !!accountDetails?.is_witness || hasProxyPower;
  }, [accountDetails, accountProxyPower]);

  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);
  const [isAccountFollowersModalOpen, setIsAccountFollowersModalOpen] =
    useState(false);
  const [isAccountFollowingModalOpen, setIsAccountFollowingModalOpen] =
    useState(false);
  const [isAccountSubscriptionModalOpen, setIsAccountSubscriptionModalOpen] =
    useState(false);

  const handleOpenVotersModal = () => setIsVotersModalOpen(!isVotersModalOpen);
  const handleOpenVotesHistoryModal = () =>
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  const handleOpenAccountFollowersModal = () =>
    setIsAccountFollowersModalOpen(!isAccountFollowersModalOpen);
  const handleOpenAccountFollowingModal = () =>
    setIsAccountFollowingModalOpen(!isAccountFollowingModalOpen);
  const handleOpenAccountSubscriptionModal = () =>
    setIsAccountSubscriptionModalOpen(!isAccountSubscriptionModalOpen);

  const [tabExpandedStates, setTabExpandedStates] = useState({
    wallet: true,
    delegations: false,
    governance: false,
    profile: false,
  });

  const handleTabToggleAll = (tab: keyof typeof tabExpandedStates) => {
    setTabExpandedStates((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  if (!accountDetails) {
    return null;
  }

  const isCommunity = !!communityDetails;

  const CollapsibleCards = ({
    isInitiallyOpen,
  }: {
    isInitiallyOpen: boolean;
  }) => (
    <div className="space-y-4">
      <AccountRecurrentTransfersCard
        direction="outgoing"
        transfers={
          recurrentTransfers?.outgoing_recurrent_transfers as AllTransfers[]
        }
        isInitiallyOpen={isInitiallyOpen}
        accountName={accountName}
      />
      <AccountRecurrentTransfersCard
        direction="incoming"
        transfers={
          recurrentTransfers?.incoming_recurrent_transfers as AllTransfers[]
        }
        isInitiallyOpen={isInitiallyOpen}
        accountName={accountName}
      />
      <AccountVestingDelegationsCard
        direction="outgoing"
        delegations={outgoingVestingDelegations}
        dynamicGlobalData={dynamicGlobalData}
        isInitiallyOpen={isInitiallyOpen}
        accountName={accountName}
      />
      <AccountVestingDelegationsCard
        direction="incoming"
        delegations={incomingVestingDelegations}
        dynamicGlobalData={dynamicGlobalData}
        isInitiallyOpen={isInitiallyOpen}
        accountName={accountName}
      />
      <AccountRcDelegationsCard
        delegations={rcDelegationsData}
        isInitiallyOpen={isInitiallyOpen}
        accountName={accountName}
      />
      <AccountWitnessVotesCard
        voters={accountDetails.witness_votes}
        accountName={accountName}
        proxy={accountDetails.proxy}
        isInitiallyOpen={isInitiallyOpen}
      />
      <AccountProxyPowerCard
        accountName={accountName}
        isInitiallyOpen={isInitiallyOpen}
        dynamicGlobalData={dynamicGlobalData}
      />
      {accountDetails.is_witness &&
        !isWitnessDetailsError &&
        !!witnessDetails && (
          <AccountDetailsCard
            header={t("accountDetailsSection.witnessProperties")}
            userDetails={witnessDetails}
            isInitiallyOpen={isInitiallyOpen}
          />
        )}
      <AccountDetailsCard
        header={t("accountDetailsSection.properties")}
        userDetails={accountDetails}
        isInitiallyOpen={isInitiallyOpen}
      />
      <JSONCard
        header={t("accountDetailsSection.jsonMetadata")}
        json={accountDetails.json_metadata}
        showCollapseButton={true}
        isInitiallyOpen={isInitiallyOpen}
      />
      <JSONCard
        header={t("accountDetailsSection.postingJsonMetadata")}
        json={accountDetails.posting_json_metadata}
        showCollapseButton={true}
        isInitiallyOpen={isInitiallyOpen}
      />
      <AccountAuthoritiesCard
        accountName={accountName}
        liveDataEnabled={liveDataEnabled}
        isInitiallyOpen={isInitiallyOpen}
      />
    </div>
  );

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
            isWitnessError={isWitnessDetailsError}
            isWitnessLoading={isWitnessDetailsLoading}
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

      {settings.accountPageView === "tabbed" ? (
        <div className="bg-explorer-slate rounded-lg border border-slate-200 dark:border-slate-800 p-3 mt-4">
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-0 bg-transparent rounded-none gap-x-1">
              <TabsTrigger
                value="wallet"
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-rowHover data-[state=active]:text-explorer-slate data-[state=active]:font-semibold hover:bg-rowHover transition-all data-[state=active]:border-t-4 data-[state=active]:border-t-green-500"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-xs">
                  {t("accountDetailsSection.wallet")}
                </span>
              </TabsTrigger>
              {hasDelegationsContent && (
                <TabsTrigger
                  value="delegations"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-rowHover data-[state=active]:text-explorer-slate data-[state=active]:font-semibold hover:bg-rowHover transition-all data-[state=active]:border-t-4 data-[state=active]:border-t-green-500"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  <span className="text-xs">
                    {t("accountDetailsSection.delegations")}
                  </span>
                </TabsTrigger>
              )}
              {hasGovernanceContent && (
                <TabsTrigger
                  value="governance"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-rowHover data-[state=active]:text-explorer-slate data-[state=active]:font-semibold hover:bg-rowHover transition-all data-[state=active]:border-t-4 data-[state=active]:border-t-green-500"
                >
                  <Gavel className="w-5 h-5" />
                  <span className="text-xs">
                    {t("accountDetailsSection.governance")}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="profile"
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-rowHover data-[state=active]:text-explorer-slate data-[state=active]:font-semibold hover:bg-rowHover transition-all data-[state=active]:border-t-4 data-[state=active]:border-t-green-500"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">
                  {t("accountDetailsSection.profile")}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet">
              <div className="flex items-center gap-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTabToggleAll("wallet")}
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {tabExpandedStates.wallet
                          ? t("accountDetailsSection.collapseAll")
                          : t("accountDetailsSection.expandAll")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                key={tabExpandedStates.wallet ? "wallet-open" : "wallet-closed"}
                className="space-y-4"
              >
                <AccountBalanceCard
                  header={t("accountDetailsSection.wallet")}
                  userDetails={accountDetails}
                  isInitiallyOpen={tabExpandedStates.wallet}
                />
                <AccountBalanceHistoryCard
                  header={t("accountDetailsSection.balanceHistory")}
                  userDetails={accountDetails}
                  isInitiallyOpen={tabExpandedStates.wallet}
                />
                <AccountRecurrentTransfersCard
                  direction="outgoing"
                  transfers={
                    recurrentTransfers?.outgoing_recurrent_transfers as AllTransfers[]
                  }
                  isInitiallyOpen={tabExpandedStates.wallet}
                  accountName={accountName}
                />
                <AccountRecurrentTransfersCard
                  direction="incoming"
                  transfers={
                    recurrentTransfers?.incoming_recurrent_transfers as AllTransfers[]
                  }
                  isInitiallyOpen={tabExpandedStates.wallet}
                  accountName={accountName}
                />
              </div>
            </TabsContent>

            {hasDelegationsContent && (
              <TabsContent value="delegations">
                <div className="flex items-center gap-4">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTabToggleAll("delegations")}
                        >
                          <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {tabExpandedStates.delegations
                            ? t("accountDetailsSection.collapseAll")
                            : t("accountDetailsSection.expandAll")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div
                  key={
                    tabExpandedStates.delegations
                      ? "delegations-open"
                      : "delegations-closed"
                  }
                  className="space-y-4"
                >
                  <AccountVestingDelegationsCard
                    direction="outgoing"
                    delegations={outgoingVestingDelegations}
                    dynamicGlobalData={dynamicGlobalData}
                    isInitiallyOpen={tabExpandedStates.delegations}
                    accountName={accountName}
                  />
                  <AccountVestingDelegationsCard
                    direction="incoming"
                    delegations={incomingVestingDelegations}
                    dynamicGlobalData={dynamicGlobalData}
                    isInitiallyOpen={tabExpandedStates.delegations}
                    accountName={accountName}
                  />
                  <AccountRcDelegationsCard
                    delegations={rcDelegationsData}
                    isInitiallyOpen={tabExpandedStates.delegations}
                    accountName={accountName}
                  />
                </div>
              </TabsContent>
            )}

            {hasGovernanceContent && (
              <TabsContent value="governance">
                <div className="flex items-center gap-4">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTabToggleAll("governance")}
                        >
                          <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {tabExpandedStates.governance
                            ? t("accountDetailsSection.collapseAll")
                            : t("accountDetailsSection.expandAll")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div
                  key={
                    tabExpandedStates.governance
                      ? "governance-open"
                      : "governance-closed"
                  }
                  className="space-y-4"
                >
                  <AccountWitnessVotesCard
                    voters={accountDetails.witness_votes}
                    accountName={accountName}
                    proxy={accountDetails.proxy}
                    isInitiallyOpen={tabExpandedStates.governance}
                  />
                  <AccountProxyPowerCard
                    accountName={accountName}
                    isInitiallyOpen={tabExpandedStates.governance}
                    dynamicGlobalData={dynamicGlobalData}
                  />
                  {accountDetails.is_witness &&
                    !isWitnessDetailsError &&
                    !!witnessDetails && (
                      <AccountDetailsCard
                        header={t("accountDetailsSection.witnessProperties")}
                        userDetails={witnessDetails}
                        isInitiallyOpen={tabExpandedStates.governance}
                      />
                    )}
                </div>
              </TabsContent>
            )}

            <TabsContent value="profile">
              <div className="flex items-center gap-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTabToggleAll("profile")}
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {tabExpandedStates.profile
                          ? t("accountDetailsSection.collapseAll")
                          : t("accountDetailsSection.expandAll")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                key={
                  tabExpandedStates.profile ? "profile-open" : "profile-closed"
                }
                className="space-y-4"
              >
                <AccountDetailsCard
                  header={t("accountDetailsSection.properties")}
                  userDetails={accountDetails}
                  isInitiallyOpen={tabExpandedStates.profile}
                />
                <JSONCard
                  header={t("accountDetailsSection.jsonMetadata")}
                  json={accountDetails.json_metadata}
                  showCollapseButton={true}
                  isInitiallyOpen={tabExpandedStates.profile}
                />
                <JSONCard
                  header={t("accountDetailsSection.postingJsonMetadata")}
                  json={accountDetails.posting_json_metadata}
                  showCollapseButton={true}
                  isInitiallyOpen={tabExpandedStates.profile}
                />
                <AccountAuthoritiesCard
                  accountName={accountName}
                  liveDataEnabled={liveDataEnabled}
                  isInitiallyOpen={tabExpandedStates.profile}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="bg-explorer-slate rounded-lg border border-slate-200 dark:border-slate-800 p-3 mt-4">
          <div className="space-y-4">
            <AccountBalanceCard
              header={t("accountDetailsSection.wallet")}
              userDetails={accountDetails}
              isInitiallyOpen={false}
            />
            <AccountBalanceHistoryCard
              header={t("accountDetailsSection.balanceHistory")}
              userDetails={accountDetails}
              isInitiallyOpen={true}
            />
          </div>
          <div className="flex items-center gap-4 my-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAreAllCardsOpen(!areAllCardsOpen)}
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {areAllCardsOpen
                      ? t("accountDetailsSection.collapseAll")
                      : t("accountDetailsSection.expandAll")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div key={areAllCardsOpen ? "open" : "closed"} className="space-y-4">
            <CollapsibleCards isInitiallyOpen={areAllCardsOpen} />
          </div>
        </div>
      )}

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