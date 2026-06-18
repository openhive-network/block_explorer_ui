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
    get_chain_properties: TWaxApiRequest<{}, Hive.BlockChainProps>;
    get_witnesses_by_vote: TWaxApiRequest<unknown[], Hive.WitnessesByVote>;
    get_follow_count: TWaxApiRequest<
      { account: string },
      Hive.AccountFollowCount
    >;
    get_followers: TWaxApiRequest<
      { account: string; start: string; limit: number },
      Hive.AccountFollower[]
    >;
    get_accounts: TWaxApiRequest<unknown[], FindAccountsResponse[]>;
    get_following: TWaxApiRequest<{ account: string }, Hive.AccountFollowing>;
    list_proposals: TWaxApiRequest<
      [
        start: (string | number)[],
        limit: number,
        order_by:
          | "by_creator"
          | "by_start_date"
          | "by_end_date"
          | "by_total_votes",
        order_direction: "ascending" | "descending",
        status: "all" | "active" | "inactive" | "expired" | "votable",
      ],
      Hive.Proposal[]
    >;
    list_proposal_votes: TWaxApiRequest<
      [
        start: (string | number)[],
        limit: number,
        order_by: "by_voter_proposal" | "by_proposal_voter",
        order_direction: "ascending" | "descending",
        status: "all" | "active" | "expired" | "inactive" | "votable",
      ],
      Hive.ProposalVote[]
    >;
    find_proposals: TWaxApiRequest<[proposal_ids: number[]], Hive.Proposal[]>;
  };
  bridge: {
    get_account_posts: TWaxApiRequest<
      { sort: string; account: string; limit: number },
      Hive.AccountPostSummary[]
    >;
    get_discussion: TWaxApiRequest<
      { author: string; permlink: string; observer?: string },
      Hive.HivePosts
    >;
    list_all_subscriptions: TWaxApiRequest<
      { account: string },
      Hive.AccountSubscriptions
    >;
    get_community: TWaxApiRequest<
      { name: string; observer?: string },
      Hive.CommunityDetails
    >;
    list_subscribers: TWaxApiRequest<
      {
        community: string;
        last?: string;
        limit: number;
      },
      Hive.CommunitySubscribers
    >;
    list_communities: TWaxApiRequest<
      {
        last?: string;
        limit: number;
        query?: string;
        sort: string;
      },
      Hive.CommunityList
    >;
  };
  market_history_api: {
    get_market_history: TWaxApiRequest<
      { bucket_seconds: number; start: string | undefined; end: string },
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
      "participation-mode": accountOperationsProps.participationMode,
      page: accountOperationsProps.pageNumber,
      "page-size":
        accountOperationsProps.pageSize ?? config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block":
        accountOperationsProps.fromBlock || accountOperationsProps.startDate,
      "to-block":
        accountOperationsProps.toBlock || accountOperationsProps.endDate,
      "transacting-account-name": accountOperationsProps.transactingAccountName,
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
    voterName?: string,
    limit?: number
  ): Promise<Hive.WitnessVotersResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].voters({
      accountName: witness,
      sort,
      direction,
      page,
      "page-size": limit,
      "voter-name": voterName,
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

  async getAccounts(accounts: string[]): Promise<FindAccountsResponse[]> {
    return await this.extendedHiveChain!.api.condenser_api.get_accounts([
      accounts,
    ]);
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
    accountName: string
  ): Promise<Hive.RcDelegationsApiResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].rcDelegations({
      accountName,
    });
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
    page: number | null,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date,
    fromBlock?: number,
    toBlock?: number,
    voterName?: string
  ): Promise<Hive.WitnessesVotesHistoryResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].votesHistory({
      accountName: witnessName,
      direction,
      page: page,
      "page-size": limit,
      "from-block": fromTime || fromBlock,
      "to-block": toTime || toBlock,
      "voter-name": voterName,
    });
  }

  async getProposalVotesHistory(
    proposalId: number,
    direction: "asc" | "desc",
    page: number | null,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date,
    fromBlock?: number,
    toBlock?: number,
    voterName?: string
  ): Promise<Hive.ProposalVotesHistoryResponse> {
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].proposalVotesHistory({
      proposalId,
      direction,
      page,
      "page-size": limit,
      "from-block": fromTime || fromBlock,
      "to-block": toTime || toBlock,
      "voter-name": voterName,
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
    start: string | undefined,
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
      "to-block": toBlock ? toBlock : allBlockSearchProps?.endDate,
    };
    return await this.extendedHiveChain!.restApi["hafbe-api"].allBlockSearch(
      requestParams
    );
  }

  async getTransactionStatistics(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.TransactionStatisticsResponse> {
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].transactionStatistics({
      granularity,
      direction: direction,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getTransferStatistics(
    granularity: "hourly" | "daily" | "monthly" | "yearly",
    coinType: "HBD" | "HIVE",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.TransferStatisticsResponse[]> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].transferStatistics({
      granularity,
      "coin-type": coinType,
      "from-block": fromBlock,
      "to-block": toBlock,
      direction: direction, // Move direction after coin-type
    });
  }

  async getTotalWalletAddresses(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.WalletStatsResponse[]> {
    return await this.extendedHiveChain!.restApi[
      "hafbe-api"
    ].totalWalletAddresses({
      granularity,
      direction,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getAccountFollowCount(
    account: string
  ): Promise<Hive.AccountFollowCount> {
    const params = { account };
    return await this.extendedHiveChain!.api.condenser_api.get_follow_count(
      params
    );
  }

  async getAccountSubscriptions(
    account: string
  ): Promise<Hive.AccountSubscriptions> {
    const params = { account };
    return await this.extendedHiveChain!.api.bridge.list_all_subscriptions(
      params
    );
  }

  async getAccountFollowers(account: string): Promise<Hive.AccountFollower[]> {
    const allFollowers: Hive.AccountFollower[] = [];
    let start = "";
    const limit = 1000; // The maximum number of followers to fetch per API call.

    while (true) {
      try {
        const params = { account, start, limit };
        const results: Hive.AccountFollower[] =
          await this.extendedHiveChain!.api.condenser_api.get_followers(params);

        // If the API returns an empty array, we have finished fetching all pages.
        if (results.length === 0) {
          break;
        }

        let followersToProcess = results;
        if (start && results[0].follower === start) {
          followersToProcess = results.slice(1);
        }

        if (followersToProcess.length > 0) {
          allFollowers.push(...followersToProcess);
        }

        if (results.length < limit) {
          break;
        }

        start = results[results.length - 1].follower;
      } catch (error) {
        throw error;
      }
    }

    return allFollowers;
  }
  async getAccountFollowing(account: string): Promise<Hive.AccountFollowing> {
    const params = { account };
    return await this.extendedHiveChain!.api.condenser_api.get_following(
      params
    );
  }

  async getCommunityDetails(name: string): Promise<Hive.CommunityDetails> {
    const params = { name };
    return await this.extendedHiveChain!.api.bridge.get_community(params);
  }

  async getCommunitySubscribers(
    community: string,
    last: string | undefined,
    limit: number
  ): Promise<Hive.CommunitySubscribers> {
    const params = { community, last, limit };
    return await this.extendedHiveChain!.api.bridge.list_subscribers(params);
  }

  async getCommunitiesList(
    last: string,
    limit: number,
    query: string,
    sort: "rank" | "new" | "subs" = "rank"
  ): Promise<Hive.CommunityList> {
    const params: {
      limit: number;
      sort: string;
      last?: string;
      query?: string;
    } = {
      limit,
      sort,
    };

    if (last) {
      params.last = last;
    }

    if (query) {
      params.query = query;
    }
    return await this.extendedHiveChain!.api.bridge.list_communities(params);
  }

  async listProposals(
    start: (string | number)[],
    limit: number,
    orderBy: "by_creator" | "by_start_date" | "by_end_date" | "by_total_votes",
    orderDirection: "ascending" | "descending",
    status: "all" | "active" | "inactive" | "expired" | "votable"
  ): Promise<Hive.Proposal[]> {
    const response =
      await this.extendedHiveChain!.api.condenser_api.list_proposals([
        start,
        limit,
        orderBy,
        orderDirection,
        status,
      ]);
    return Array.isArray(response) ? response : [];
  }

  async listProposalVotes(
    start: (string | number)[],
    limit: number,
    orderBy: "by_voter_proposal" | "by_proposal_voter",
    orderDirection: "ascending" | "descending",
    status: "all" | "active" | "inactive" | "expired" | "votable"
  ): Promise<Hive.ProposalVote[]> {
    const response =
      await this.extendedHiveChain!.api.condenser_api.list_proposal_votes([
        start,
        limit,
        orderBy,
        orderDirection,
        status,
      ]);
    return Array.isArray(response) ? response : [];
  }

  async getProposal(proposalId: number[]): Promise<Hive.Proposal[]> {
    return await this.extendedHiveChain!.api.condenser_api.find_proposals([
      proposalId,
    ]);
  }

  async getBlockChainProps(): Promise<Hive.BlockChainProps> {
    return await this.extendedHiveChain!.api.condenser_api.get_chain_properties(
      []
    );
  }

  async getProxyPower(
    accountName: string,
    page: number,
    sort?: string,
    direction?: Hive.Direction
  ): Promise<Hive.ProxyPowerResponse> {
    return await this.extendedHiveChain!.restApi["hafbe-api"].proxyPower({
      accountName,
      page,
      sort,
      direction,
    });
  }
  async getTopHolders(
    coinType: "HIVE" | "HBD" | "VESTS",
    balanceType: "balance" | "savings_balance",
    page: number
  ): Promise<Hive.TopHoldersResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].topHolders({
      "coin-type": coinType,
      "balance-type": balanceType,
      page,
    });
  }

  async getTotalValueLocked(): Promise<Hive.TotalValueLocked> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].totalValueLocked();
  }

  async getVestingStats(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc" = "asc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.VestingStatsResponse[]> {
    return await this.extendedHiveChain!.restApi["balance-api"].vestingStats({
      granularity,
      direction,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getAccountVestingStats(
    accountName: string,
    granularity: "daily" | "monthly" | "yearly" = "daily",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined,
    direction: "asc" | "desc" = "asc"
  ): Promise<Hive.AccountVestingStatsResponse[]> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].accountVestingStats({
      accountName,
      granularity,
      direction,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getAccountVestingHistory(
    accountName: string,
    filter: Hive.VestingHistoryFilter = "all",
    page: number | undefined,
    pageSize: number | undefined,
    direction: "asc" | "desc" = "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.AccountVestingHistoryResponse> {
    return await this.extendedHiveChain!.restApi[
      "balance-api"
    ].accountVestingHistory({
      accountName,
      filter,
      direction,
      page,
      "page-size": pageSize,
      "from-block": fromBlock,
      "to-block": toBlock,
    });
  }

  async getAccountBalances(
    accountName: string
  ): Promise<Hive.AccountBalancesResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].accountBalances(
      {
        accountName,
      }
    );
  }

  async getAccountPosts(
    accountName: string,
    limit: number = 50
  ): Promise<Hive.AccountPostSummary[]> {
    return await this.extendedHiveChain!.api.bridge.get_account_posts({
      sort: "posts",
      account: accountName,
      limit,
    });
  }

  async getPendingAuthorRewards(
    accountName: string
  ): Promise<Hive.PendingAuthorRewardsResponse> {
    return await this.extendedHiveChain!.restApi[
      "hivemind-api"
    ].accounts.pendingAuthorRewards({ accountName });
  }

  async getPendingCurationRewards(
    accountName: string
  ): Promise<Hive.PendingCurationRewardsResponse> {
    return await this.extendedHiveChain!.restApi[
      "hivemind-api"
    ].accounts.pendingCurationRewards({ accountName });
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
