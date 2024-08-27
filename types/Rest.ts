import Hive from "./Hive";


/**
 * Tree-like structure of data to fetched, used by Wax to connect with REST API.
 * Params and results are typed as classes.
 * If responseArray = true, the response is in array format.
 * {} in URL are dynamic params. The name is important and should be synchronized with params types.
 */
export const extendedRest = { 
  hafbe: {
    lastSyncedBlock: {
      params: undefined,
      result: Number,
      urlPath: "last-synced-block"
    },
    blockNumbers: {
      params: Hive.RestBlockSearchParamsReq,
      result: Hive.BlockByOpResponse,
      responseArray: true,
      urlPath: "block-numbers"
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
    inputType: {
      params: Hive.RestGetInputTypeParamsReq,
      result: Hive.InputTypeResponse,
      urlPath: "input-type/{inputType}"
    },
    operationTypeCounts: {
      params: Hive.RestGetLastOperationTypeCountsParamsReq,
      result: Hive.LastBlocksTypeResponse,
      responseArray: true,
      urlPath: "operation-type-counts"
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
    operationTypes: {
      params: undefined,
      result: Hive.OperationPattern,
      responseArray: true,
      urlPath: "operation-types"
    },
    operationTypesKeys: {
      params: Hive.RestGetOperationKeysParamsReq,
      result: Array<string>,
      responseArray: true,
      urlPath: "operation-types/{operationTypeId}/keys"
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
        result: Hive.AccountOperationsResponse,
        urlPath: "{accountName}/operations"
      },
    },
    headblock: {
      params: undefined,
      result: Number,
    },
    globalState: {
      params: Hive.RestGetBlockGlobalStateParamsReq,
      result: Hive.BlockDetails,
      urlPath: "global-state"
    },
    blockNumberByDate: {
      byTime: {
        params: Hive.RestGetBlockByTimeParamsReq,
        result: Number,
        urlPath: "block-number-by-date/{date}"
      }
    }
  }
}