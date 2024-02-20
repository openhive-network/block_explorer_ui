import Hive from "./Hive";

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
    lastIrreversibleBlockNumber: string;
    availableAccountSubsidies: string;
    hbdStopPercent: string;
    hbdStartPercent: string;
    nextMaintenanceTime: string;
    lastBudgetTime: string;
    nextDailyMaintenanceTime: string;
    contentRewardPercent: string;
    vestingRewardPercent: string;
    downvotePoolPercent: string;
    currentRemoveThreshold: number;
    earlyVotingSeconds: string;
    midVotingSeconds: string;
    maxConvecutiveRecurrentTransferFailures: string;
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

  interface CommentSearchParams {
    accountName: string | undefined;
    permlink: string | undefined;
    fromBlock: number | undefined;
    toBlock: number | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    lastBlocks: number | undefined;
    lastTime: number | undefined;
    timeUnit: string | undefined;
    rangeSelectKey: string | undefined;
    page: number;
    operationTypes: number[] | undefined;
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

  interface AccountSearchOperationsProps extends CommonSearchProps {
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

  interface DynamicGlobalBlock extends Omit<Hive.DynamicGlobalBlock, 
    "virtual_supply" |
    "current_supply" |
    "init_hbd_supply" |
    "current_hbd_supply" |
    "total_vesting_fund_hive" |
    "total_vesting_shares" |
    "total_reward_fund_hive" |
    "pending_rewarded_vesting_shares" |
    "pending_rewarded_vesting_hive" |
    "dhf_interval_ledger" 
  > {
    virtual_supply: string;
    current_supply: string;
    init_hbd_supply: string;
    current_hbd_supply: string;
    total_vesting_fund_hive: string;
    total_vesting_shares: string;
    total_reward_fund_hive: string;
    pending_rewarded_vesting_shares: string;
    pending_rewarded_vesting_hive: string;
    dhf_interval_ledger: string;
  }

  interface OperationCounter {
    operationTypeName: string;
    counter: number;
  }

  interface Witness extends Omit<Hive.Witness,
  "vests" |
  "votes_hive_power" |
  "hbd_interest_rate" |
  "votes_daily_change_hive_power" |
  "votes_daily_change"
  > {
    vests: string;
    votes_hive_power: string;
    hbd_interest_rate: string;
    votes_daily_change_hive_power: string;
    votes_daily_change: string;
  }
}

export default Explorer;
