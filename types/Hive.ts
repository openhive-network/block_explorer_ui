import { IManabarData } from "@hiveio/wax";

declare module Hive {

  type Direction = "asc" | "desc";

  interface RestGetWitnessesParams {
    limit: number;
    offset: number;
    sort: string;
    direction: Direction;
  }

  interface RestGetLastBlocksParams {
    limit: number;
  }

  interface RestGetOpsByBlockParams {
    "operation-types"?: number[];
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "set-of-keys"?: string[];
    "key-content"?: string;
    direction?: Direction;
    "data-size-limit"?: number;
  }

  interface RestGetOpsByAccountParams {
    "operation-types"?: number[];
    page?: number;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number;
    "to-block"?: number;
    "start-date"?: Date;
    "end-date"?: Date;
  }

  interface RestCommentsParams {
    "operation-types"?: number[];
    page?: number;
    permlink?: string;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number;
    "to-block"?: number;
    "start-date"?: Date;
    "end-date"?: Date;
  }

  interface RestBlockSearchParams {
    "operation-types"?: number[];
    page?: number;
    limit?: number;
    direction: Direction;
    "account-name"?: string;
    "set-of-keys"?: string[];
    "key-content"?: string;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number;
    "to-block"?: number;
    "start-date"?: Date;
    "end-date"?: Date;
  }

  interface RestGetWitnessesVotersParams {
    sort?: string;
    direction?: Direction;
    limit?: number;
  }

  interface HiveBlogProps {
    id: number;
    method: string;
    jsonrpc: string;
  }

  interface GetOpsByBlockProps {
    _block_num: number;
    _filter?: number[];
    _page_size: number;
    _body_limit: number;
    _page_num?: number;
    _account?: string;
    _key_content?: string[];
    _setof_keys?: string[][];
  }

  interface GetTransactionProps {
    _trx_hash: string;
  }

  interface GetAccOpTypesProps {
    _account: string;
  }

  interface GetOpsByAccountProps {
    _account: string;
    _page_num?: number;
    _page_size: number;
    _filter?: number[];
    _date_start?: Date;
    _date_end?: Date;
    _body_limit: number;
    _from?: number;
    _to?: number;
  }

  interface GetAccountOpsCountProps {
    _account: string;
    _operations: number[];
  }

  interface GetAccountProps {
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
    _start_date?: Date;
    _end_date?: Date;
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

  interface GetCommentOperationProps {
    _author: string;
    _permlink?: string;
    _page_num?: number;
    _operation_types?: number[];
    _from?: number;
    _to?: number;
    _start_date?: Date;
    _end_date?: Date;
    _body_limit: number;
    _page_size: number;
  }

  interface GetOperationsInBlockProps {
    _block_num: number;
  }

  interface GetBlockRawProps {
    _block_num: number;
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

  interface OperationsByTypeCount {
    count: number;
    op_type_id: number;
  }

  interface PriceFeed {
    base: Supply;
    quote: Supply;
  }

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

  interface Operation {
    type: string;
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
      "org-op-id"?: string;
    };
  }

  interface OperationResponse {
    age: string;
    block_num: number;
    op_in_trx: number;
    operation_id: string;
    operation: Operation;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    is_modified: boolean;
    length: number;
  }

  interface TotalOperationsResponse {
    operations_result: OperationResponse[];
    total_pages: number;
    total_operations: number;
  }

  interface AccountOperationsResponse extends OperationsCount {
    operations_result: OperationResponse[];
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
    transaction_id: string;
    block_num: number;
    transaction_num: number;
  }

  interface TransactionDetails {
    ref_block_num: number;
    ref_block_prefix: number;
    extensions: any[];
    expiration: Date;
    operations: Operation[];
    signatures: string[];
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
    | "transaction_hash"
    | "block_hash"
    | "invalid_input";

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
    feed_updated_at: Date;
    block_size: number;
    signing_key: string;
    version: string;
    missed_blocks: number;
    hbd_interest_rate: number;
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

  interface VestingDelegations {
    delegatee: string;
    delegator: string;
    id: number;
    min_delegation_time: string;
    vesting_shares: string;
  }

  interface RCDelegations {
    delegated_rc: number;
    from: string;
    to: string;
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
    ops_count: OperationsByTypeCount[];
  }

  interface OperationsCount {
    total_operations: number;
    total_pages: number;
  }

  interface CommentOperation {
    block_num: number;
    operation: Operation;
    is_modified: boolean;
    operation_id: number;
    permlink: string;
    created_at: Date;
    trx_hash: string;
  }

  interface CommentOperationResponse extends OperationsCount {
    operations_result: CommentOperation[];
  }

  interface Manabars {
    upvote: IManabarData;
    downvote: IManabarData;
    rc: IManabarData;
  }

  interface RawBlockData {
    block_id: string;
    extensions: unknown[];
    previous: string;
    signing_key: string;
    timestamp: Date;
    transaction_ids: string[];
    transaction_merkle_root: string;
    transactions: TransactionDetails[];
    witness: string;
    witness_signature: string;
  }

  interface TransferOperation {
    from: string;
    to: string;
    amount: Supply | undefined;
    memo: string;
    request_id?: number;
    remaining_executions?: number;
    consecutive_failures?: number;
    deleted?: boolean;
  }

  interface RecurrentTransferOperation extends TransferOperation {
    executions: number;
    recurrence: number;
  }

  interface EscrowOperation {
    from: string;
    to: string;
    agent: string;
    who?: string;
    escrow_id: number;
    fee?: Supply;
    hive_amount?: Supply;
    hbd_amount?: Supply;
    ratification_deadline?: string;
    escrow_expiration?: string;
    json_meta?: string;
  }

  interface CancelTransferOperation {
    request_id: number;
    from: string;
  }

  interface AuthKeys {
    key_auth: [string | undefined, string | undefined][];
    account_auth: [string | undefined, string | undefined][];
    weight_threshold: number;
  }

  interface AccountAuthoritiesData {
    owner: AuthKeys;
    active: AuthKeys;
    posting: AuthKeys;
    memo: string;
    witness_signing: string;
  }
}

export default Hive;
