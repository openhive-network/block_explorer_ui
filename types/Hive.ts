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
    count: number;
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
    block_num: number;
    operation: Operation;
    is_modified: boolean;
    operation_id: number;
    permlink: string;
    created_at: Date;
    trx_hash: string;
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
    witnesses!: Witness[];
    votes_updated_at!: Date;
  }

  export class SingleWitnessResponse {
    witness!: Witness;
    votes_updated_at!: Date;
  }

  export class WitnessVotersResponse {
    total_operations!: number;
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
    blockNumber!: number;
  }

  export class BlockDetails {
    block_num!: number;
    created_at!: string;
    current_hbd_supply!: number;
    current_supply!: number;
    dhf_interval_ledger!: number;
    extensions!: null;
    hash!: string;
    hbd_interest_rate!: number;
    prev!: string;
    producer_account!: string;
    signing_key!: string;
    total_reward_fund_hive!: number;
    total_vesting_fund_hive!: number;
    total_vesting_shares!: number;
    transaction_merkle_root!: string;
    virtual_supply!: number;
    witness_signature!: string;
  }

  export class GetBlockGlobalStateParams {
    "block-num"!: number;
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
    ops_count!: Hive.OperationsByTypeCount[];
  }

  export class GetLastOperationTypeCountsParams {
    "block-num"?: number;
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
    can_vote!: true;
    mined!: true;
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
    proxied_vsf_votes!: number[];
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
    "operation-types"?: string;
    page?: number;
    permlink?: string;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
  }

  export class CommentOperationResponse {
    operations_result!: Hive.CommentOperation[];
    total_operations!: number;
    total_pages!: number;
  }

  export class BlockSearchParams {
    "operation-types"?: string;
    page?: number;
    "result-limit"?: number;
    direction!: Hive.Direction;
    "account-name"?: string;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number | Date;
    "to-block"?: number | Date;
    "path-filter"?: string;
  }

  export class BlockByOpResponse {
    block_num!: number;
    op_type_id!: number[];
  }

  export class GetOperationsByBlockParams {
    blockNumber!: number;
    "operation-types"?: string;
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "page-order"?: Hive.Direction;
    "data-size-limit"?: number;
    "path-filter"?: string;
  }

  export class GetRawBlockParams {
    "from-block"!: number;
    "to-block"!: number;
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
    id!: number;
    min_delegation_time!: string;
    vesting_shares!: Supply;
  }

  export class RCDelegations {
    delegated_rc!: number;
    from!: string;
    to!: string;
  }

  export interface VestingDelegations {
    delegatee: string;
    delegator: string;
    id: number;
    min_delegation_time: string;
    vesting_shares: {
      amount: string;
      precision: number;
      nai: string;
    };
  }

  export interface RCDelegations {
    delegated_rc: number;
    from: string;
    to: string;
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
}

export default Hive;
