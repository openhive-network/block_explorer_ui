import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { createHiveChain } from "@hive-staging/wax";

class FetchingService {
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

  async getHeadBlockNum(): Promise<number> {
    const url = `${config.apiAddress}/rpc/get_head_block_num`;
    return await this.makePostRequest(url, {});
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    const requestBody: Hive.GetBlockProps = { _block_num: blockNumber };
    const url = `${config.apiAddress}/rpc/get_block`;
    return await this.makePostRequest(url, requestBody);
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestBody: Hive.GetLatestBlocksProps = { _limit: limit };
    const url = `${config.apiAddress}/rpc/get_latest_blocks `;
    return await this.makePostRequest(url, requestBody);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    const requestBody: Hive.GetInputTypeProps = { _input: input };
    const url = `${config.apiAddress}/rpc/get_input_type`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBlockOpTypes(blockNumber: number): Promise<Hive.OperationTypes[]> {
    const requestBody: Hive.GetBlockOpTypesProps = { _block_num: blockNumber };
    const url = `${config.apiAddress}/rpc/get_block_op_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOpsByBlock(
    blockNumber: number,
    filter: number[]
  ): Promise<Hive.OperationResponse[]> {
    const requestBody: Hive.GetOpsByBlockProps = {
      _block_num: blockNumber,
      _filter: filter,
      _body_limit: config.opsBodyLimit
    };
    const url = `${config.apiAddress}/rpc/get_ops_by_block`;
    return await this.makePostRequest(url, requestBody);
  }
  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    const requestBody: Hive.GetTransactionProps = {
      _trx_hash: transactionHash,
    };
    const url = `${config.apiAddress}/rpc/get_transaction`;
    return await this.makePostRequest(url, requestBody);
  }

  async getRewardFunds(): Promise<Hive.RewardFundsQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_reward_funds",
      id: 1,
    };
    const url = `${config.hiveBlogAddress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getDynamicGlobalProperties(): Promise<Hive.DynamicGlobalBlockQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_dynamic_global_properties",
      id: 1,
    };
    const url = `${config.hiveBlogAddress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeedQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_current_price_feed",
      id: 1,
    };
    const url = `${config.hiveBlogAddress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccOpTypes(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccOpTypesProps = { _account: account };
    const url = `${config.apiAddress}/rpc/get_acc_op_types`;
    return await this.makePostRequest(url, requestBody);
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
      _body_limit: config.opsBodyLimit
    };
    const url = `${config.apiAddress}/rpc/get_ops_by_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccountOperationsCount(
    operations: number[], 
    account: string
  ): Promise<number> {
    const requestBody: Hive.GetAccountOpsCountProps = {
      _account: account,
      _operations: operations,
    };
    const url = `${config.apiAddress}/rpc/get_account_operations_count`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccount(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountProps = { _account: account };
    const url = `${config.apiAddress}/rpc/get_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccountResourceCredits(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountResourceCreditsProps = {
      _account: account,
    };
    const url = `${config.apiAddress}/rpc/get_account_resource_credits`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBtrackerAccountBalance(account: string): Promise<unknown> {
    const requestBody: Hive.GetBtrackerAccountBalanceProps = {
      _account: account,
    };
    const url = `${config.apiAddress}/rpc/get_btracker_account_balance`;
    return await this.makePostRequest(url, requestBody);
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
    const url = `${config.apiAddress}/rpc/get_witnesses`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitnessesVotersNum(witness: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessVotersNumProps = { _witness: witness };
    const url = `${config.apiAddress}/rpc/get_witness_voters_num`;
    return await this.makePostRequest(url, requestBody);
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
    const url = `${config.apiAddress}/rpc/get_witness_voters`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOperationTypes(
    operation_type_pattern: string | null
  ): Promise<Hive.OperationPattern[]> {
    const requestBody: Hive.GetOperationTypesProps = {
      _operation_type_pattern: operation_type_pattern,
    };
    const url = `${config.apiAddress}/rpc/get_matching_operation_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    const requestBody: Hive.GetWitnessProps = {
      _account: witnessName,
    };
    const url = `${config.apiAddress}/rpc/get_witness`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBlockByTime(date: Date): Promise<number> {
    const requestBody: Hive.GetBlockByTimeProps = {
      _timestamp: date,
    };
    const url = `${config.apiAddress}/rpc/get_block_by_time`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    const requestBody: Hive.GetOperationKeysProps = {
      _op_type_id: operationTypeId,
    }
    const url = `${config.apiAddress}/rpc/get_operation_keys `;
    return await this.makePostRequest(url, requestBody);
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
      _key_content: blockSearchProps.deepProps.content ? [blockSearchProps.deepProps.content] : undefined,
      _setof_keys:  blockSearchProps.deepProps.keys ? [blockSearchProps.deepProps.keys] : undefined
    };
    const url = `${config.apiAddress}/rpc/get_block_by_op  `;
    return await this.makePostRequest(url, requestBody);
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
    const url = `${config.apiAddress}/rpc/get_witness_votes_history  `;
    return await this.makePostRequest(url, requestBody);
  }

  async getOperation(
    operationId: number
  ): Promise<Hive.OperationResponse> {
    const requestBody: Hive.GetOperationProps = {
      _operation_id: operationId
    };
    const url = `${config.apiAddress}/rpc/get_operation`
    return await this.makePostRequest(url, requestBody);
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
      _page_size: config.standardPaginationSize
    };
    const url = `${config.apiAddress}/rpc/get_comment_operations`
    return await this.makePostRequest(url, requestBody);
  }

  async getHafbeVersion(): Promise<string> {
    const requestBody = {};
    const url = `${config.apiAddress}/rpc/get_hafbe_version`;
    return await this.makePostRequest(url, requestBody);
  }

  async getManabars(accountName: string): Promise<Hive.Manabars | null> {
    try {
      const chain = await createHiveChain();
      const upvotePromise = chain.calculateCurrentManabarValueForAccount(accountName, 0);
      const downvotePromise = chain.calculateCurrentManabarValueForAccount(accountName, 1);
      const rcPromise = chain.calculateCurrentManabarValueForAccount(accountName, 2);
      const manabars = await Promise.all([upvotePromise, downvotePromise, rcPromise]);
      chain.delete();
      return {upvote: manabars[0], downvote: manabars[1], rc: manabars[2]};
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
