import { GetDynamicGlobalPropertiesResponse } from "@hive/wax";
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
    headBlockDetails: HeadBlockDetails;
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
    };
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
    filters: boolean[] | undefined;
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

  interface DynamicGlobalBlock
    extends Omit<
      GetDynamicGlobalPropertiesResponse,
      | "virtual_supply"
      | "current_supply"
      | "init_hbd_supply"
      | "current_hbd_supply"
      | "total_vesting_fund_hive"
      | "total_vesting_shares"
      | "total_reward_fund_hive"
      | "pending_rewarded_vesting_shares"
      | "pending_rewarded_vesting_hive"
      | "dhf_interval_ledger"
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

  interface Witness
    extends Omit<
      Hive.Witness,
      | "vests"
      | "votes_hive_power"
      | "hbd_interest_rate"
      | "votes_daily_change_hive_power"
      | "votes_daily_change"
    > {
    vests: string;
    votes_hive_power: string;
    hbd_interest_rate: string;
    votes_daily_change_hive_power: string;
    votes_daily_change: string;
  }

  interface OperationForTable {
    operation: Hive.Operation;
    blockNumber?: number;
    trxId?: string;
    operatiopnId?: number;
    timestamp?: string;
  }

  interface FormattedAccountDetails
    extends Omit<
      Hive.AccountDetailsQueryResponse,
      | "last_post"
      | "last_root_post"
      | "post_count"
      | "balance"
      | "saving_balance"
      | "hbd_balance"
      | "hbd_saving_balance"
      | "reward_hbd_balance"
      | "reward_vesting_balance"
      | "reward_vesting_hive"
      | "reward_hive_balance"
      | "vesting_withdraw_rate"
      | "vesting_shares"
      | "delegated_vesting_shares"
      | "received_vesting_shares"
      | "post_voting_power"
      | "posting_rewards"
      | "curation_rewards"
      | "vesting_balance"
    > {
    balance: string;
    saving_balance: string;
    hbd_balance: string;
    hbd_saving_balance: string;
    reward_hbd_balance: string;
    reward_vesting_balance: string;
    reward_vesting_hive: string;
    reward_hive_balance: string;
    vesting_withdraw_rate: string;
    vesting_shares: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    post_voting_power: string;
    posting_rewards: string;
    curation_rewards: string;
    vesting_balance: string;
    last_post?: number;
    last_root_post?: number;
    post_count?: number;
  }
}

export default Explorer;
