import Hive from "./Hive";

export const extendedRest = { 
  hafbe: {
    "last-synced-block": {
      params: undefined,
      result: Number
    },
    "block-numbers": {
      params: Hive.RestBlockSearchParamsReq,
      result: Hive.BlockByOpResponse,
      responseArray: true
    },
    witnesses: {
      params: Hive.RestGetWitnessesParamsReq,
      result: Hive.Witness,
      responseArray: true,
    },
    singleWitness: {
      params: Hive.RestGetWitnessParamsReq,
      result: Hive.Witness,
      urlPath: "witnesses/{accountName}",
    },
    voters: {
      params: Hive.RestGetVotersParamsReq,
      result: Hive.Voter,
      urlPath: "witnesses/{accountName}/voters",
      responseArray: true,
    },
    votesHistory: {
      params: Hive.RestGetVotesHistoryParamsReq,
      result: Hive.WitnessVotesHistory,
      urlPath: "witnesses/{accountName}/votes/history",
      responseArray: true,
    },
    version: {
      params: undefined,
      result: String
    },
    "input-type": {
      inputType: {
        params: Hive.RestGetInputTypeParamsReq,
        result: Hive.InputTypeResponse,
        urlPath: "{inputType}"
      }
    },
    "operation-type-counts": {
      params: Hive.RestGetLastOperationTypeCountsParamsReq,
      result: Hive.LastBlocksTypeResponse,
      responseArray: true,
    },
    accounts: {
      account: {
        params: Hive.RestGetAccountDetailsParamsReq,
        result: Hive.AccountDetails,
        urlPath: "{accountName}"
      },
      authorities: {
        params: Hive.RestGetAccountAuthorities,
        result: Hive.AccountAuthoritiesData,
        urlPath: "{accountName}/authority"
      },
      commentOperations: {
        params: Hive.RestGetCommentOperationsParamsReq,
        result: Hive.CommentOperationResponse,
        urlPath: "{accountName}/comment-operations"
      },
    }
  },
  hafah: {
    block: {
      params: Hive.RestGetBlockDetailsParamsReq,
      result: Hive.BlockDetails,
      urlPath: "blocks/{blockNumber}"
    },
    blockOperations: {
      params: Hive.RestGetOperationsByBlockParamsReq,
      result: Hive.TotalOperationsResponse,
      urlPath: "blocks/{blockNumber}/operations"
    },
    rawBlock: {
      params: Hive.RestGetRawBlockParamsReq,
      result: Hive.RawBlockData,
      responseArray: true,
      urlPath: "blocks"
    },
    transactions: {
      transaction: {
        params: Hive.RestGetTransactionParamsReq,
        result: Hive.TransactionResponse,
        urlPath: "{transactionId}"
      }
    },
    "operation-types": {
      types: {
        params: undefined,
        result: Hive.OperationPattern,
        responseArray: true,
        urlPath: ""
      },
      operationKeys: {
        params: Hive.RestGetOperationKeysParamsReq,
        result: Array<string>,
        responseArray: true,
        urlPath: "{operationTypeId}/keys"
      }
    },
    operations: {
      byId: {
        params: Hive.RestGetOperationParamsReq,
        result: Hive.OperationResponse,
        urlPath: "{operationId}/"
      }
    },
    accounts: {
      operationTypes: {
        params: Hive.RestGetAccountOperationTypes,
        result: Number,
        responseArray: true,
        urlPath: "{accountName}/operation-types"
      },
      operations: {
        params: Hive.RestGetOpsByAccountParamsReq,
        result: Hive.OperationResponse,
        responseArray: true,
        urlPath: "{accountName}/operations"
      },
    },
    headblock: {
      params: undefined,
      result: Number,
    },
    "global-state": {
      params: Hive.RestGetBlockGlobalStateParamsReq,
      result: Hive.BlockDetails
    },
    "block-number-by-date": {
      byTime: {
        params: Hive.RestGetBlockByTimeParamsReq,
        result: Number,
        urlPath: "{date}"
      }
    }
  }
}