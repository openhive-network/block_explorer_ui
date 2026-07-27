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
import {
  classifyEndpointError,
  EndpointUnsupportedError,
  isNaiAmount,
} from "@/utils/nodeSupport";

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

  // Wrap a REST call so a definitive missing-endpoint 404 surfaces as a typed
  // EndpointUnsupportedError (reported to nodeSupportStore -> graceful widget
  // fallback). Transient failures pass through unchanged.
  private async withNodeSupport<T>(
    supportKey: string,
    call: () => Promise<T>
  ): Promise<T> {
    try {
      return await call();
    } catch (err) {
      throw classifyEndpointError(err, supportKey);
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
    return this.withNodeSupport("hafbe-api:transaction-statistics", () =>
      this.extendedHiveChain!.restApi["hafbe-api"].transactionStatistics({
        granularity,
        direction: direction,
        "from-block": fromBlock,
        "to-block": toBlock,
      })
    );
  }

  async getOperationTypeStatistics(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc",
    fromBlock?: Date | number,
    toBlock?: Date | number,
    opTypes?: number[]
  ): Promise<Hive.OperationTypeStatisticsResponse[]> {
    return this.withNodeSupport("hafbe-api:operation-type-statistics", () =>
      this.extendedHiveChain!.restApi["hafbe-api"].operationTypeStatistics({
        granularity,
        direction,
        "from-block": fromBlock,
        "to-block": toBlock,
        "op-types": opTypes?.join(","),
      })
    );
  }

  async getTransferStatistics(
    granularity: "hourly" | "daily" | "monthly" | "yearly",
    coinType: "HBD" | "HIVE",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.TransferStatisticsResponse[]> {
    return this.withNodeSupport("balance-api:transfer-statistics", async () => {
      const rows = await this.extendedHiveChain!.restApi[
        "balance-api"
      ].transferStatistics({
        granularity,
        "coin-type": coinType,
        "from-block": fromBlock,
        "to-block": toBlock,
        direction: direction, // Move direction after coin-type
      });
      // Older nodes serve the *_transfer_amount fields as bare strings instead of
      // NAI objects, which silently renders $0 — treat that version-skew as an
      // unavailable endpoint rather than showing misleading zeros. Sample the
      // first row that actually carries an amount (a null/empty leading bucket on
      // a healthy node must not false-trigger this).
      const sample = rows?.find((r) => r?.total_transfer_amount != null);
      if (sample && !isNaiAmount(sample.total_transfer_amount)) {
        throw new EndpointUnsupportedError("balance-api:transfer-statistics", {
          transient: false,
        });
      }
      return rows;
    });
  }

  async getTotalWalletAddresses(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.WalletStatsResponse[]> {
    return this.withNodeSupport("hafbe-api:wallet-stats", () =>
      this.extendedHiveChain!.restApi["hafbe-api"].totalWalletAddresses({
        granularity,
        direction,
        "from-block": fromBlock,
        "to-block": toBlock,
      })
    );
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
    page: number,
    minBalance?: number,
    maxBalance?: number
  ): Promise<Hive.TopHoldersResponse> {
    return await this.extendedHiveChain!.restApi["balance-api"].topHolders({
      "coin-type": coinType,
      "balance-type": balanceType,
      page,
      ...(minBalance !== undefined ? { "min-balance": minBalance } : {}),
      ...(maxBalance !== undefined ? { "max-balance": maxBalance } : {}),
    });
  }

  async getTotalValueLocked(): Promise<Hive.TotalValueLocked> {
    return this.withNodeSupport("balance-api:tvl", () =>
      this.extendedHiveChain!.restApi["balance-api"].totalValueLocked()
    );
  }

  async getVestingStats(
    granularity: "daily" | "monthly" | "yearly",
    direction: "asc" | "desc" = "asc",
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined
  ): Promise<Hive.VestingStatsResponse[]> {
    return this.withNodeSupport("balance-api:vesting-stats", () =>
      this.extendedHiveChain!.restApi["balance-api"].vestingStats({
        granularity,
        direction,
        "from-block": fromBlock,
        "to-block": toBlock,
      })
    );
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

  async getDailyActiveUsers(
    fromBlock?: Date | number | undefined,
    toBlock?: Date | number | undefined,
    granularity?: "day" | "week" | "month",
    operationTypes?: string
  ): Promise<Hive.DailyActiveUsersResponse[]> {
    const params = {
      from_date: fromBlock,
      to_date: toBlock,
      granularity,
      operation_types: operationTypes?.trim(),
    };
    return this.withNodeSupport("haf-stats-api:daily-active-users", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].dailyActiveUsers(params)
    );
  }
  async getNetworkVoteStats(
    from?: string,
    to?: string,
    granularity?: "day" | "week" | "month"
  ): Promise<Hive.NetworkVoteStatsResponse[]> {
    return this.withNodeSupport("haf-stats-api:vote-stats", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkVoteStats({
        from_date: from,
        to_date: to,
        granularity,
      })
    );
  }

  async getNetworkHpDistribution(): Promise<
    Hive.NetworkHpDistributionResponse[]
  > {
    return this.withNodeSupport("haf-stats-api:hp-distribution", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkHpDistribution({})
    );
  }

  async getGovernanceInfluenceConcentration(): Promise<
    Hive.GovernanceInfluenceConcentrationResponse[]
  > {
    return await this.extendedHiveChain!.restApi[
      "haf-stats-api"
    ].governanceInfluenceConcentration({});
  }

  async getNetworkRcUtilization(
    from?: string | Date | number,
    to?: string | Date | number,
    granularity?: "day" | "week" | "month"
  ): Promise<Hive.NetworkRcUtilizationResponse[]> {
    return this.withNodeSupport("haf-stats-api:rc-utilization", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkRcUtilization({
        from_date: from,
        to_date: to,
        granularity,
      })
    );
  }

  async getNetworkContentVolume(
    from?: Date | number | undefined,
    to?: Date | number | undefined,
    granularity?: "day" | "week" | "month"
  ): Promise<Hive.NetworkContentVolumeResponse[]> {
    return this.withNodeSupport("haf-stats-api:content-volume", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkContentVolume({
        from_date: from,
        to_date: to,
        granularity,
      })
    );
  }

  async getNetworkEngagement(
    from?: Date | number | undefined,
    to?: Date | number | undefined,
    granularity?: "day" | "week" | "month"
  ): Promise<Hive.NetworkEngagementResponse[]> {
    return this.withNodeSupport("haf-stats-api:engagement", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkEngagement({
        from_date: from,
        to_date: to,
        granularity,
      })
    );
  }

  async getAccountFunnel(
    from?: Date | number,
    to?: Date | number
  ): Promise<Hive.AccountFunnelResponse[]> {
    return this.withNodeSupport("haf-stats-api:account-funnel", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].accountFunnel({
        from_date: from,
        to_date: to,
      })
    );
  }

  async getNetworkAuthorRetention(
    from?: string | Date | number,
    to?: string | Date | number
  ): Promise<Hive.NetworkAuthorRetentionResponse[]> {
    return this.withNodeSupport("haf-stats-api:author-retention", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkAuthorRetention({
        from_date: from,
        to_date: to,
      })
    );
  }

  async getNetworkTopCustomJson(
    params: Hive.NetworkTopCustomJsonParams
  ): Promise<Hive.NetworkTopCustomJsonRow[]> {
    return this.withNodeSupport("haf-stats-api:top-custom-json", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkTopCustomJson(
        params
      )
    );
  }

  async getNetworkCustomJsonUsage(
    params: Hive.NetworkCustomJsonUsageParams
  ): Promise<Hive.NetworkCustomJsonUsageRow[]> {
    return this.withNodeSupport("haf-stats-api:custom-json-usage", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].networkCustomJsonUsage(
        params
      )
    );
  }

  async getCustomJsonAppRegistry(): Promise<Hive.CustomJsonAppRegistryRow[]> {
    return this.withNodeSupport("haf-stats-api:custom-json-registry", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].customJsonAppRegistry({})
    );
  }

  async getAccountContentStats(
    accountName: string,
    from?: Date | number | undefined,
    to?: Date | number | undefined,
    granularity?: "day" | "week" | "month"
  ): Promise<Hive.AccountContentStatsResponse[]> {
    return this.withNodeSupport("haf-stats-api:content-stats", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].accountContentStats({
        accountName,
        from_date: from,
        to_date: to,
        granularity,
      })
    );
  }

  async getNetworkTopAccounts(
    metric: Hive.TopAccountsMetric,
    fromDate?: string | Date | number,
    toDate?: string | Date | number,
    limitCount?: number
  ): Promise<Hive.TopAccountsResponse[]> {
    return this.withNodeSupport("haf-stats-api:top-accounts", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].topAccounts({
        metric,
        from_date: fromDate,
        to_date: toDate,
        limit_count: limitCount,
      })
    );
  }

  async getAccountDappFootprint(
    account: string,
    fromDate?: string | Date | number,
    toDate?: string | Date | number
  ): Promise<Hive.AccountDappFootprintResponse> {
    return this.withNodeSupport("haf-stats-api:dapp-footprint", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].accountDappFootprint({
        account,
        from_date: fromDate,
        to_date: toDate,
      })
    );
  }

  async getAccountRcFootprint(
    account: string,
    fromDate?: string | Date | number,
    toDate?: string | Date | number,
    groupBy: "op_type" | "app" = "op_type"
  ): Promise<Hive.AccountRcFootprintRow[]> {
    return this.withNodeSupport("haf-stats-api:rc-footprint", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].accountRcFootprint({
        account,
        from_date: fromDate,
        to_date: toDate,
        group_by: groupBy,
      })
    );
  }

  async getAccountRcFootprintTimeline(
    account: string,
    params: {
      fromDate?: string | Date | number;
      toDate?: string | Date | number;
      appFilter?: string;
      opTypeFilter?: string;
      limitCount?: number;
      beforeSeq?: number;
    }
  ): Promise<Hive.AccountRcFootprintTimelineRow[]> {
    return await this.extendedHiveChain!.restApi[
      "haf-stats-api"
    ].accountRcFootprintTimeline({
      account,
      from_date: params.fromDate,
      to_date: params.toDate,
      app_filter: params.appFilter,
      op_type_filter: params.opTypeFilter,
      limit_count: params.limitCount,
      before_seq: params.beforeSeq,
    });
  }

  async getFinancialSummary(
    account: string,
    fromDate?: string,
    toDate?: string,
    granularity: "day" | "week" | "month" = "month"
  ): Promise<Hive.FinancialSummaryRow[]> {
    return this.withNodeSupport("haf-stats-api:financial-summary", () =>
      this.extendedHiveChain!.restApi["haf-stats-api"].accountFinancialSummary({
        account,
        from_date: fromDate,
        to_date: toDate,
        granularity,
      })
    );
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
