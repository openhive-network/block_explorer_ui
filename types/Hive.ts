import { IManabarData } from "@hiveio/wax";
namespace Hive {
  export type Direction = "asc" | "desc";
  export type OperationTypes = [number, string, boolean];
  export type InputTypes =
    | "account_name"
    | "account_name_array"
    | "block_num"
    | "transaction_hash"
    | "block_hash"
    | "invalid_input";

  export interface OperationsByTypeCount {
    op_count: number;
    op_type_id: number;
  }

  export interface Operation {
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
      perspective?: "incoming" | "outgoing";
    };
  }

  export interface TransactionDetails {
    ref_block_num: number;
    ref_block_prefix: number;
    extensions: any[];
    expiration: Date;
    operations: Operation[];
    signatures: string[];
  }

  export interface OperationsCount {
    total_operations: number;
    total_pages: number;
  }

  export interface CommentOperation {
    block: number;
    op: Operation;
    op_pos: number;
    op_type_id: number;
    operation_id: number;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
  }

  export interface TransferOperation {
    from: string;
    to: string;
    amount: Supply | undefined;
    memo: string;
    request_id?: number;
    remaining_executions?: number;
    consecutive_failures?: number;
    deleted?: boolean;
  }

  export interface RecurrentTransferOperation extends TransferOperation {
    executions: number;
    recurrence: number;
  }

  export interface EscrowOperation {
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

  export interface CancelTransferOperation {
    request_id: number;
    from: string;
  }

  export interface AuthKeys {
    key_auths: [string | undefined, string | undefined][];
    account_auths: [string | undefined, string | undefined][];
    weight_threshold: number;
  }

  export class AccountOperationTypes {
    total_operations!: number;
    total_pages!: number;
  }

  export class GetWitnessesParams {
    "page-size"!: number;
    offset!: number;
    sort!: string;
    direction!: Hive.Direction;
  }

  export class GetWitnessParams {
    accountName!: string;
  }

  export class Witness {
    witness_name!: string;
    rank!: number;
    url!: string;
    vests!: string;
    votes_daily_change!: number;
    voters_num!: number;
    voters_num_daily_change!: number;
    price_feed!: number;
    bias!: number;
    feed_updated_at!: Date;
    block_size!: number;
    signing_key!: string;
    version!: string;
    missed_blocks!: number;
    hbd_interest_rate!: number;
  }

  export class WitnessesResponse {
    total_witnesses!: number;
    total_pages!: number;
    votes_updated_at!: Date;
    witnesses!: Witness[];
  }

  export class SingleWitnessResponse {
    witness!: Witness;
    votes_updated_at!: Date;
  }

  export class WitnessVotersResponse {
    total_votes!: number;
    total_pages!: number;
    voters!: Voter[];
    votes_updated_at!: Date;
  }

  export class WitnessesSchedule {
    account_subsidy_rd!: {
      budget_per_time_unit: number;
      decay_params: {
        decay_per_time_unit: number;
        decay_per_time_unit_denom_shift: number;
      };
      max_pool_size: number;
      min_decay: number;
      pool_eq: number;
      resource_unit: number;
    };
    account_subsidy_witness_rd!: {
      budget_per_time_unit: number;
      decay_params: {
        decay_per_time_unit: number;
        decay_per_time_unit_denom_shift: number;
      };
      max_pool_size: number;
      min_decay: number;
      pool_eq: number;
      resource_unit: number;
    };
    current_shuffled_witnesses!: string[];
    current_virtual_time!: number | string;
    elected_weight!: number;
    future_shuffled_witnesses!: string[];
    hardfork_required_witnesses!: number;
    id!: number;
    majority_version!: string;
    max_miner_witnesses!: number;
    max_runner_witnesses!: number;
    max_voted_witnesses!: number;
    median_props!: {
      account_creation_fee: {
        amount: string | number;
        nai: string;
        precision: number;
      };
      account_subsidy_budget: number;
      account_subsidy_decay: number;
      hbd_interest_rate: number;
      maximum_block_size: number;
    };
    min_witness_account_subsidy_decay!: number;
    miner_weight!: number;
    next_shuffle_block_num!: number;
    num_scheduled_witnesses!: number;
    timeshare_weight!: number;
    witness_pay_normalization_factor!: number;
  }

  export class WitnessesByVote {
    available_witness_account_subsidies!: number;
    created!: string;
    hardfork_time_vote!: string;
    hardfork_version_vote!: string;
    hbd_exchange_rate!: { base: string; quote: string };
    base!: string;
    quote!: string;
    id!: number;
    last_aslot!: number;
    last_confirmed_block_num!: number;
    last_hbd_exchange_update!: string;
    last_work!: string;
    owner!: string;
    pow_worker!: number;
    props!: {
      account_creation_fee: string;
      account_subsidy_budget: number;
      account_subsidy_decay: number;
      hbd_interest_rate: number;
      maximum_block_size: number;
    };
    running_version!: string;
    signing_key!: string;
    total_missed!: number;
    url!: string;
    virtual_last_update!: string;
    virtual_position!: string;
    virtual_scheduled_time!: string;
    votes!: string;
  }
  export class HivePostMetadata {
    app!: string;
    format!: string;
    tags!: string[];
  }

  export class HivePostStats {
    flag_weight!: number;
    gray!: boolean;
    hide!: boolean;
    total_votes!: number;
  }

  export class ActiveVote {
    voter!: string;
    rshares!: number;
  }
  export class HivePost {
    active_votes!: ActiveVote[];
    author!: string;
    author_payout_value!: string;
    author_reputation!: number;
    author_role!: string;
    author_title!: string;
    beneficiaries!: number[] | string[];
    blacklists!: number[] | string[];
    body!: string;
    category!: string;
    children!: number;
    community!: string;
    community_title!: string;
    created!: string;
    curator_payout_value!: string;
    depth!: number;
    is_paidout!: boolean;
    json_metadata!: HivePostMetadata;
    max_accepted_payout!: string;
    net_rshares!: number;
    parent_author!: string;
    parent_permlink!: string;
    payout!: number;
    payout_at!: string;
    pending_payout_value!: string;
    percent_hbd!: number;
    permlink!: string;
    post_id!: number;
    promoted!: string;
    reblogs!: number;
    replies!: string[];
    stats!: HivePostStats;
    title!: string;
    updated!: string;
    url!: string;
  }

  export class HivePosts {
    [key: string]: HivePost;
  }

  export class PostPageVoteDetails {
    rshares!: number;
    voter!: string;
  }

  export class GetVotersParams {
    accountName!: string;
    sort?: string;
    direction?: Hive.Direction;
    "page-size"?: number;
    "page"?: number;
  }

  export class Voter {
    voter_name!: string;
    vests!: number;
    account_vests!: number;
    proxied_vests!: number;
    timestamp!: Date;
  }

  export class GetVotesHistoryParams {
    accountName!: string;
    sort?: string;
    direction?: Hive.Direction;
    "result-limit"!: number | null;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
  }

  export class WitnessVotesHistory {
    voter_name!: string;
    approve!: boolean;
    vests!: number;
    account_vests!: number;
    proxied_vests!: number;
    timestamp!: Date;
  }

  export class WitnessesVotesHistoryResponse {
    votes_updated_at!: Date;
    votes_history!: WitnessVotesHistory[];
  }

  export class GetBlockDetailsParams {
    blockNumber!: number | string;
    "include-virtual"?: boolean;
  }

  export class BlockDetails {
    block_num!: number;
    created_at!: string;
    current_hbd_supply!: number | string;
    current_supply!: number | string;
    dhf_interval_ledger!: number;
    extensions!: null;
    hash!: string;
    hbd_interest_rate!: number;
    prev!: string;
    producer_account!: string;
    signing_key!: string;
    total_reward_fund_hive!: number | string;
    total_vesting_fund_hive!: number | string;
    total_vesting_shares!: number | string;
    transaction_merkle_root!: string;
    virtual_supply!: number | string;
    witness_signature!: string;
  }

  export class GetBlockGlobalStateParams {
    "block-num"!: number | string;
  }

  export class GetInputTypeParams {
    inputType!: string;
  }

  export class InputTypeResponse {
    input_type!: Hive.InputTypes;
    input_value!: string | string[];
  }

  export class GetTransactionParams {
    transactionId!: string;
    "include-virtual"?: boolean;
  }

  export class TransactionResponse {
    transaction_json!: Hive.TransactionDetails;
    timestamp!: Date;
    transaction_id!: string;
    block_num!: number;
    transaction_num!: number;
  }

  export class OperationPattern {
    op_type_id!: number;
    operation_name!: string;
    is_virtual!: boolean;
  }

  export class GetBlockByTimeParams {
    date!: string;
  }

  export class GetOperationKeysParams {
    operationTypeId!: number;
  }

  export class LastBlocksTypeResponse {
    block_num!: number;
    witness!: string;
    operations!: Hive.OperationsByTypeCount[];
  }

  export class GetLastOperationTypeCountsParams {
    "block-num"?: number | string;
    "result-limit"!: number;
  }

  export class GetOperationParams {
    operationId!: string;
  }

  export class GetOpsByAccountParams {
    accountName!: string;
    "operation-types"?: string;
    page?: number;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
  }

  export class GetAccountDetailsParams {
    accountName!: string;
  }

  export class OperationResponse {
    block!: number;
    op_pos!: number;
    operation_id!: string;
    op!: Hive.Operation;
    timestamp!: string;
    trx_id!: string;
    trx_in_block!: number;
    virtual_op!: boolean;
    op_type_id!: number;
  }

  export class GetAccountOperationTypesParams {
    accountName!: string;
  }

  export class AccountDetails {
    id!: number;
    name!: string;
    can_vote!: boolean;
    mined!: boolean;
    proxy!: string;
    recovery_account!: string;
    last_account_recovery!: Date;
    created!: Date;
    reputation!: number;
    json_metadata!: string;
    posting_json_metadata!: string;
    profile_image!: string;
    hbd_balance!: number;
    balance!: number;
    vesting_shares!: string;
    vesting_balance!: number;
    hbd_saving_balance!: number;
    savings_balance!: number;
    savings_withdraw_requests!: number;
    reward_hbd_balance!: number;
    reward_hive_balance!: number;
    reward_vesting_balance!: string;
    reward_vesting_hive!: number;
    posting_rewards!: string;
    curation_rewards!: string;
    delegated_vesting_shares!: string;
    received_vesting_shares!: string;
    proxied_vsf_votes!: number[] | string[];
    withdrawn!: string;
    vesting_withdraw_rate!: string;
    to_withdraw!: string;
    withdraw_routes!: number;
    delayed_vests!: string;
    witness_votes!: string[];
    witnesses_voted_for!: number;
    ops_count!: number;
    is_witness!: boolean;
  }

  export class GetAccountAuthoritiesParams {
    accountName!: string;
  }

  export class AccountAuthoritiesData {
    owner!: Hive.AuthKeys;
    active!: Hive.AuthKeys;
    posting!: Hive.AuthKeys;
    memo!: string;
    witness_signing!: string;
  }

  export class GetCommentOperationsParams {
    accountName!: string;
    permlink!: string;
    "operation-types"?: string;
    page?: number;
    "page-size"?: number;
    direction?: "asc" | "desc";
    "data-size-limit"?: number;
    // "from-block"?: number | Date;
    // "to-block"?: number | Date;
  }

  export class GetCommentPermlinksParams {
    accountName!: string;
    "comment-type"?: "post" | "comment" | "all";
    "operation-types"?: string;
    page?: number;
    "page-size"?: number;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
  }

  export class CommentOperationResponse {
    operations_result!: Hive.CommentOperation[];
    total_operations!: number;
    total_pages!: number;
  }

  export class Permlink {
    block!: number;
    operation_id!: string;
    permlink!: string;
    timestamp!: string;
    trx_id!: string;
  }

  export class BlockRange {
    from!: number;
    to!: number;
  }

  export class CommentPermlinksResponse {
    total_permlinks!: number;
    total_pages!: number;
    block_range!: BlockRange;
    permlinks_result!: Permlink[];
  }

  export class BlockSearchParams {
    "operation-types"?: string;
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "result-limit"?: number;
    direction!: Hive.Direction;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
    "path-filter"?: string;
  }

  export class BlocksResult {
    block_num!: number;
    created_at!: Date;
    producer_account!: string;
    producer_reward!: string;
    trx_count!: number;
    hash!: string;
    prev!: string;
    operations!: BlockOperationsCount[];
  }

  export class BlockByOpResponse {
    total_blocks!: number;
    total_pages!: number;
    block_range!: BlockRange;
    blocks_result!: BlocksResult[];
  }

  export class GetOperationsByBlockParams {
    blockNumber!: number | string;
    "operation-types"?: string;
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "page-order"?: Hive.Direction;
    "data-size-limit"?: number;
    "path-filter"?: string;
  }

  export class GetRawBlockParams {
    "from-block"!: number | string;
    "to-block"!: number | string;
  }

  export class TotalOperationsResponse {
    operations_result!: Hive.OperationResponse[];
    total_pages!: number;
    total_operations!: number;
  }

  export class RawBlockData {
    block_id!: string;
    extensions!: unknown[];
    previous!: string;
    signing_key!: string;
    timestamp!: Date;
    transaction_ids!: string[];
    transaction_merkle_root!: string;
    transactions!: Hive.TransactionDetails[];
    witness!: string;
    witness_signature!: string;
  }

  export class HiveBlogProps {
    id!: number;
    method!: string;
    jsonrpc!: string;
  }

  export class Supply {
    amount!: string;
    precision!: number;
    nai!: string;
  }

  export class PriceFeed {
    base!: Supply;
    quote!: Supply;
  }

  export class RewardFunds {
    id!: number;
    name!: string;
    reward_balance!: Supply;
    recent_claims!: string;
    last_update!: Date;
    content_constant!: string;
    percent_curation_rewards!: number;
    percent_content_rewards!: number;
    author_reward_curve!: string;
    curation_reward_curve!: string;
  }

  export class AccountOperationsResponse extends AccountOperationTypes {
    operations_result!: OperationResponse[];
  }

  export class VestingDelegations {
    delegatee!: string;
    delegator!: string;
    amount!: string;
    operation_id!: string;
    block_num!: number;
    vesting_shares!: Supply;
  }

  export class RCDelegations {
    delegated_rc!: number;
    from!: string;
    to!: string;
  }

  export interface BlockByOpResponse {
    block_num: number;
    op_type_id: number[];
  }

  export interface OperationsCount {
    total_operations: number;
    total_pages: number;
  }

  export interface CommentOperation {
    block_num: number;
    operation: Operation;
    is_modified: boolean;
    operation_id: number;
    permlink: string;
    created_at: Date;
    trx_hash: string;
  }

  export interface Manabars {
    upvote: IManabarData;
    downvote: IManabarData;
    rc: IManabarData;
  }

  export interface RawBlockData {
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

  export interface TransferOperation {
    from: string;
    to: string;
    amount: Supply | undefined;
    memo: string;
    request_id?: number;
    remaining_executions?: number;
    consecutive_failures?: number;
    deleted?: boolean;
  }

  export interface RecurrentTransferOperation extends TransferOperation {
    executions: number;
    recurrence: number;
  }

  export interface EscrowOperation {
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

  export interface CancelTransferOperation {
    request_id: number;
    from: string;
  }

  export interface AuthKeys {
    key_auths: [string | undefined, string | undefined][];
    account_auths: [string | undefined, string | undefined][];
    weight_threshold: number;
  }

  export interface AccountAuthoritiesData {
    owner: AuthKeys;
    active: AuthKeys;
    posting: AuthKeys;
    memo: string;
    witness_signing: string;
  }

  export class AccountBalanceHistory {
    block_num!: number;
    operation_id!: number;
    op_type_id!: number;
    balance!: number;
    prev_balance!: number;
    balance_change!: number;
    timestamp!: string;
  }
  export class AccountBalanceHistoryParams {
    "accountName": string;
    "coin-type": string;
    direction?: Hive.Direction;
    "page"!: number | undefined;
    "page-size"!: number | undefined;
    "from-block"?: Date | number | undefined;
    "to-block"?: Date | number | undefined;
  }
  export class AccountBalanceHistoryResponse {
    total_operations!: number;
    total_pages!: number;
    operations_result!: AccountBalanceHistory[];
  }
  export class AccountAggregatedBalanceHistoryParams {
    "accountName": string;
    "coin-type": string;
    "granularity": string;
    direction?: Hive.Direction;
    "from-block"?: Date | number | undefined;
    "to-block"?: Date | number | undefined;
  }
  export class AccountRecurrentBalanceTransfersParams {
    "accountName": string;
  }

  export class Balance {
    balance!: string;
    savings_balance!: string;
  }

  export class AccountAggregatedBalanceHistoryResponse {
    date!: Date;
    balance!: Balance;
    prev_balance!: Balance;
    min_balance!: Balance;
    max_balance!: Balance;
  }

  type Amount = {
    nai: string;
    amount: string;
    precision: number;
  };

  export class OutgoingRecurrentTransfer {
    to!: string;
    pair_id!: number;
    amount!: Amount;
    consecutive_failures!: number;
    remaining_executions!: number;
    recurrence!: number;
    memo!: string;
    trigger_date!: string;
    operation_id!: string;
    block_num!: number;
  }

  export class IncomingRecurrentTransfer {
    from!: string;
    pair_id!: number;
    amount!: Amount;
    consecutive_failures!: number;
    remaining_executions!: number;
    recurrence!: number;
    memo!: string;
    trigger_date!: string;
    operation_id!: string;
    block_num!: number;
  }

  export class AccountRecurrentBalanceTransfersResponse {
    outgoing_recurrent_transfers!: OutgoingRecurrentTransfer[];
    incoming_recurrent_transfers!: IncomingRecurrentTransfer[];
  }

  export class Delegation {
    delegator!: string;
    amount!: string;
    operation_id!: string;
    block_num!: number;
  }
  export class TwoDirectionDelegations {
    outgoing_delegations!: Delegation[];
    incoming_delegations!: Delegation[];
  }

  export class GetVestingDelegationsParams {
    accountName!: string;
  }
  export class VestingDelegationsResponse {
    total_operations!: number;
    total_pages!: number;
    operations_result!: TwoDirectionDelegations[];
  }

  export class MarketHistory {
    buckets!: MarketBucket[];
  }

  export class MarketBucket {
    id!: number;
    open!: string;
    seconds!: number;
    hive!: MarketData;
    symbol!: MarketSymbol;
    non_hive!: MarketData;
  }

  export class MarketData {
    high!: number;
    low!: number;
    open!: number;
    close!: number;
    volume!: number;
  }

  export class MarketSymbol {
    nai!: string;
    precision!: number;
  }
  export class Blocks {
    block_num!: number;
    created_at!: Date;
    producer_account!: string;
    producer_reward!: number;
    trx_count!: number;
    hash!: string;
    prev!: string;
    operations!: BlockOperationsCount[];
  }
  export class BlockOperationsCount {
    op_type_id!: number;
    op_count!: number;
  }
  export class AllBlocksSearchParams {
    "operation-types"?: string;
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "result-limit"?: number;
    direction!: Hive.Direction;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
    "path-filter"?: string;
  }

  export class AllBlocksSearchResponse {
    total_blocks!: number;
    total_pages!: number;
    blocks_result!: Blocks[];
    block_range!: {
      from: number;
      to: number;
    };
  }
}

export default Hive;
