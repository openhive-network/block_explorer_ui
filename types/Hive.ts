import { IManabarData } from "@hiveio/wax";
namespace Hive {
  
  export type Direction = "asc" | "desc";

  export class RestGetWitnessesParamsReq {
    limit!: number;
    offset!: number;
    sort!: string;
    direction!: Hive.Direction;
  }
  
  export class RestGetWitnessParamsReq {
    accountName!: string;
  }
  
  export class Witness {
    witness!: string;
    rank!: number;
    url!: string;
    vests!: string;
    votes_daily_change!: number;
    votes_daily_change_hive_power!: number;
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
    vests_hive_power!: number;
  
  }
  
  export class RestGetVotersParamsReq {
    accountName!: string;
    sort?: string;
    direction?: Hive.Direction;
    "result-limit"?: number;
  }
  
  export class Voter {
    voter!: string;
    vests!: number;
    votes_hive_power!: number;
    account_vests!: number;
    account_hive_power!: number;
    proxied_vests!: number;
    proxied_hive_power!: number;
    timestamp!: Date;
  }
  
  
  export class RestGetVotesHistoryParamsReq {
    accountName!: string;
    sort?: string;
    direction?: Hive.Direction;
    "result-limit"!: number | null;
    "start-date"?: Date;
    "end-date"?: Date;
  }
  
  export class WitnessVotesHistory {
    voter!: string;
    approve!: boolean;
    vests!: number;
    vests_hive_power!: number;
    account_vests!: number;
    account_hive_power!: number;
    proxied_vests!: number;
    proxied_hive_power!: number;
    timestamp!: Date;
  }
  
  export class RestGetBlockDetailsParamsReq {
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
    total_vesting_shares!: string;
    transaction_merkle_root!: string;
    virtual_supply!: number;
    witness_signature!: string;
  }
  
  export class RestGetBlockGlobalStateParamsReq {
    "block-num"!: number;
  }
  
  export class RestGetInputTypeParamsReq {
    inputType!: string;
  }
  
  export class InputTypeResponse {
    input_type!: Hive.InputTypes;
    input_value!: string | string[];
  }
  
  export class RestGetTransactionParamsReq {
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
  
  export class RestGetBlockByTimeParamsReq {
    date!: string;
  }
  
  export class RestGetOperationKeysParamsReq{
    operationTypeId!: number;
  }
  
  export class LastBlocksTypeResponse {
    block_num!: number;
    witness!: string;
    ops_count!: Hive.OperationsByTypeCount[];
  }
  
  export class RestGetLastOperationTypeCountsParamsReq {
    "block-num"?: number;
    "result-limit"!: number;
  }
  
  export class RestGetOperationParamsReq {
    operationId!: number;
  }
  
  export class RestGetOpsByAccountParamsReq {
    accountName!: string;
    "operation-types"?: number[];
    page?: number;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number;
    "to-block"?: number;
    "start-date"?: Date;
    "end-date"?: Date;
  }
  
  export class RestGetAccountDetailsParamsReq {
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
  
  export class RestGetAccountOperationTypes {
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
  
  export class RestGetAccountAuthorities {
    accountName!: string;
  }
  
  export class AccountAuthoritiesData {
    owner!: Hive.AuthKeys;
    active!: Hive.AuthKeys;
    posting!: Hive.AuthKeys;
    memo!: string;
    witness_signing!: string;
  }
  
  export class RestGetCommentOperationsParamsReq {
    accountName!: string;
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
  
  export class CommentOperationResponse {
    operations_result!: Hive.CommentOperation[];
    total_operations!: number;
    total_pages!: number;
  }
  
  export class RestBlockSearchParamsReq {
    "operation-types"?: number[];
    page?: number;
    "result-limit"?: number;
    direction!: Hive.Direction;
    "account-name"?: string;
    "page-size"?: number;
    "data-size-limit"?: number;
    "from-block"?: number;
    "to-block"?: number;
    "start-date"?: Date;
    "end-date"?: Date;
    "path-filter"?: string;
  }
  
  export class BlockByOpResponse {
    block_num!: number;
    op_type_id!: number[];
  }
  
  export class RestGetOperationsByBlockParamsReq {
    blockNumber!: number;
    "operation-types"?: number[];
    "account-name"?: string;
    page?: number;
    "page-size"?: number;
    "page-order"?: Hive.Direction;
    "data-size-limit"?: number;
    "path-filter"?: string;
  }
  
  export class RestGetRawBlockParamsReq {
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

  export interface HiveBlogProps {
    id: number;
    method: string;
    jsonrpc: string;
  }

  export interface Supply {
    amount: string;
    precision: number;
    nai: string;
  }

  export interface OperationsByTypeCount {
    count: number;
    op_type_id: number;
  }

  export interface PriceFeed {
    base: Supply;
    quote: Supply;
  }

  export interface RewardFunds {
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

  export interface OperationResponse {
    block: number;
    op_pos: number;
    operation_id: string;
    op: Operation;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    op_type_id: number;
  }

  export interface TotalOperationsResponse {
    operations_result: OperationResponse[];
    total_pages: number;
    total_operations: number;
  }

  export interface AccountOperationsResponse extends OperationsCount {
    operations_result: OperationResponse[];
  }

  export type OperationTypes = [number, string, boolean];

  export interface OperationPattern {
    op_type_id: number;
    operation_name: string;
    is_virtual: boolean;
  }

  export interface TransactionQueryResponse {
    transaction_json: TransactionDetails;
    timestamp: Date;
    transaction_id: string;
    block_num: number;
    transaction_num: number;
  }

  export interface TransactionDetails {
    ref_block_num: number;
    ref_block_prefix: number;
    extensions: any[];
    expiration: Date;
    operations: Operation[];
    signatures: string[];
  }

  export interface AccountDetailsQueryResponse {
    id: number;
    name: string;
    can_vote: true;
    mined: true;
    proxy: string;
    recovery_account: string;
    last_account_recovery: Date;
    created: Date;
    reputation: number;
    json_metadata: string;
    posting_json_metadata: string;
    profile_image: string;
    hbd_balance: number;
    balance: number;
    vesting_shares: string;
    vesting_balance: number;
    hbd_saving_balance: number;
    savings_balance: number;
    savings_withdraw_requests: number;
    reward_hbd_balance: number;
    reward_hive_balance: number;
    reward_vesting_balance: string;
    reward_vesting_hive: number;
    posting_rewards: string;
    curation_rewards: string;
    delegated_vesting_shares: string;
    received_vesting_shares: string;
    proxied_vsf_votes: number[];
    withdrawn: string;
    vesting_withdraw_rate: string;
    to_withdraw: string;
    withdraw_routes: number;
    delayed_vests: string;
    witness_votes: string[];
    witnesses_voted_for: number;
    ops_count: number;
    is_witness: boolean;
  }

  export type InputTypes =
    | "account_name"
    | "account_name_array"
    | "block_num"
    | "transaction_hash"
    | "block_hash"
    | "invalid_input";

  export interface InputTypeResponse {
    input_type: InputTypes;
    input_value: string | string[];
  }

  export interface Voter {
    voter: string;
    vests: number;
    votes_hive_power: number;
    account_vests: number;
    account_hive_power: number;
    proxied_vests: number;
    proxied_hive_power: number;
    timestamp: Date;
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

  export interface WitnessVotesHistory {
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

  export interface BlockDetails {
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

  export interface BlockByOpResponse {
    block_num: number;
    op_type_id: number[];
  }

  export interface LastBlocksTypeResponse {
    block_num: number;
    witness: string;
    ops_count: OperationsByTypeCount[];
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

  export interface CommentOperationResponse extends OperationsCount {
    operations_result: CommentOperation[];
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
