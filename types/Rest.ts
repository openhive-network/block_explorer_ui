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
      params: Hive.BlockSearchParams,
      result: Hive.BlockByOpResponse,
      responseArray: true,
      urlPath: "block-numbers"
    },
    witnesses: {
      params: Hive.GetWitnessesParams,
      result: Hive.Witness,
      responseArray: true,
    },
    singleWitness: {
      params: Hive.GetWitnessParams,
      result: Hive.Witness,
      urlPath: "witnesses/{accountName}",
    },
    voters: {
      params: Hive.GetVotersParams,
      result: Hive.Voter,
      urlPath: "witnesses/{accountName}/voters",
      responseArray: true,
    },
    votesHistory: {
      params: Hive.GetVotesHistoryParams,
      result: Hive.WitnessVotesHistory,
      urlPath: "witnesses/{accountName}/votes/history",
      responseArray: true,
    },
    version: {
      params: undefined,
      result: String
    },
    inputType: {
      params: Hive.GetInputTypeParams,
      result: Hive.InputTypeResponse,
      urlPath: "input-type/{inputType}"
    },
    operationTypeCounts: {
      params: Hive.GetLastOperationTypeCountsParams,
      result: Hive.LastBlocksTypeResponse,
      responseArray: true,
      urlPath: "operation-type-counts"
    },
    accounts: {
      account: {
        params: Hive.GetAccountDetailsParams,
        result: Hive.AccountDetails,
        urlPath: "{accountName}"
      },
      authorities: {
        params: Hive.GetAccountAuthoritiesParams,
        result: Hive.AccountAuthoritiesData,
        urlPath: "{accountName}/authority"
      },
      commentOperations: {
        params: Hive.GetCommentOperationsParams,
        result: Hive.CommentOperationResponse,
        urlPath: "{accountName}/comment-operations"
      },
    }
  },
  hafah: {
    block: {
      params: Hive.GetBlockDetailsParams,
      result: Hive.BlockDetails,
      urlPath: "blocks/{blockNumber}"
    },
    blockOperations: {
      params: Hive.GetOperationsByBlockParams,
      result: Hive.TotalOperationsResponse,
      urlPath: "blocks/{blockNumber}/operations"
    },
    rawBlock: {
      params: Hive.GetRawBlockParams,
      result: Hive.RawBlockData,
      responseArray: true,
      urlPath: "blocks"
    },
    transactions: {
      transaction: {
        params: Hive.GetTransactionParams,
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
      params: Hive.GetOperationKeysParams,
      result: Array<string>,
      responseArray: true,
      urlPath: "operation-types/{operationTypeId}/keys"
    },
    operations: {
      byId: {
        params: Hive.GetOperationParams,
        result: Hive.OperationResponse,
        urlPath: "{operationId}/"
      }
    },
    accounts: {
      operationTypes: {
        params: Hive.GetAccountOperationTypesParams,
        result: Number,
        responseArray: true,
        urlPath: "{accountName}/operation-types"
      },
      operations: {
        params: Hive.GetOpsByAccountParams,
        result: Hive.AccountOperationsResponse,
        urlPath: "{accountName}/operations"
      },
    },
    headblock: {
      params: undefined,
      result: Number,
    },
    globalState: {
      params: Hive.GetBlockGlobalStateParams,
      result: Hive.BlockDetails,
      urlPath: "global-state"
    },
    blockNumberByDate: {
      params: Hive.GetBlockByTimeParams,
      result: Number,
      urlPath: "block-number-by-date/{date}"
    }
  }
}