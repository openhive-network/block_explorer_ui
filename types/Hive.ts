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
    _body_limit: number;
  }

  interface GetTransactionProps {
    _trx_hash: string;
  }

  interface GetAccOpTypesProps {
    _account: string;
  }

  interface GetOpsByAccountProps {
    _account: string;
    _page_num: number;
    _limit: number;
    _filter: number[];
    _date_start: Date | null;
    _date_end: Date | null;
    _body_limit: number;
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
  }

  interface GetWitnessVotersNumProps {
    _witness: string;
  }

  interface GetWitnessVotersProps {
    _witness: string;
    _order_by: string;
    _order_is: string;
    _limit?: number;
  }
  interface GetOperationTypesProps {
    _operation_type_pattern: string | null;
  }

  interface GetWitnessProps {
    _account: string;
  }

  interface GetBlockByTimeProps {
    _timestamp: Date;
  }

  interface GetOperationKeysProps {
    _op_type_id: number;
  }

  interface GetBlockByOpProps {
    _operations: number[];
    _account?: string;
    _from?: number;
    _to?: number;
    _limit: number;
    _order_is: "asc" | "desc";
    _key_content?: string[] | null;
    _setof_keys?: string[][] | null;
  }

  interface GetBlockProps {
    _block_num: number;
  }

  interface GetInputTypeProps {
    _input: string;
  }

  interface GetLatestBlocksProps {
    _limit: number;  
  }
  interface GetOperationProps {
    _operation_id: number;
  }

  interface GetWitnessVotesHistory {
    _witness: string;
    _order_is: string;
    _order_by: string;
    _limit: number | null;
    _from_time?: Date;
    _to_time?: Date;
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

  type RewardFundsQuery = JsonRpcBasicResponse<{ funds: RewardFunds[] }>;

  type OperationType =
    | "vote_operation"
    | "comment_operation"
    | "custom_json_operation"
    | "transfer_operation";

  interface Operation {
    type: OperationType;
    value: {
      author?: string;
      owner?: string | Object;
      account?: string;
      producer?: string;
      curator?: string;
      seller?: string;
      permlink?: string;
      voter?: string;
      weight?: number;
      body?: string;
      json_metadata?: string;
      parent_author?: string;
      parent_permlink?: string;
      title?: string;
      required_posting_auths?: string[];
      required_auths?: string[];
      id?: string;
      json?: string;
      amount?: {
        nai: string;
        amount: string;
        precision: number;
      };
      memo?: string;
      from?: string;
      to?: string;
      message?: string;
    };
  }

  interface OperationResponse {
    age: string;
    block_num: number;
    op_in_trx: number;
    operation_id: number;
    operation: Operation;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    is_modified: boolean;
    length: number;
  }

  type OperationTypes = [number, string, boolean];

  interface OperationPattern {
    op_type_id: number;
    operation_name: string;
    is_virtual: boolean;
  }

  interface TransactionQueryResponse {
    transaction_json: TransactionDetails;
    timestamp: Date;
    age: string;
  }

  interface TransactionDetails {
    ref_block_num: number;
    ref_block_prefix: number;
    extensions: any[];
    expiration: Date;
    operations: Operation[];
    signatures: string[];
    transaction_id: string;
    block_num: number;
    transaction_num: number;
  }

  interface AccountDetailsQueryResponse {
    id: number;
    name: string;
    owner: {
      weight_threshold: number;
      account_auths: string[];
      key_auths: [string, number][];
    };
    active: {
      weight_threshold: number;
      account_auths: string[];
      key_auths: [string, number][];
    };
    posting: {
      weight_threshold: number;
      account_auths: string[];
      key_auths: [string, number][];
    };
    memo_key: string;
    profile_image: string;
    json_metadata: string;
    posting_json_metadata: string;
    last_owner_update: string;
    last_account_update: string;
    created: Date;
    mined: string | boolean;
    recovery_account: string;
    post_count: number;
    can_vote: string | boolean;
    voting_manabar: {
      current_mana: string | number;
      last_update_time: number;
    };
    downvote_manabar: {
      current_mana: string | number;
      last_update_time: number;
    };
    voting_power: string;
    balance: number;
    savings_balance: number;
    hbd_balance: number;
    hbd_saving_balance: number;
    savings_withdraw_requests: number;
    reward_hbd_balance: number;
    reward_hive_balance: number;
    reward_vesting_balance: number;
    reward_vesting_hive: number;
    vesting_shares: number;
    delegated_vesting_shares: number;
    received_vesting_shares: number;
    vesting_withdraw_rate: number;
    to_withdraw: number;
    withdrawn: number;
    withdraw_routes: number;
    post_voting_power: number;
    posting_rewards: number;
    curation_rewards: number;
    proxied_vsf_votes: [string, number, number, number] | any;
    witnesses_voted_for: string | number;
    last_post: string | Date;
    last_root_post: string | Date;
    last_vote_time: string | Date;
    vesting_balance: number;
    reputation: string | number;
    witness_votes: string[];
    proxy: string;
    last_account_recovery: Date;
    delayed_vests: number;
    ops_count: number;
    is_witness: boolean;
  }


  interface GetBlockByTimeResponse {
    age: string;
    created_at: string;
    current_hbd_supply: number;
    current_supply: number;
    dhf_interval_ledger: number;
    extensions: null | any;
    hash: string;
    hbd_interest_rate: number;
    num: number;
    prev: string;
    producer_account_id: number;
    signing_key: string;
    total_reward_fund_hive: number;
    total_vesting_fund_hive: number;
    total_vesting_shares: number;
    transaction_merkle_root: string;
    virtual_supply: number;
    witness_signature: string;
  }

  type InputTypes =
    | "account_name"
    | "account_name_array"
    | "block_num"
    | "transaction_hash";

  interface InputTypeResponse {
    input_type: InputTypes;
    input_value: string | string[];
  }
  interface Witness {
    witness: string;
    rank: number;
    url: string;
    vests: number;
    votes_hive_power: number;
    votes_daily_change: number;
    votes_daily_change_hive_power: number;
    voters_num: number;
    voters_num_daily_change: number;
    price_feed: number;
    bias: number;
    feed_age: string;
    block_size: number;
    signing_key: string;
    version: string;
  }

  interface Voter {
    voter: string;
    vests: number;
    votes_hive_power: number;
    account_vests: number;
    account_hive_power: number;
    proxied_vests: number;
    proxied_hive_power: number;
    timestamp: Date;
  }

  interface WitnessVotesHistory {
    voter: string;
    approve: boolean;
    vests: number;
    vests_hive_power: number;
    account_vests: number;
    account_hive_power: number;
    proxied_vests: number;
    proxied_hive_power: number;
    timestamp: Date;
  }

  interface BlockDetails {
    age: string;
    block_num: number;
    created_at: string;
    current_hbd_supply: number;
    current_supply: number;
    dhf_interval_ledger: number;
    extensions: null;
    hash: string;
    hbd_interest_rate: number;
    prev: string;
    producer_account: string;
    signing_key: string;
    total_reward_fund_hive: number;
    total_vesting_fund_hive: number;
    total_vesting_shares: string;
    transaction_merkle_root: string;
    virtual_supply: number;
    witness_signature: string;
  }

  interface BlockByOpResponse {
    block_num: number;
    op_type_id: number[];
  }

  interface LastBlocksTypeResponse {
    block_num: number;
    witness: string;
    ops_count: Array<{
      count: number;
      op_type_id: number;
    }>;
  }
}

export default Hive;
