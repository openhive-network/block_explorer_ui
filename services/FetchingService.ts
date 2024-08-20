import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { GetDynamicGlobalPropertiesResponse, IHiveChainInterface, TWaxRestExtended, TWaxApiRequest, TWaxExtended } from "@hiveio/wax";
import {
  extendedRest
} from "@/types/Rest";
import { createPathFilterString } from "@/lib/utils";

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
  private extendedHiveChain: TWaxExtended<ExplorerNodeApi, TWaxRestExtended<typeof extendedRest>> | undefined = undefined;
  private testApiAddress: string = "https://api.syncad.com";

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  public setHiveChain(hiveChain: IHiveChainInterface | null) {
    this.extendedHiveChain = hiveChain?.extend<ExplorerNodeApi>().extendRest(extendedRest);
    if (this.extendedHiveChain && this.nodeUrl) {
      this.extendedHiveChain.endpointUrl = this.nodeUrl;
      // this.extendedHiveChain.restApi.endpointUrl = this.testApiAddress;
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
    return await this.extendedHiveChain!.restApi.hafah.headblock();
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    return await this.extendedHiveChain!.restApi.hafbe["last-synced-block"]();
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi.hafah.blocks.block({blockNumber});
  }

  async getBlockGlobalState(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi.hafah["global-state"]({"block-num": blockNumber});
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    return await this.extendedHiveChain!.restApi.hafbe["operation-type-counts"]({"result-limit": limit});
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.extendedHiveChain!.restApi.hafbe["input-type"].inputType({inputType: input});
  }

  async getOpsByBlock(
    blockNumber: number,
    filter?: number[],
    page?: number,
    accountName?: string,
    keyContent?: string,
    setOfKeys?: string[]
  ): Promise<Hive.TotalOperationsResponse> {
    const requestParams: Hive.RestGetOpsByBlockParams = {
      blockNumber,
      "operation-types": filter,
      "account-name": accountName,
      page,
      "page-size": config.blockPagePaginationSize,
      "page-order": "desc",
      "data-size-limit": config.opsBodyLimit,
      "path-filter": createPathFilterString(keyContent, setOfKeys)
    }
    return await this.extendedHiveChain!.restApi.hafah.blocks.operations(requestParams)
  }


  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    return await this.extendedHiveChain!.restApi.hafah.transactions.transaction({transactionId: transactionHash});
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

  async getAccOpTypes(accountName: string): Promise<number[]> {
    return await this.extendedHiveChain!.restApi.hafah.accounts.operationTypes({accountName});
  }

  async getOpsByAccount(
    accountOperationsProps: Explorer.AccountSearchOperationsProps
  ): Promise<Hive.OperationResponse[]> {
    const requestParams: Hive.RestGetOpsByAccountParams = {
      accountName: accountOperationsProps.accountName,
      "operation-types": accountOperationsProps.operationTypes,
      page: accountOperationsProps.pageNumber,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block": accountOperationsProps.fromBlock,
      "to-block": accountOperationsProps.toBlock,
      "start-date": accountOperationsProps.startDate,
      "end-date": accountOperationsProps.endDate
    }
    return await this.extendedHiveChain!.restApi.hafah.accounts.operations(requestParams);
  }

  async getAccount(accountName: string): Promise<Hive.AccountDetailsQueryResponse> {
    return await this.extendedHiveChain!.restApi.hafbe.accounts.account({accountName});
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
    return await this.extendedHiveChain!.restApi.hafbe.witnesses({limit, offset, sort, direction});
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
    return await this.extendedHiveChain!.restApi.hafbe.voters({accountName: witness, sort, direction, "result-limit": limit});
  }

  async getOperationTypes(
  ): Promise<Hive.OperationPattern[]> {
    return await this.extendedHiveChain!.restApi.hafah["operation-types"].types();
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    return await this.extendedHiveChain!.restApi.hafbe.singleWitness({accountName: witnessName});
  }

  async getVestingDelegations(delegatorAccount: string, startAccount: string | null, limit: number): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.get_vesting_delegations([delegatorAccount, startAccount, limit]);
  }

  async getRcDelegations (delegatorAccount: string, limit: number): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.list_rc_direct_delegations([[delegatorAccount, ""], limit]);
  }

  async getBlockByTime(date: Date): Promise<number> {
    return await this.extendedHiveChain!.restApi.hafah["block-number-by-date"].byTime({date: date.toISOString()});
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    return await this.extendedHiveChain!.restApi.hafah["operation-types"].operationKeys({operationTypeId});
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
      "result-limit": blockSearchProps.limit,
      "path-filter": createPathFilterString(blockSearchProps.deepProps.content, blockSearchProps.deepProps.keys)
    }
    return await this.extendedHiveChain!.restApi.hafbe["block-numbers"](requestParams);
  }

  async getWitnessVotesHistory(
    witnessName: string,
    direction: "asc" | "desc",
    sort: string,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date
  ): Promise<Hive.WitnessVotesHistory[]> {
    return await this.extendedHiveChain!.restApi.hafbe.votesHistory({accountName: witnessName, direction, sort, "result-limit": limit, "start-date": fromTime, "end-date": toTime});
  }

  async getOperation(operationId: number): Promise<Hive.OperationResponse> {
    return await this.extendedHiveChain!.restApi.hafah.operations.byId({operationId});
  }

  async getCommentOperation(
    commentSearchProps: Explorer.CommentSearchProps
  ): Promise<Hive.CommentOperationResponse> {
    const requestParams: Hive.RestCommentsParams = {
      accountName: commentSearchProps.accountName,
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
    return await this.extendedHiveChain!.restApi.hafbe.accounts.commentOperations(requestParams);
  }

  async getHafbeVersion(): Promise<string> {
    return (await this.extendedHiveChain!.restApi.hafbe.version());
  }

  async getOperationsCountInBlock(
    blockNumber: number
  ): Promise<Hive.LastBlocksTypeResponse> {
    return (await this.extendedHiveChain!.restApi.hafbe["operation-type-counts"]({"result-limit": 1, "block-num": blockNumber}))[0];
  }

  async getBlockRaw(blockNumber: number): Promise<Hive.RawBlockData> {
    return await this.callRestApi("hafah", `blocks/${blockNumber}`);
  }

  async getAccountAuthorities(accountName: string): Promise<Hive.AccountAuthoritiesData | undefined> {
    return await this.extendedHiveChain?.restApi.hafbe.accounts.authorities({accountName});
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
