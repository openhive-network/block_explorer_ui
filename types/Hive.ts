declare module Hive {
  interface HiveBlogProps {
    id: number;
    method: string;
    jsonrpc: string;
  }

  interface GetBlockOpTypesProps {
    _block_num: number;
  }

  interface GetOpsByBlockProps {
    _block_num: number;
    _filter: number[];
  }

  interface GetTransactionProps {
    _trx_hash: string;
  }

  interface GetAccOpTypesProps {
    _account: string;
  }

  interface GetOpsByAccountProps {
    _account: string;
    _top_op_id: number;
    _limit: number;
    _filter: number[];
    _date_start: unknown;
    _date_end: unknown;
  }

  interface GetAccountProps {
    _account: string;
  }

  interface GetAccountResourceCreditsProps {
    _account: string;
  }

  interface GetBtrackerAccountBalanceProps {
    _account: string;
  }

  interface GetWitnessesProps {
    _limit: number;
    _offset: number;
    _order_by: string;
    _order_is: string;
    _to_hp: boolean;
  }

  interface GetWitnessVotersNumProps {
    _witness: string;
  }

  interface GetWitnessVotersProps {
    _witness: string;
    _limit: number;
    _offset: number;
  }
  interface GetOperationTypesProps {
    _operation_type_pattern: string | null;
  }

  interface GetWitnessProps {
    _account: string;
  }

  interface Supply {
    amount: string;
    precision: number;
    nai: string;
  }

  interface JsonRpcBasicResponse<T> {
    id: number;
    jsonrpc: string;
    result: T;
  }

  interface DynamicGlobalBlock {
    id: number;
    head_block_number: number;
    head_block_id: string;
    time: Date;
    current_witness: string;
    total_pow: number;
    num_pow_witnesses: number;
    virtual_supply: Supply;
    current_supply: Supply;
    init_hbd_supply: Supply;
    current_hbd_supply: Supply;
    total_vesting_fund_hive: Supply;
    total_vesting_shares: Supply;
    total_reward_fund_hive: Supply;
    total_reward_shares2: string;
    pending_rewarded_vesting_shares: Supply;
    pending_rewarded_vesting_hive: Supply;
    hbd_interest_rate: number;
    hbd_print_rate: number;
    maximum_block_size: number;
    required_actions_partition_percent: number;
    current_aslot: number;
    recent_slots_filled: string;
    participation_count: number;
    last_irreversible_block_num: number;
    vote_power_reserve_rate: number;
    delegation_return_period: number;
    reverse_auction_seconds: number;
    available_account_subsidies: number;
    hbd_stop_percent: number;
    hbd_start_percent: number;
    next_maintenance_time: Date;
    last_budget_time: Date;
    next_daily_maintenance_time: Date;
    content_reward_percent: number;
    vesting_reward_percent: number;
    proposal_fund_percent: number;
    dhf_interval_ledger: Supply;
    downvote_pool_percent: number;
    current_remove_threshold: number;
    early_voting_seconds: number;
    mid_voting_seconds: number;
    max_consecutive_recurrent_transfer_failures: number;
    max_recurrent_transfer_end_date: number;
    min_recurrent_transfers_recurrence: number;
    max_open_recurrent_transfers: number;
  }

  type DynamicGlobalBlockQuery = JsonRpcBasicResponse<DynamicGlobalBlock>;

  interface PriceFeed {
    base: Supply;
    quote: Supply;
  }

  type PriceFeedQuery = JsonRpcBasicResponse<PriceFeed>;

  interface RewardFunds {
    id: number;
    name: string;
    reward_balance: Supply;
    recent_claims: string;
    last_update: Date;
    content_constant: string;
    percent_curation_rewards: number;
    percent_content_rewards: number;
    author_reward_curve: string;
    curation_reward_curve: string;
  }

  type RewardFundsQuery = JsonRpcBasicResponse<{funds: RewardFunds[]}>;

  type OperationType = 
  "vote_operation" |
  "comment_operation"

  interface Operation {
    type: OperationType;
    value: {
      author: string;
      permlink: string;
      voter?: string;
      weight?: number;
      body?: string;
      json_metadata?: string;
      parent_author?: string;
      parent_permlink?: string;
      title?: string;
    };
  }
  interface TransactionQueryResponse {
    age: string;
    block_num: number;
    expiration: string;
    extensions: any[];
    operations: Operation[];
    ref_block_num: number;
    ref_block_prefix: number;
    signatures: string[];
    timestamp: string;
    transaction_id: string;
  }

  interface OpsByBlockResponse {
    acc_operation_id: string | null;
    age: string;
    block: number;
    op_in_trx: number;
    operation_id: number;
    operation: Operation;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    length: number;
  }

  type OperationTypes = [number, string, boolean];

  interface TransactionQueryResponse {
    age: string;
    block_num: number;
    expiration: string;
    extensions: any[];
    operations: Operation[];
    ref_block_num: number;
    ref_block_prefix: number;
    signatures: string[];
    timestamp: string;
    transaction_id: string;
  }

  type InputTypes = "account_name" | "account_name_array" | "block_num" | "transaction_hash"

  interface InputTypeResponse {
    input_type: InputTypes;
    input_value: string | string[]
  }
  interface Witness {
    witness: string,
    rank: number,
    url: string,
    votes: number,
    votes_daily_change: unknown,
    voters_num: number,
    voters_num_daily_change: number,
    price_feed: number,
    bias: number,
    feed_age: string,
    block_size: number,
    signing_key: string,
    version: string
  }

  interface Voter {
    account: string;
    hive_power: number;
    account_hive_power: null;
    proxied_hive_power: null;
    timestamp: Date;
  }
}

export default Hive;
