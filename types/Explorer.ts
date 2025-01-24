import { GetDynamicGlobalPropertiesResponse } from "@hiveio/wax";
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
    totalVestingShares: string;
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
    rawTotalVestingFundHive: Hive.Supply;
    rawTotalVestingShares: Hive.Supply;
    rawFeedPrice: Hive.Supply;
    rawQuote: Hive.Supply;
  }

  interface HeadBlockCardData {
    headBlockDetails: HeadBlockDetails;
    witnessName: string;
    headBlockNumber: number;
  }

  interface CommonSearchProps {
    operationTypes?: number[] | null;
    fromBlock?: number;
    toBlock?: number;
    startDate?: Date;
    endDate?: Date;
  }
  // TODO: Investigate do we really need deepProps
  interface BlockSearchProps extends CommonSearchProps {
    accountName?: string;
    limit: number;
    deepProps: {
      content?: any;
      keys?: string[];
    };
  }

  interface CommentSearchParams {
    accountName: string;
    permlink: string;
    fromBlock: number | undefined;
    toBlock: number | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    lastBlocks: number | undefined;
    lastTime: number | undefined;
    timeUnit: string | undefined;
    rangeSelectKey: string | undefined;
    page: number;
    operationTypes: number[] | null;
  }

  type CommentType = "all" | "post" | "comment";

  interface CommentPermlinSearchParams {
    accountName: string;
    fromBlock: number | undefined;
    toBlock: number | undefined;
    startDate: Date | undefined;
    endDate: Date | undefined;
    lastBlocks: number | undefined;
    lastTime: string | undefined;
    page: number;
    rangeSelectKey: string | undefined;
    timeUnit: string | undefined;
    commentType: CommentType;
  }

  interface CommentSearchProps extends CommonSearchProps {
    accountName: string;
    permlink: string;
    pageNumber?: number;
    pageSize?: number;
    direction?: "asc" | "desc";
    dataSizeLimit?: number;
    rangeSelectKey?: string | undefined;
    lastTimeUnitValue?: Date | string;
    lastBlocksValue?: string | number;
    timeUnitSelectKey?: number | string;
  }

  interface PermlinkSearchProps extends CommonSearchProps {
    accountName: string;
    commentType?: CommentType;
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
    votes_updated_at: string;
    witness: {
      account_creation_fee: number;
      bias: number;
      block_size: number;
      feed_updated_at: string;
      hbd_interest_rate: number;
      last_confirmed_block_num: number;
      missed_blocks: number;
      price_feed: number;
      rank: number;
      signing_key: string;
      url: string;
      version: string;
      vests: string;
      voters_num: number;
      voters_num_daily_change: number;
      votes_daily_change: string;
      witness_name: string;
    };
  }

  interface OperationForTable {
    operation: Hive.Operation;
    blockNumber?: number;
    trxId?: string;
    timestamp?: string;
    operationId?: number;
  }

  class ExtendedOperationTypePattern extends Hive.OperationPattern {
    isDisabled?: boolean;
  }

  interface VestingDelegation
    extends Omit<Hive.VestingDelegations, "vesting_shares"> {
    vesting_shares: string;
  }

  interface AccountDetailsVests {
    reward_vesting_balance: string;
    vesting_withdraw_rate: string;
    vesting_shares: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    posting_rewards: string;
    curation_rewards: string;
    vesting_balance: string;
    reward_vesting_hive: string;
  }

  interface AccountDetailsDollars {
    reward_vesting_balance: string;
    vesting_withdraw_rate: string;
    vesting_shares: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    posting_rewards: string;
    curation_rewards: string;
    vesting_balance: string;
    reward_vesting_hive: string;
  }

  interface FormattedAccountDetails
    extends Omit<
      Hive.AccountDetails,
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
      | "last_account_recovery"
      | "created"
    > {
    balance: string;
    saving_balance: string;
    hbd_balance: string;
    hbd_saving_balance: string;
    reward_hbd_balance: string;
    reward_vesting_balance: string;
    reward_hive_balance: string;
    has_hbd_reward: boolean;
    has_vesting_reward: boolean;
    has_hive_reward: boolean;
    reward_vesting_hive: string;
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
    last_account_recovery: string;
    created: string;
    vests: AccountDetailsVests;
    dollars: AccountDetailsDollars;
  }

  interface BalanceHistoryForTable {
    operationId: number;
    blockNumber?: number;
    timestamp?: string;
    opTypeId: number;
    balance: number;
    prev_balance: number;
    balanceChange: number;
  }
}

export default Explorer;
