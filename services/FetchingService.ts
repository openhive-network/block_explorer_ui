import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { GetDynamicGlobalPropertiesResponse, IHiveChainInterface, TWaxApiRequest, TWaxExtended } from "@hiveio/wax";

type ExplorerNodeApi = {
  database_api: {
    get_reward_funds: TWaxApiRequest<{}, { funds: Hive.RewardFunds[] }>
    get_current_price_feed: TWaxApiRequest<{}, Hive.PriceFeed>
    find_vesting_delegations: TWaxApiRequest<{ account: string }, { delegations: Hive.VestingDelegations[] }>;
  },
  rc_api: {
    list_rc_direct_delegations: TWaxApiRequest<{ start: [string, string], limit: number }, { rc_direct_delegations: Hive.RCDelegations[] }>
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
    const urlParams = new URLSearchParams();

    for (const key in params) {
      const value = params[key];
      if (value) {
        if (Array.isArray(value)) {
          urlParams.set(key, value.map(item => item.toString()).join(','));
        } else {
          urlParams.set(key, value.toString());
        }
      }
    }
    const url = `${this.testApiAddress}/${methodName}${urlParams}`;
    return await this.makeGetRequest(url);
  }

  async getHeadBlockNum(): Promise<number> {
    return await this.callRestApi("block-numbers/headblock");
  }

  // To be decided
  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    const requestBody: Hive.GetBlockProps = { _block_num: blockNumber };
    return await this.callApi("get_block", requestBody);
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestParams: Hive.RestGetLastBlocksParams = {limit};
    return await this.callRestApi("blocks", requestParams);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.callRestApi(`input-type/${input}`);
  }

  // Later
  async getOpsByBlock(
    blockNumber: number,
    filter?: number[],
    page?: number,
    accountName?: string,
    keyContent?: string,
    setOfKeys?: string[]
  ): Promise<Hive.OperationResponse[]> {
    const requestParams = {
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
    const requestBody: Hive.GetOpsByAccountProps = {
      _account: accountOperationsProps.accountName,
      _filter: accountOperationsProps.operationTypes,
      _page_num: accountOperationsProps.pageNumber,
      _page_size: config.standardPaginationSize,
      _from: accountOperationsProps.fromBlock,
      _to: accountOperationsProps.toBlock,
      _date_start: accountOperationsProps.startDate,
      _date_end: accountOperationsProps.endDate,
      _body_limit: config.opsBodyLimit,
    };
    return await this.callApi("get_ops_by_account", requestBody);
  }

  async getAccountOperationsCount(
    operations: number[],
    account: string
  ): Promise<number> {
    const requestBody: Hive.GetAccountOpsCountProps = {
      _account: account,
      _operations: operations,
    };
    return await this.callApi("get_account_operations_count", requestBody);
  }

  async getAccount(account: string): Promise<Hive.AccountDetailsQueryResponse> {
    const requestBody: Hive.GetAccountProps = { _account: account };
    return await this.callApi("get_account", requestBody);
  }

  async getAccountResourceCredits(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountResourceCreditsProps = {
      _account: account,
    };
    return await this.callApi("get_account_resource_credits", requestBody);
  }

  async getBtrackerAccountBalance(account: string): Promise<unknown> {
    const requestBody: Hive.GetBtrackerAccountBalanceProps = {
      _account: account,
    };
    return await this.callApi("get_btracker_account_balance", requestBody);
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

  async getWitnessesVotersNum(witness: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessVotersNumProps = { _witness: witness };
    return await this.callApi("get_witness_voters_num", requestBody);
  }

  async getWitnessVoters(
    witness: string,
    orderBy: string,
    orderIs: string,
    limit?: number
  ): Promise<Hive.Voter[]> {
    const requestBody: Hive.GetWitnessVotersProps = {
      _witness: witness,
      _order_by: orderBy,
      _order_is: orderIs,
    };
    if (limit) requestBody._limit = limit;
    return await this.callApi("get_witness_voters", requestBody);
  }

  async getOperationTypes(
    operation_type_pattern: string | null
  ): Promise<Hive.OperationPattern[]> {
    const requestBody: Hive.GetOperationTypesProps = {
      _operation_type_pattern: operation_type_pattern,
    };
    return await this.callApi("get_matching_operation_types", requestBody);
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    const requestBody: Hive.GetWitnessProps = {
      _account: witnessName,
    };
    return await this.callApi("get_witness", requestBody);
  }

  async getVestingDelegations(delegatorAccount: string): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.database_api.find_vesting_delegations({
      account: delegatorAccount
    }).then(response => response.delegations);
  }

  async getRcDelegations (delegatorAccount: string, limit: number): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.rc_api.list_rc_direct_delegations({
      start: [delegatorAccount, ""],
      limit: limit,
    }).then(response => response.rc_direct_delegations);
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
