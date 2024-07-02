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

  async getOperationTypes(): Promise<Hive.OperationPattern[]> {
    return await this.callRestApi("operation-types");
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    const requestBody: Hive.GetWitnessProps = {
      _account: witnessName,
    };
    return await this.callApi("get_witness", requestBody);
  }

  async getVestingDelegations(delegatorAccount: string, startAccount: string | null, limit: number): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.get_vesting_delegations([delegatorAccount, startAccount, limit]);
  }

  async getRcDelegations (delegatorAccount: string, limit: number): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.condenser_api.list_rc_direct_delegations([[delegatorAccount, ""], limit]);
  }

  async getBlockByTime(date: Date): Promise<number> {
    const requestBody: Hive.GetBlockByTimeProps = {
      _timestamp: date,
    };
    return await this.callApi("get_block_by_time", requestBody);
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    const requestBody: Hive.GetOperationKeysProps = {
      _op_type_id: operationTypeId,
    };
    return await this.callApi("get_operation_keys", requestBody);
  }

  async getBlockByOp(
    blockSearchProps: Explorer.BlockSearchProps
  ): Promise<Hive.BlockByOpResponse[]> {
    const requestBody: Hive.GetBlockByOpProps = {
      _operations: blockSearchProps.operationTypes || [],
      _account: blockSearchProps?.accountName,
      _from: blockSearchProps?.fromBlock,
      _to: blockSearchProps?.toBlock,
      _start_date: blockSearchProps.startDate,
      _end_date: blockSearchProps.endDate,
      _limit: blockSearchProps.limit,
      _order_is: "desc",
      _key_content: blockSearchProps.deepProps.content
        ? [blockSearchProps.deepProps.content]
        : undefined,
      _setof_keys: blockSearchProps.deepProps.keys
        ? [blockSearchProps.deepProps.keys]
        : undefined,
    };
    return await this.callApi("get_block_by_op", requestBody);
  }

  async getWitnessVotesHistory(
    witness: string,
    orderIs: string,
    orderBy: string,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date
  ): Promise<Hive.WitnessVotesHistory[]> {
    const requestBody: Hive.GetWitnessVotesHistory = {
      _witness: witness,
      _order_is: orderIs,
      _order_by: orderBy,
      _limit: limit,
      _from_time: fromTime,
      _to_time: toTime,
    };
    return await this.callApi("get_witness_votes_history", requestBody);
  }

  async getOperation(operationId: number): Promise<Hive.OperationResponse> {
    const requestBody: Hive.GetOperationProps = {
      _operation_id: operationId,
    };
    return await this.callApi("get_operation", requestBody);
  }

  async getCommentOperation(
    commentSearchProps: Explorer.CommentSearchProps
  ): Promise<Hive.CommentOperationResponse> {
    const requestBody: Hive.GetCommentOperationProps = {
      _author: commentSearchProps.accountName || "",
      _permlink: commentSearchProps.permlink,
      _page_num: commentSearchProps.pageNumber,
      _operation_types: commentSearchProps.operationTypes,
      _from: commentSearchProps.fromBlock,
      _to: commentSearchProps.toBlock,
      _start_date: commentSearchProps.startDate,
      _end_date: commentSearchProps.endDate,
      _body_limit: config.opsBodyLimit,
      _page_size: config.standardPaginationSize,
    };
    return await this.callApi("get_comment_operations", requestBody);
  }

  async getHafbeVersion(): Promise<string> {
    const requestBody = {};
    return await this.callApi("get_hafbe_version", requestBody);
  }

  async getOperationsCountInBlock(
    blockNumber: number
  ): Promise<Hive.OperationsByTypeCount[]> {
    const requestBody: Hive.GetOperationsInBlockProps = {
      _block_num: blockNumber,
    };
    return await this.callApi("get_op_count_in_block", requestBody);
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    const requestBody = {};
    return await this.callApi("get_hafbe_last_synced_block", requestBody);
  }

  async getBlockRaw(blockNumber: number): Promise<Hive.RawBlockData> {
    const requestBody: Hive.GetBlockRawProps = {
      _block_num: blockNumber,
    };
    return await this.callApi("get_block_raw", requestBody);
  }

  async getAccountAuthorities(accountName: string): Promise<Hive.AccountAuthoritiesData> {
    const requestBody = {
      _account: accountName,
    };
    return await this.callApi("get_account_authority", requestBody);
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
