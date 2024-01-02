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
    lastIrreversibleBlockNumber: number;
    availableAccountSubsidies: number;
    hbdStopPercent: string;
    hbdStartPercent: string;
    nextMaintenanceTime: string;
    lastBudgetTime: string;
    nextDailyMaintenanceTime: string;
    contentRewardPercent: string;
    vestingRewardPercent: string;
    downvotePoolPercent: string;
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

  interface CommonSearchProps {
    operationTypes?: number[];
    fromBlock?: number;
    toBlock?: number;
    startDate?: Date;
    endDate?: Date;
  }

  interface BlockSearchProps extends CommonSearchProps {
    accountName?: string;
    limit: number;
    deepProps: {
      content?: any;
      keys?: string[];
    }
  }

  interface CommentSearchProps extends CommonSearchProps {
    accountName: string;
    permlink?: string;
    pageNumber?: number;
  }

  interface SelectOption {
    name: string;
    key: string;
  }

  interface AccountSearchOperationsProps extends CommentSearchProps {
    accountName: string;
    pageNumber?: number;
  }

  interface UrlParam {
    paramName: string;
    paramValue?: string | string[];
  }

  interface SingleManabar {
    max: string;
    current: string;
    percentageValue: number;
  }

  interface Manabars {
    upvote: SingleManabar;
    downvote: SingleManabar;
    rc: SingleManabar;
  }
}

export default Explorer;
