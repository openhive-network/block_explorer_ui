import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { GetDynamicGlobalPropertiesResponse, IHiveChainInterface, TWaxApiRequest, TWaxExtended } from "@hiveio/wax";

type ExplorerNodeApi = {
  database_api: {
    get_reward_funds: TWaxApiRequest<{}, { funds: Hive.RewardFunds[] }>
    get_current_price_feed: TWaxApiRequest<{}, Hive.PriceFeed>
  },
  condenser_api: {
    get_vesting_delegations: TWaxApiRequest<[string, string | null, number], any>
    list_rc_direct_delegations: TWaxApiRequest<[[string, ""], number], any>
  }
}

class FetchingService {
  private apiUrl: string | null = null;
  private nodeUrl: string | null = null;
  private extendedHiveChain: TWaxExtended<ExplorerNodeApi> | undefined = undefined;
  private testApiAddress: string = "https://local.bc.fqdn.pl/hafbe";

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  public setHiveChain(hiveChain: IHiveChainInterface | null) {
    this.extendedHiveChain = hiveChain?.extend<ExplorerNodeApi>();
    if (this.extendedHiveChain && this.nodeUrl) {
      this.extendedHiveChain.endpointUrl = this.nodeUrl;
    }
  }

  async makePostRequest<T>(url: string, requestBody: T) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(`No data from API endpoint: ${url}`);
      return jsonResponse;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async callApi<T>(methodName: string, requestBody: T) {
    const url = `${this.apiUrl}/${methodName}`;
    return await this.makePostRequest(url, requestBody);
  }

  async callNode<T>(methodName: string) {
    const url = `${this.nodeUrl}`;
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: methodName,
      id: 1,
    };
    return await this.makePostRequest(url, requestBody);
  }

  async makeGetRequest(url: string) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(`No data from API endpoint: ${url}`);
      return jsonResponse;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async callRestApi(methodName: string, params?: Record<string, any>) {
    let queryString = "";
    if (params) {
      queryString = "?" + Object.keys(params)
        .map((key) => {
          const value = params[key];
          if (!value) return undefined;
          if (Array.isArray(value)) {
            return `${encodeURIComponent(key)}=${value.map(item => encodeURIComponent(item)).join(',')}`;
          }
          if (value instanceof Date) return `${encodeURIComponent(key)}=${encodeURIComponent(value.toDateString())}`;
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .filter((element) => element)
        .join('&');
    }
    const url = `${this.testApiAddress}/${methodName}${queryString}`;
    return await this.makeGetRequest(url);
  }

  async getHeadBlockNum(): Promise<number> {
    return await this.callRestApi("block-numbers/headblock");
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.callRestApi(`blocks/${blockNumber}`);
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestParams: Hive.RestGetLastBlocksParams = {limit};
    return await this.callRestApi("blocks", requestParams);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.callRestApi(`input-type/${input}`);
  }

  async getOpsByBlock(
    blockNumber: number,
    filter?: number[],
    page?: number,
    accountName?: string,
    keyContent?: string,
    setOfKeys?: string[]
  ): Promise<Hive.OperationResponse[]> {
    const requestParams: Hive.RestGetOpsByBlockParams = {
      "operation-types": filter,
      "account-name": accountName,
      page,
      "page-size": 1000,
      "set-of-keys": setOfKeys,
      "key-content": keyContent,
      direction: "desc",
      "data-size-limit": config.opsBodyLimit
    }
    return await this.callRestApi(`blocks/${blockNumber}/operations`, requestParams);
  }


  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    return await this.callRestApi(`transactions/${transactionHash}`);
  }

  async getRewardFunds(): Promise<{ funds: Hive.RewardFunds[] }> {
    return await this.extendedHiveChain!.api.database_api.get_reward_funds({});
  }

  async getDynamicGlobalProperties(): Promise<GetDynamicGlobalPropertiesResponse> {
    return await this.extendedHiveChain!.api.database_api.get_dynamic_global_properties({});
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeed> {
    return await this.extendedHiveChain!.api.database_api.get_current_price_feed({});
  }

  async getAccOpTypes(accountName: string): Promise<unknown> {
    return await this.callRestApi(`accounts/${accountName}/operations/types`);
  }

  async getOpsByAccount(
    accountOperationsProps: Explorer.AccountSearchOperationsProps
  ): Promise<Hive.OperationResponse[]> {
    const requestParams: Hive.RestGetOpsByAccountParams = {
      "operation-types": accountOperationsProps.operationTypes,
      page: accountOperationsProps.pageNumber,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block": accountOperationsProps.fromBlock,
      "to-block": accountOperationsProps.toBlock,
      "start-date": accountOperationsProps.startDate,
      "end-date": accountOperationsProps.endDate
    }
    return await this.callRestApi(`accounts/${accountOperationsProps.accountName}/operations`, requestParams);
  }

  async getAccount(account: string): Promise<Hive.AccountDetailsQueryResponse> {
    return await this.callRestApi(`accounts/${account}`);
  }

  async getWitnesses(
    limit: number,
    offset: number,
    sort: string,
    direction: "asc" | "desc"
  ): Promise<Hive.Witness[]> {
    const requestParams: Hive.RestGetWitnessesParams = {
      limit,
      offset,
      sort,
      direction
    }
    return await this.callRestApi("witnesses", requestParams);
  }

  async getWitnessVoters(
    witness: string,
    sort: string,
    direction: "asc" | "desc",
    limit?: number
  ): Promise<Hive.Voter[]> {
    const requestParams: Hive.RestGetWitnessesVotersParams = {
      sort,
      direction,
      limit
    }
    return await this.callRestApi(`witnesses/${witness}/voters`, requestParams);
  }

  // Temporary untill I will find a way to solve cors.
  async getOperationTypes(
  ): Promise<Hive.OperationPattern[]> {
    return await this.callRestApi("operation-types/");
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    return await this.callRestApi(`witnesses/${witnessName}`);
  }

  async getVestingDelegations(delegatorAccount: string, startAccount: string | null, limit: number): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.get_vesting_delegations([delegatorAccount, startAccount, limit]);
  }

  async getRcDelegations (delegatorAccount: string, limit: number): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.list_rc_direct_delegations([[delegatorAccount, ""], limit]);
  }

  async getBlockByTime(date: Date): Promise<number> {
    return await this.callRestApi(`block-numbers/by-creation-date/${date.toDateString()}`);
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    return await this.callRestApi(`operation-keys/${operationTypeId}`);
  }

  async getBlockByOp(
    blockSearchProps: Explorer.BlockSearchProps
  ): Promise<Hive.BlockByOpResponse[]> {
    const requestParams: Hive.RestBlockSearchParams = {
      "operation-types": blockSearchProps.operationTypes || [],
      "account-name": blockSearchProps?.accountName,
      "set-of-keys": blockSearchProps.deepProps.keys,
      "key-content": blockSearchProps.deepProps.content,
      direction: "desc",
      "from-block": blockSearchProps.fromBlock,
      "to-block": blockSearchProps.toBlock,
      "start-date": blockSearchProps.startDate,
      "end-date": blockSearchProps.endDate,
      limit: blockSearchProps.limit
    }
    return await this.callRestApi("block-numbers", requestParams);
  }

  async getWitnessVotesHistory(
    witnessName: string,
    direction: "asc" | "desc",
    sort: string,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date
  ): Promise<Hive.WitnessVotesHistory[]> {
    const requestParams: Hive.RestWitnessVotesHistoryParams = {
      sort,
      direction,
      limit,
      "start-date": fromTime,
      "end-date": toTime
    }
    return await this.callRestApi(`witnesses/${witnessName}/votes/history`, requestParams)
  }

  async getOperation(operationId: number): Promise<Hive.OperationResponse> {
    return await this.callRestApi(`operations/${operationId}/`);
  }

  async getCommentOperation(
    commentSearchProps: Explorer.CommentSearchProps
  ): Promise<Hive.CommentOperationResponse> {
    const requestParams: Hive.RestCommentsParams = {
      "operation-types": commentSearchProps.operationTypes,
      page: commentSearchProps.pageNumber,
      permlink: commentSearchProps.permlink,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block": commentSearchProps.fromBlock,
      "to-block": commentSearchProps.toBlock,
      "start-date": commentSearchProps.startDate,
      "end-date": commentSearchProps.endDate
    }
    return await this.callRestApi(`accounts/${commentSearchProps.accountName}/operations/comments`, requestParams);

  }

  async getHafbeVersion(): Promise<string> {
    return await this.callRestApi("hafbe-version");
  }

  async getOperationsCountInBlock(
    blockNumber: number
  ): Promise<Hive.OperationsByTypeCount[]> {
    return await this.callRestApi(`blocks/${blockNumber}/operations/count`);
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    return await this.callRestApi("/block-numbers/headblock");
  }

  async getBlockRaw(blockNumber: number): Promise<Hive.RawBlockData> {
    return await this.callRestApi(`blocks/${blockNumber}/raw-details`);
  }

  async getAccountAuthorities(accountName: string): Promise<Hive.AccountAuthoritiesData> {
    return await this.callRestApi(`accounts/${accountName}/authority`);
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
}

const fetchingService = new FetchingService();

export default fetchingService;
