import Hive from "./Hive";

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
  vests!: number;
  votes_hive_power!: number;
  votes_daily_change!: number;
  votes_daily_change_hive_power!: number;
  voters_num!: number;
  voters_num_daily_change!: number;
  price_feed!: number;
  bias!: number;
  feed_age!: string;
  feed_updated_at!: Date;
  block_size!: number;
  signing_key!: string;
  version!: string;
  missed_blocks!: number;
  hbd_interest_rate!: number;
}

export class RestGetVotersParamsReq {
  accountName!: string;
  sort?: string;
  direction?: Hive.Direction;
  limit?: number;
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
  limit!: number | null;
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
  blockNumber!: number;
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
  date!: Date;
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
  block_num!: number;
  op_in_trx!: number;
  operation_id!: string;
  operation!: Hive.Operation;
  timestamp!: string;
  trx_id!: string;
  trx_in_block!: number;
  virtual_op!: boolean;
  is_modified!: boolean;
  length!: number;
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

export const extendedRest = { 
  hafbe: {
    "block-numbers": {
      headblock: {
        params: undefined,
        result: Number,
      },
      "by-creation-date": {
        byTime: {
          params: RestGetBlockByTimeParamsReq,
          result: Number,
          urlPath: "{timestamp}"
        }
      }
    },
    "global-state": {
      params: RestGetBlockGlobalStateParamsReq,
      result: BlockDetails
    },
    witnesses: {
      params: RestGetWitnessesParamsReq,
      result: Witness,
      responseArray: true,
    },
    singleWitness: {
      params: RestGetWitnessParamsReq,
      result: Witness,
      urlPath: "{accountName}",
    },
    voters: {
      params: RestGetVotersParamsReq,
      result: Voter,
      urlPath: "{accountName}/voters",
      responseArray: true,
    },
    votesHistory: {
      params: RestGetVotesHistoryParamsReq,
      result: WitnessVotesHistory,
      urlPath: "{accountName}/votes/history",
      responseArray: true,
    },
    version: {
      params: undefined,
      result: String
    },
    "input-type": {
      inputType: {
        params: RestGetInputTypeParamsReq,
        result: InputTypeResponse,
        urlPath: "{inputType}"
      }
    },
    "operation-type-counts": {
      params: RestGetLastOperationTypeCountsParamsReq,
      result: LastBlocksTypeResponse,
      responseArray: true,
    },
    accounts: {
      account: {
        params: RestGetAccountDetailsParamsReq,
        result: AccountDetails,
        urlPath: "{accountName}"
      },
      authorities: {
        params: RestGetAccountAuthorities,
        result: AccountAuthoritiesData,
        urlPath: "{accountName}/authority"
      }
    }
  },
  hafah: {
    blocks: {
      block: {
        params: RestGetBlockDetailsParamsReq,
        result: BlockDetails,
        urlPath: "{blockNumber}"
      }
    },
    transactions: {
      transaction: {
        params: RestGetTransactionParamsReq,
        result: TransactionResponse,
        urlPath: "{transactionId}"
      }
    },
    "operation-types": {
      types: {
        params: undefined,
        result: OperationPattern,
        responseArray: true,
        urlPath: ""
      },
      operationKeys: {
        params: RestGetOperationKeysParamsReq,
        result: Array<string>,
        responseArray: true,
        urlPath: "{operationTypeId}/keys"
      }
    },
    operations: {
      byId: {
        params: RestGetOperationParamsReq,
        result: OperationResponse,
        urlPath: "{operationId}/"
      }
    },
    accounts: {
      operationTypes: {
        params: RestGetAccountOperationTypes,
        result: Number,
        responseArray: true,
        urlPath: "{accountName}/operation-types"
      },
      operations: {
        params: RestGetOpsByAccountParamsReq,
        result: OperationResponse,
        responseArray: true,
        urlPath: "{accountName}/operations"
      }
    }
  }
}