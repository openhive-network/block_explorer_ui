declare module Explorer {

  interface HeadBlockDetails {
    feedPrice: string;
    blockchainTime: string;
    rewardFund: string;
    currentSupply: string;
    virtualSupply: string;
    initHbdSupply: string;
    currentHbdSupply: string;
    pendingRewardedVestingHive: string;
    totalVestingFundHive: string;
    hbdInterestRate: string;
    hbdPrintRate: string;
    requiredActionsPartitionPercent: string;
    lastIrreversibleBlockNumber: number;
    availableAccountSubsidies: number;
    hbdStopPercent: number;
    hbdStartPercent: number;
    nextMaintenanceTime: string;
    lastBudgetTime: string;
    nextDailyMaintenanceTime: string;
    contentRewardPercent: number;
    vestingRewardPercent: number;
    downvotePoolPercent: number;
    currentRemoveThreshold: number;
    earlyVotingSeconds: number;
    midVotingSeconds: number;
    maxConvecutiveRecurrentTransferFailures: number;
    maxRecurrentTransferEndDate: number;
    minRecurrentTransfersRecurrence: number;
    maxOpenRecurrentTransfers: number;
  }


  interface HeadBlockCardData {
    headBlockDetails: HeadBlockDetails,
    witnessName: string;
    headBlockNumber: number;
  }

  interface BlockSearchProps {
    operations: number[];
    accountName?: string;
    fromBlock?: number;
    toBlock?: number;
    startDate?: Date;
    endDate?: Date;
    limit: number;
    deepProps: {
      content?: any;
      keys?: string[];
    }
  }

  interface CommentSearchProps {
    accountName: string;
    permlink?: string;
    pageNumber?: number;
    operations?: number[];
    fromBlock?: number;
    toBlock?: number;
    startDate?: Date;
    endDate?: Date;
  }
}

export default Explorer;
