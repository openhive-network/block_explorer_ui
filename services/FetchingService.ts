import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { IHiveChainInterface } from "@hive/wax/web";

class FetchingService {
  private apiUrl: string | null = null;
  private nodeUrl: string | null = null;

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  async makePostRequest<T>(url: string, requestBody: T) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      return response.json();
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

  async getHeadBlockNum(): Promise<number | undefined> {
    try {
      const url = `${this.apiUrl}/get_head_block_num`;

      return await this.makePostRequest(url, {});
    } catch {
      window.localStorage.clear();
      window.location.reload();
    }
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    const requestBody: Hive.GetBlockProps = { _block_num: blockNumber };
    return await this.callApi("get_block", requestBody);
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestBody: Hive.GetLatestBlocksProps = { _limit: limit };
    return await this.callApi("get_latest_blocks", requestBody);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    const requestBody: Hive.GetInputTypeProps = { _input: input };
    return await this.callApi("get_input_type", requestBody);
  }

  async getBlockOpTypes(blockNumber: number): Promise<Hive.OperationTypes[]> {
    const requestBody: Hive.GetBlockOpTypesProps = { _block_num: blockNumber };
    return await this.callApi("get_block_op_types", requestBody);
  }

  async getOpsByBlock(
    blockNumber: number,
    filter?: number[],
    page?: number
  ): Promise<Hive.OperationResponse[]> {
    const requestBody: Hive.GetOpsByBlockProps = {
      _block_num: blockNumber,
      _filter: filter,
      _body_limit: config.opsBodyLimit,
      _page_size: 1000,
      _page_num: page,
    };
    return await this.callApi("get_ops_by_block_paging", requestBody);
  }
  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    const requestBody: Hive.GetTransactionProps = {
      _trx_hash: transactionHash,
    };
    return await this.callApi("get_transaction", requestBody);
  }

  async getRewardFunds(): Promise<Hive.RewardFundsQuery> {
    return await this.callNode("database_api.get_reward_funds");
  }

  async getDynamicGlobalProperties(): Promise<Hive.DynamicGlobalBlockQuery> {
    return await this.callNode("database_api.get_dynamic_global_properties");
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeedQuery> {
    return await this.callNode("database_api.get_current_price_feed");
  }

  async getAccOpTypes(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccOpTypesProps = { _account: account };
    return await this.callApi("get_acc_op_types", requestBody);
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

  async getAccount(account: string): Promise<unknown> {
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
    orderBy: string,
    orderIs: string
  ): Promise<Hive.Witness[]> {
    const requestBody: Hive.GetWitnessesProps = {
      _limit: limit,
      _offset: offset,
      _order_by: orderBy,
      _order_is: orderIs,
    };
    return await this.callApi("get_witnesses", requestBody);
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
