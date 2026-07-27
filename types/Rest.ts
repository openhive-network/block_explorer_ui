import Hive from "./Hive";

/**
 * Tree-like structure of data to fetched, used by Wax to connect with REST API.
 * Params and results are typed as classes.
 * If responseArray = true, the response is in array format.
 * {} in URL are dynamic params. The name is important and should be synchronized with params types.
 */
export const extendedRest = {
  "hafbe-api": {
    lastSyncedBlock: {
      params: undefined,
      result: Number,
      urlPath: "last-synced-block",
    },
    blockSearch: {
      params: Hive.BlockSearchParams,
      result: Hive.BlockByOpResponse,
      urlPath: "block-search",
    },
    witnesses: {
      params: Hive.GetWitnessesParams,
      result: Hive.WitnessesResponse,
    },
    singleWitness: {
      params: Hive.GetWitnessParams,
      result: Hive.SingleWitnessResponse,
      urlPath: "witnesses/{accountName}",
    },
    voters: {
      params: Hive.GetVotersParams,
      result: Hive.WitnessVotersResponse,
      urlPath: "witnesses/{accountName}/voters",
    },
    votesHistory: {
      params: Hive.GetVotesHistoryParams,
      result: Hive.WitnessesVotesHistoryResponse,
      urlPath: "witnesses/{accountName}/votes/history",
    },
    proposalVotesHistory: {
      params: Hive.GetProposalVotesHistoryParams,
      result: Hive.ProposalVotesHistoryResponse,
      urlPath: "proposals/{proposalId}/votes/history",
    },
    version: {
      params: undefined,
      result: String,
    },
    inputType: {
      params: Hive.GetInputTypeParams,
      result: Hive.InputTypeResponse,
      urlPath: "input-type/{inputType}",
    },
    operationTypeCounts: {
      params: Hive.GetLastOperationTypeCountsParams,
      result: Hive.LastBlocksTypeResponse,
      responseArray: true,
      urlPath: "operation-type-counts",
    },
    accounts: {
      account: {
        params: Hive.GetAccountDetailsParams,
        result: Hive.AccountDetails,
        urlPath: "{accountName}",
      },
      authorities: {
        params: Hive.GetAccountAuthoritiesParams,
        result: Hive.AccountAuthoritiesData,
        urlPath: "{accountName}/authority",
      },
      commentOperations: {
        params: Hive.GetCommentOperationsParams,
        result: Hive.CommentOperationResponse,
        urlPath: "{accountName}/operations/comments/{permlink}",
      },
      commentPermlinks: {
        params: Hive.GetCommentPermlinksParams,
        result: Hive.CommentPermlinksResponse,
        urlPath: "{accountName}/comment-permlinks",
      },
    },
    allBlockSearch: {
      params: Hive.AllBlocksSearchParams,
      result: Hive.AllBlocksSearchResponse,
      urlPath: "block-search",
    },
    transactionStatistics: {
      params: Hive.TransactionStatisticsParams,
      result: Hive.TransactionStatisticsResponse,
      urlPath: "transaction-statistics",
    },
    operationTypeStatistics: {
      params: Hive.OperationTypeStatisticsParams,
      result: Hive.OperationTypeStatisticsResponse,
      responseArray: true,
      urlPath: "operation-type-statistics",
    },
    proxyPower: {
      params: Hive.ProxyPowerParams,
      result: Hive.ProxyPowerResponse,
      urlPath: "accounts/{accountName}/proxy-power",
    },
    totalWalletAddresses: {
      params: Hive.WalletStatsParams,
      result: Hive.WalletStatsResponse,
      responseArray: true,
      urlPath: "total_wallet_addresses",
    },
  },
  "hafah-api": {
    block: {
      params: Hive.GetBlockDetailsParams,
      result: Hive.BlockDetails,
      urlPath: "blocks/{blockNumber}",
    },
    blockOperations: {
      params: Hive.GetOperationsByBlockParams,
      result: Hive.TotalOperationsResponse,
      urlPath: "blocks/{blockNumber}/operations",
    },
    transactions: {
      transaction: {
        params: Hive.GetTransactionParams,
        result: Hive.TransactionResponse,
        urlPath: "{transactionId}",
      },
    },
    operationTypes: {
      params: undefined,
      result: Hive.OperationPattern,
      responseArray: true,
      urlPath: "operation-types",
    },
    operationTypesKeys: {
      params: Hive.GetOperationKeysParams,
      result: Array<string>,
      responseArray: true,
      urlPath: "operation-types/{operationTypeId}/keys",
    },
    operations: {
      byId: {
        params: Hive.GetOperationParams,
        result: Hive.OperationResponse,
        urlPath: "{operationId}/",
      },
    },
    accounts: {
      operationTypes: {
        params: Hive.GetAccountOperationTypesParams,
        result: Number,
        responseArray: true,
        urlPath: "{accountName}/operation-types",
      },
      operations: {
        params: Hive.GetOpsByAccountParams,
        result: Hive.AccountOperationsResponse,
        urlPath: "{accountName}/operations",
      },
    },
    headblock: {
      params: undefined,
      result: Number,
    },
    globalState: {
      params: Hive.GetBlockGlobalStateParams,
      result: Hive.BlockDetails,
      urlPath: "global-state",
    },
    blockNumberByDate: {
      params: Hive.GetBlockByTimeParams,
      result: Number,
      urlPath: "block-number-by-date/{date}",
    },
  },
  "balance-api": {
    balanceHistory: {
      params: Hive.AccountBalanceHistoryParams,
      result: Hive.AccountBalanceHistoryResponse,
      urlPath: "accounts/{accountName}/balance-history",
    },
    delegations: {
      params: Hive.GetVestingDelegationsParams,
      result: Hive.VestingDelegationsResponse,
      urlPath: "accounts/{accountName}/delegations",
    },
    aggregatedHistory: {
      params: Hive.AccountAggregatedBalanceHistoryParams,
      result: Hive.AccountAggregatedBalanceHistoryResponse,
      urlPath: "accounts/{accountName}/aggregated-history",
    },
    recurrentTransfers: {
      params: Hive.AccountRecurrentBalanceTransfersParams,
      result: Hive.AccountRecurrentBalanceTransfersResponse,
      urlPath: "accounts/{accountName}/recurrent-transfers",
    },
    topHolders: {
      params: Hive.GetTopHoldersParams,
      result: Hive.TopHoldersResponse,
      urlPath: "top-holders",
    },
    transferStatistics: {
      params: Hive.TransferStatisticsParams,
      result: Hive.TransferStatisticsResponse,
      responseArray: true,
      urlPath: "transfer-statistics",
    },
    totalValueLocked: {
      params: undefined,
      result: Hive.TotalValueLocked,
      urlPath: "total-value-locked",
    },
    vestingStats: {
      params: Hive.VestingStatsParams,
      result: Hive.VestingStatsResponse,
      responseArray: true,
      urlPath: "vesting-stats",
    },
    accountBalances: {
      params: Hive.AccountBalancesParams,
      result: Hive.AccountBalancesResponse,
      urlPath: "accounts/{accountName}/balances",
    },
    rcDelegations: {
      params: Hive.GetRcDelegationsParams,
      result: Hive.RcDelegationsApiResponse,
      urlPath: "accounts/{accountName}/rc-delegations",
    },
    accountVestingStats: {
      params: Hive.AccountVestingStatsParams,
      result: Hive.AccountVestingStatsResponse,
      responseArray: true,
      urlPath: "accounts/{accountName}/vesting-stats",
    },
    accountVestingHistory: {
      params: Hive.AccountVestingHistoryParams,
      result: Hive.AccountVestingHistoryResponse,
      urlPath: "accounts/{accountName}/vesting-history",
    },
  },
  "haf-stats-api": {
    networkVoteStats: {
      params: Hive.NetworkVoteStatsParams,
      result: Hive.NetworkVoteStatsResponse,
      responseArray: true,
      urlPath: "network/vote-stats",
    },
    dailyActiveUsers: {
      params: Hive.DailyActiveUsersParams,
      result: Hive.DailyActiveUsersResponse,
      responseArray: true,
      urlPath: "network/daily-active-users",
    },
    networkHpDistribution: {
      params: Hive.NetworkHpDistributionParams,
      result: Hive.NetworkHpDistributionResponse,
      responseArray: true,
      urlPath: "network/hp-distribution",
    },
    governanceInfluenceConcentration: {
      params: Hive.GovernanceInfluenceConcentrationParams,
      result: Hive.GovernanceInfluenceConcentrationResponse,
      responseArray: true,
      urlPath: "governance/influence-concentration",
    },
    accountFunnel: {
      params: Hive.AccountFunnelParams,
      result: Hive.AccountFunnelResponse,
      responseArray: true,
      urlPath: "network/account-funnel",
    },
    topAccounts: {
      params: Hive.TopAccountsParams,
      result: Hive.TopAccountsResponse,
      responseArray: true,
      urlPath: "network/top-accounts",
    },
    networkRcUtilization: {
      params: Hive.NetworkRcUtilizationParams,
      result: Hive.NetworkRcUtilizationResponse,
      responseArray: true,
      urlPath: "network/rc-utilization",
    },
    networkContentVolume: {
      params: Hive.NetworkContentVolumeParams,
      result: Hive.NetworkContentVolumeResponse,
      responseArray: true,
      urlPath: "network/content-volume",
    },
    networkEngagement: {
      params: Hive.NetworkEngagementParams,
      result: Hive.NetworkEngagementResponse,
      responseArray: true,
      urlPath: "network/engagement",
    },
    networkAuthorRetention: {
      params: Hive.NetworkAuthorRetentionParams,
      result: Hive.NetworkAuthorRetentionResponse,
      responseArray: true,
      urlPath: "network/author-retention",
    },
    networkTopCustomJson: {
      params: Hive.NetworkTopCustomJsonParams,
      result: Hive.NetworkTopCustomJsonRow,
      responseArray: true,
      urlPath: "network/top-custom-json",
    },
    networkCustomJsonUsage: {
      params: Hive.NetworkCustomJsonUsageParams,
      result: Hive.NetworkCustomJsonUsageRow,
      responseArray: true,
      urlPath: "network/custom-json-usage",
    },
    customJsonAppRegistry: {
      params: Hive.CustomJsonAppRegistryParams,
      result: Hive.CustomJsonAppRegistryRow,
      responseArray: true,
      urlPath: "custom-json-app-registry",
    },
    accountContentStats: {
      params: Hive.AccountContentStatsParams,
      result: Hive.AccountContentStatsResponse,
      responseArray: true,
      urlPath: "account/{accountName}/content-stats",
    },
    accountDappFootprint: {
      params: Hive.AccountDappFootprintParams,
      result: Hive.AccountDappFootprintResponse,
      urlPath: "account/{account}/dapp-footprint",
    },
    accountRcFootprint: {
      params: Hive.AccountRcFootprintParams,
      result: Hive.AccountRcFootprintRow,
      responseArray: true,
      urlPath: "account/{account}/rc-footprint",
    },
    accountRcFootprintTimeline: {
      params: Hive.AccountRcFootprintTimelineParams,
      result: Hive.AccountRcFootprintTimelineRow,
      responseArray: true,
      urlPath: "account/{account}/rc-footprint-timeline",
    },
    accountFinancialSummary: {
      params: Hive.AccountFinancialSummaryParams,
      result: Hive.FinancialSummaryRow,
      responseArray: true,
      urlPath: "account/{account}/financial-summary",
    },
  },
};
