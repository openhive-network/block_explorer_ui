import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { GetDynamicGlobalPropertiesResponse, IHiveChainInterface, TWaxRestExtended, TWaxApiRequest, TWaxExtended } from "@hiveio/wax";
import { RestGetWitnessParamsReq, RestGetWitnessesParamsReq, Witness } from "@/types/Rest";

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

class A {}
class B {}


const extendedRest = { hafbe: {
  "block-numbers": {
    headblock: {
      params: undefined,
      result: Number,
    }
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
    params: A,
    result: B,
    urlPath: "{accountName}/voters",
  },
  votersCount: {
    params: A,
    result: B,
    urlPath: "{accountName}/voters/count",
  },
  votesHistory: {
    params: A,
    result: B,
    urlPath: "{accountName}/votes/history",
  }
}}

class FetchingService {
  private apiUrl: string | null = null;
  private nodeUrl: string | null = null;
  private extendedHiveChain: TWaxExtended<ExplorerNodeApi> | undefined = undefined;
  private extendedRestChain: TWaxRestExtended<typeof extendedRest> | undefined = undefined;
  private testApiAddress: string = "https://local.bc.fqdn.pl";

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  public setHiveChain(hiveChain: IHiveChainInterface | null) {
    this.extendedHiveChain = hiveChain?.extend<ExplorerNodeApi>();
    this.extendedRestChain = hiveChain?.extendRest(extendedRest);
    if (this.extendedRestChain) {
      this.extendedRestChain.endpointUrl = this.testApiAddress;
    }
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

  async callRestApi(apiName: string, methodName: string, params?: Record<string, any>) {
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
    const url = `${this.testApiAddress}/${apiName}/${methodName}${queryString}`;
    return await this.makeGetRequest(url);
  }

  async getHeadBlockNum(): Promise<number> {
    return await this.callRestApi("hafbe", "block-numbers/headblock");
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.callRestApi("hafah", `blocks/${blockNumber}/`);
  }

  async getBlockGlobalState(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.callRestApi("hafbe", `blocks/${blockNumber}/global-state/`)
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestParams: Hive.RestGetLastBlocksParams = {limit};
    return await this.callRestApi("hafbe", "operation-types/count", requestParams);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.callRestApi("hafbe", `input-type/${input}`);
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
      "page-size": config.blockPagePaginationSize,
      "set-of-keys": setOfKeys,
      "key-content": keyContent,
      "page-order": "desc",
      "data-size-limit": config.opsBodyLimit
    }
    return await this.callRestApi("hafbe", `blocks/${blockNumber}/operations`, requestParams);
  }


  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    return await this.callRestApi("hafah", `transactions/${transactionHash}`);
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
    return await this.callRestApi("hafah", `accounts/${accountName}/operation-types`);
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
    return await this.callRestApi("hafbe", `accounts/${accountOperationsProps.accountName}/operations`, requestParams);
  }

  async getAccount(account: string): Promise<Hive.AccountDetailsQueryResponse> {
    return await this.callRestApi("hafbe", `accounts/${account}`);
  }

  async getWitnesses(
    limit: number,
    offset: number,
    sort: string,
    direction: "asc" | "desc"
  ): Promise<Witness[]> {
    const requestParams: Hive.RestGetWitnessesParams = {
      limit,
      offset,
      sort,
      direction
    }
    return await this.extendedRestChain!.restApi.hafbe.witnesses({limit, offset, sort, direction})
    // return await this.callRestApi("hafbe", "witnesses", requestParams);
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
    return await this.callRestApi("hafbe", `witnesses/${witness}/voters`, requestParams);
  }

  // Temporary untill I will find a way to solve cors.
  async getOperationTypes(
  ): Promise<Hive.OperationPattern[]> {
    return await this.callRestApi("hafbe", "operations/types/");
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    console.log('GET WITNESS');
    return await this.extendedRestChain!.restApi.hafbe.singleWitness({accountName: witnessName});
    return await this.callRestApi("hafbe", `witnesses/${witnessName}`);
  }

  async getVestingDelegations(delegatorAccount: string, startAccount: string | null, limit: number): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.get_vesting_delegations([delegatorAccount, startAccount, limit]);
  }

  async getRcDelegations (delegatorAccount: string, limit: number): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.list_rc_direct_delegations([[delegatorAccount, ""], limit]);
  }

  async getBlockByTime(date: Date): Promise<number> {
    return await this.callRestApi("hafbe", `block-numbers/by-creation-date/${date.toDateString()}`);
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    return await this.callRestApi("hafbe", `operations/types/${operationTypeId}/keys`);
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
    return await this.callRestApi("hafbe", "block-numbers", requestParams);
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
    return await this.callRestApi("hafbe", `witnesses/${witnessName}/votes/history`, requestParams)
  }

  async getOperation(operationId: number): Promise<Hive.OperationResponse> {
    return await this.callRestApi("hafah", `operations/${operationId}/`);
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
    return await this.callRestApi("hafbe", `accounts/${commentSearchProps.accountName}/operations/comments`, requestParams);

  }

  async getHafbeVersion(): Promise<string> {
    return await this.callRestApi("hafbe", "version");
  }

  async getOperationsCountInBlock(
    blockNumber: number
  ): Promise<Hive.OperationsByTypeCount[]> {
    return await this.callRestApi("hafbe", `blocks/${blockNumber}/operation-types/count`);
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    const result = await this.extendedRestChain!.restApi.hafbe["block-numbers"].headblock();
    return result;
    // return await this.callRestApi("hafbe", "/block-numbers/headblock");
  }

  async getBlockRaw(blockNumber: number): Promise<Hive.RawBlockData> {
    return await this.callRestApi("hafah", `blocks/${blockNumber}`);
  }

  async getAccountAuthorities(accountName: string): Promise<Hive.AccountAuthoritiesData> {
    return await this.callRestApi("hafbe", `accounts/${accountName}/authority`);
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
