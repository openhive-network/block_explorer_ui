import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import {
  GetDynamicGlobalPropertiesResponse,
  IHiveChainInterface,
  TWaxRestExtended,
  TWaxApiRequest,
  TWaxExtended,
  FindAccountsResponse,
} from "@hiveio/wax";
import { extendedRest } from "@/types/Rest";
import { createPathFilterString } from "@/lib/utils";

export type ExplorerNodeApi = {
  database_api: {
    find_accounts: TWaxApiRequest<{}, FindAccountsResponse[]>;
    get_reward_funds: TWaxApiRequest<{}, { funds: Hive.RewardFunds[] }>;
    get_current_price_feed: TWaxApiRequest<{}, Hive.PriceFeed>;
    find_vesting_delegations: TWaxApiRequest<
      { account: string },
      { delegations: Hive.VestingDelegations[] }
    >;
    get_witness_schedule: TWaxApiRequest<
      { id: number },
      Hive.WitnessesSchedule
    >;
  };
  rc_api: {
    list_rc_direct_delegations: TWaxApiRequest<
      { start: [string, string]; limit: number },
      { rc_direct_delegations: Hive.RCDelegations[] }
    >;
  };
  condenser_api: {
    get_witnesses_by_vote: TWaxApiRequest<unknown[], Hive.WitnessesByVote>;
  };
  bridge: {
    get_discussion: TWaxApiRequest<
      { author: string; permlink: string; observer?: string },
      Hive.HivePosts
    >;
  };
  market_history_api: {
    get_market_history: TWaxApiRequest<
      { bucket_seconds: number; start: string; end: string },
      Hive.MarketHistory[]
    >;
  };
};

class FetchingService {
  private apiUrl: string | null = null;
  private nodeUrl: string | null = null;
  private extendedHiveChain:
    | TWaxExtended<ExplorerNodeApi, TWaxRestExtended<typeof extendedRest>>
    | undefined = undefined;

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  public setHiveChain(hiveChain: IHiveChainInterface | null) {
    this.extendedHiveChain = hiveChain
      ?.extend<ExplorerNodeApi>()
      .extendRest(extendedRest);
    if (this.extendedHiveChain && this.nodeUrl) {
      this.extendedHiveChain.endpointUrl = this.nodeUrl;
    }
    if (this.extendedHiveChain && this.apiUrl) {
      this.extendedHiveChain.restApi.endpointUrl = this.apiUrl;
    }
  }

  async getHeadBlockNum(): Promise<number> {
    return await this.extendedHiveChain!.restApi["hafah-api"].headblock();
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].lastSyncedBlock();
  }

  async getBlock(
    blockNumber: number | string,
    includeVirtual: boolean
  ): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi["hafah-api"].block({
      blockNumber,
      "include-virtual": includeVirtual,
    });
  }

  async getBlockGlobalState(
    blockNumber: number | string
  ): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi["hafah-api"].globalState({
      "block-num": String(blockNumber),
    });
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].operationTypeCounts({
      "result-limit": limit,
    });
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].inputType({
      inputType: input,
    });
  }

  async getOpsByBlock(
    blockNumber: number | string,
    filter?: number[],
    page?: number,
    accountName?: string,
    keyContent?: string,
    setOfKeys?: string[]
  ): Promise<Hive.TotalOperationsResponse> {
    const requestParams: Hive.GetOperationsByBlockParams = {
      blockNumber,
      "operation-types": filter?.join(","),
      "account-name": accountName,
      page,
      "page-size": config.blockPagePaginationSize,
      "page-order": "desc",
      "data-size-limit": config.opsBodyLimit,
      "path-filter": createPathFilterString(keyContent, setOfKeys),
    };
    return await this.extendedHiveChain!.restApi["hafah-api"].blockOperations(
      requestParams
    );
  }

  async getTransaction(
    transactionHash: string,
    includeVirtual: boolean
  ): Promise<Hive.TransactionResponse> {
    return await this.extendedHiveChain!.restApi[
      "hafah-api"
    ].transactions.transaction({
      transactionId: transactionHash,
      "include-virtual": includeVirtual,
    });
  }

  async getRewardFunds(): Promise<{ funds: Hive.RewardFunds[] }> {
    return await this.extendedHiveChain!.api.database_api.get_reward_funds({});
  }

  async getDynamicGlobalProperties(): Promise<GetDynamicGlobalPropertiesResponse> {
    return await this.extendedHiveChain!.api.database_api.get_dynamic_global_properties(
      {}
    );
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeed> {
    return await this.extendedHiveChain!.api.database_api.get_current_price_feed(
      {}
    );
  }

  async findAccounts(
    accounts: string[],
    delayed_votes_active: boolean = true
  ): Promise<FindAccountsResponse> {
    return await this.extendedHiveChain!.api.database_api.find_accounts({
      accounts,
      delayed_votes_active,
    });
  }

  async getAccOpTypes(accountName: string): Promise<number[]> {
    return await this.extendedHiveChain!.restApi[
      "hafah-api"
    ].accounts.operationTypes({
      accountName,
    });
  }

  async getOpsByAccount(
    accountOperationsProps: Explorer.AccountSearchOperationsProps
  ): Promise<Hive.AccountOperationsResponse> {
    const requestParams: Hive.GetOpsByAccountParams = {
      accountName: accountOperationsProps.accountName,
      "operation-types": accountOperationsProps.operationTypes?.join(","),
      page: accountOperationsProps.pageNumber,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block":
        accountOperationsProps.fromBlock || accountOperationsProps.startDate,
      "to-block":
        accountOperationsProps.toBlock || accountOperationsProps.endDate,
    };
    return await this.extendedHiveChain!.restApi[
      "hafah-api"
    ].accounts.operations(requestParams);
  }

  async getAccount(accountName: string): Promise<Hive.AccountDetails> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].accounts.account({
      accountName,
    });
  }

  async getAccountRecurrentTransfers(
    accountName: string
  ): Promise<Hive.AccountRecurrentBalanceTransfersResponse> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].recurrentTransfers({
      accountName,
    });
  }

  async getWitnesses(
    limit: number,
    offset: number,
    sort: string,
    direction: "asc" | "desc"
  ): Promise<Hive.WitnessesResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].witnesses({
      "page-size": limit,
      offset,
      sort,
      direction,
    });
  }

  async getWitnessVoters(
    witness: string,
    sort: string,
    direction: "asc" | "desc",
    page: number,
    limit?: number
  ): Promise<Hive.WitnessVotersResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].voters({
      accountName: witness,
      sort,
      direction,
      page,
      "page-size": limit,
    });
  }

  async getWitnessSchedule(): Promise<Hive.WitnessesSchedule> {
    const params = { id: 1, include_future: false };

    return await this.extendedHiveChain!.api.database_api.get_witness_schedule(
      params
    );
  }

  async getWitnessesByVote(): Promise<Hive.WitnessesByVote> {
    // First param - accountName
    // second - limit
    const params = ["", 100];

    return await this.extendedHiveChain!.api.condenser_api.get_witnesses_by_vote(
      params
    );
  }

  async getPostDiscussion(
    author: string,
    permlink: string,
    observer: string = ""
  ): Promise<Hive.HivePosts> {
    const params = { author, permlink, observer };

    return await this.extendedHiveChain!.api.bridge.get_discussion(params);
  }

  async getOperationTypes(): Promise<Hive.OperationPattern[]> {
    return await this.extendedHiveChain!.restApi["hafah-api"].operationTypes();
  }

  async getWitness(witnessName: string): Promise<Hive.SingleWitnessResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].singleWitness({
      accountName: witnessName,
    });
  }

  async getVestingDelegations(
    delegatorAccount: string
  ): Promise<Hive.VestingDelegationsResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].delegations({
      accountName: delegatorAccount,
    });
  }

  async getRcDelegations(
    delegatorAccount: string,
    limit: number
  ): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.rc_api.list_rc_direct_delegations({
      start: [delegatorAccount, ""],
      limit: limit,
    }).then((response) => response.rc_direct_delegations);
  }

  async getBlockByTime(date: Date): Promise<number> {
    return await this.extendedHiveChain!.restApi["hafah-api"].blockNumberByDate(
      {
        date: date.toISOString(),
      }
    );
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    return await this.extendedHiveChain!.restApi[
      "hafah-api"
    ].operationTypesKeys({
      operationTypeId,
    });
  }

  async getBlockByOp(
    blockSearchProps: Explorer.BlockSearchProps
  ): Promise<Hive.BlockByOpResponse> {
    const requestParams: Hive.BlockSearchParams = {
      "operation-types": blockSearchProps.operationTypes?.join(","),
      "account-name": blockSearchProps?.accountName,
      "page-size": 100,
      direction: "desc",
      "from-block": blockSearchProps.fromBlock || blockSearchProps.startDate,
      "to-block": blockSearchProps.toBlock || blockSearchProps.endDate,
    };
    return await this.extendedHiveChain!.restApi["hafbe-api"].blockSearch(
      requestParams
    );
  }

  async getWitnessVotesHistory(
    witnessName: string,
    direction: "asc" | "desc",
    sort: string,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date
  ): Promise<Hive.WitnessesVotesHistoryResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].votesHistory({
      accountName: witnessName,
      direction,
      sort,
      "result-limit": limit,
      "from-block": fromTime,
      "to-block": toTime,
    });
  }

  async getOperation(operationId: string): Promise<Hive.OperationResponse> {
    return await this.extendedHiveChain!.restApi["hafah-api"].operations.byId({
      operationId,
    });
  }

  async getCommentOperation(
    commentSearchProps: Explorer.CommentSearchProps
  ): Promise<Hive.CommentOperationResponse> {
    const requestParams: Hive.GetCommentOperationsParams = {
      accountName: commentSearchProps.accountName,
      permlink: commentSearchProps.permlink,
      "operation-types": commentSearchProps.operationTypes?.join(","),
      page: commentSearchProps.pageNumber,
      "page-size": config.standardPaginationSize,
      direction: "desc",
      "data-size-limit": config.opsBodyLimit,
    };
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].accounts.commentOperations(requestParams);
  }

  async getCommentPermlinks(
    permlinkSearchProps: Explorer.PermlinkSearchProps
  ): Promise<Hive.CommentPermlinksResponse> {
    const requestParams: Hive.GetCommentPermlinksParams = {
      accountName: permlinkSearchProps.accountName,
      "comment-type": permlinkSearchProps.commentType as
        | "all"
        | "post"
        | "comment",
      page: permlinkSearchProps.page || 1,
      "page-size": config.standardPaginationSize,
      "from-block":
        permlinkSearchProps.fromBlock || permlinkSearchProps.startDate,
      "to-block": permlinkSearchProps.toBlock || permlinkSearchProps.endDate,
    };
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].accounts.commentPermlinks(requestParams);
  }

  async getHafbeVersion(): Promise<string> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].version();
  }

  async getOperationsCountInBlock(
    blockNumber: number | string
  ): Promise<Hive.LastBlocksTypeResponse> {
    return (
      await this.extendedHiveChain!.restApi["hafbe-api"].operationTypeCounts({
        "result-limit": 1,
        "block-num": blockNumber,
      })
    )[0];
  }

  async getAccountAuthorities(
    accountName: string
  ): Promise<Hive.AccountAuthoritiesData | undefined> {
    return await this.extendedHiveChain?.restApi[
      "hafbe-api"
    ].accounts.authorities({
      accountName,
    });
  }

  async getManabars(
    accountName: string,
    hiveChain: IHiveChainInterface
  ): Promise<Hive.Manabars | null> {
    try {
      const upvotePromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        0
      );
      const downvotePromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        1
      );
      const rcPromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        2
      );
      const manabars = await Promise.all([
        upvotePromise,
        downvotePromise,
        rcPromise,
      ]);
      return { upvote: manabars[0], downvote: manabars[1], rc: manabars[2] };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async geAccounttBalanceHistory(
    accountName: string,
    coinType: string,
    page: number | undefined,
    pageSize: number | undefined,
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.AccountBalanceHistoryResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].balanceHistory({
      accountName,
      "coin-type": coinType,
      direction: direction,
      page: page,
      "page-size": pageSize,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async geAccountAggregatedtBalanceHistory(
    accountName: string,
    coinType: string,
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.AccountAggregatedBalanceHistoryResponse> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].aggregatedHistory({
      accountName,
      "coin-type": coinType,
      granularity: granularity,
      direction: direction,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getMarketHistory(
    bucketSeconds: number,
    start: string,
    end: string
  ): Promise<Hive.MarketHistory[]> {
    return await this.extendedHiveChain!.api.market_history_api.get_market_history(
      {
        bucket_seconds: bucketSeconds,
        start,
        end,
      }
    );
  }

  async getAllBlocksByOp(
    allBlockSearchProps: Explorer.AllBlocksSearchProps | undefined,
    pageNum: number | undefined,
    toBlock: number | undefined
  ): Promise<Hive.AllBlocksSearchResponse> {
    const requestParams: Hive.AllBlocksSearchParams = {
      "operation-types": allBlockSearchProps
        ? allBlockSearchProps.operationTypes?.join(",")
        : undefined,
      "account-name": allBlockSearchProps
        ? allBlockSearchProps?.accountName
        : undefined,
      page: pageNum,
      "page-size": 100,
      direction: "desc",
      "from-block": allBlockSearchProps
        ? allBlockSearchProps.fromBlock || allBlockSearchProps.startDate
        : undefined,
      "to-block":
        toBlock,
    };
    return await this.extendedHiveChain!.restApi["hafbe-api"].allBlockSearch(
      requestParams
    );
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
