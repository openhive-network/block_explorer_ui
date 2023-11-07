import Hive from "@/types/Hive";
import { config } from "@/Config";

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

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    const requestBody: Hive.GetBlockProps = { _block_num: blockNumber };
    const url = `${config.apiAdress}/rpc/get_block`;
    return await this.makePostRequest(url, requestBody);
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    const requestBody: Hive.GetLatestBlocksProps = { _limit: limit };
    const url = `${config.apiAdress}/rpc/get_latest_blocks `;
    return await this.makePostRequest(url, requestBody);
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    const requestBody: Hive.GetInputTypeProps = { _input: input };
    const url = `${config.apiAdress}/rpc/get_input_type`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBlockOpTypes(blockNumber: number): Promise<Hive.OperationTypes[]> {
    const requestBody: Hive.GetBlockOpTypesProps = { _block_num: blockNumber };
    const url = `${config.apiAdress}/rpc/get_block_op_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOpsByBlock(
    blockNumber: number,
    filter: number[]
  ): Promise<Hive.OpsByBlockResponse[]> {
    const requestBody: Hive.GetOpsByBlockProps = {
      _block_num: blockNumber,
      _filter: filter,
    };
    const url = `${config.apiAdress}/rpc/get_ops_by_block`;
    return await this.makePostRequest(url, requestBody);
  }
  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionQueryResponse> {
    const requestBody: Hive.GetTransactionProps = {
      _trx_hash: transactionHash,
    };
    const url = `${config.apiAdress}/rpc/get_transaction`;
    return await this.makePostRequest(url, requestBody);
  }

  async getRewardFunds(): Promise<Hive.RewardFundsQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_reward_funds",
      id: 1,
    };
    const url = `${config.hiveBlogAdress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getDynamicGlobalProperties(): Promise<Hive.DynamicGlobalBlockQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_dynamic_global_properties",
      id: 1,
    };
    const url = `${config.hiveBlogAdress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeedQuery> {
    const requestBody: Hive.HiveBlogProps = {
      jsonrpc: "2.0",
      method: "database_api.get_current_price_feed",
      id: 1,
    };
    const url = `${config.hiveBlogAdress}`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccOpTypes(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccOpTypesProps = { _account: account };
    const url = `${config.apiAdress}/rpc/get_acc_op_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOpsByAccount(
    account: string,
    pagerNum: number,
    limit: number,
    filter: number[]
  ): Promise<unknown> {
    const requestBody: Hive.GetOpsByAccountProps = {
      _account: account,
      _filter: filter,
      _page_num: pagerNum,
      _limit: limit,
      _date_start: null,
      _date_end: null,
    };
    const url = `${config.apiAdress}/rpc/get_ops_by_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccount(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountProps = { _account: account };
    const url = `${config.apiAdress}/rpc/get_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccountResourceCredits(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountResourceCreditsProps = {
      _account: account,
    };
    const url = `${config.apiAdress}/rpc/get_account_resource_credits`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBtrackerAccountBalance(account: string): Promise<unknown> {
    const requestBody: Hive.GetBtrackerAccountBalanceProps = {
      _account: account,
    };
    const url = `${config.apiAdress}/rpc/get_btracker_account_balance`;
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
    const url = `${config.apiAdress}/rpc/get_witnesses`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitnessesVotersNum(witness: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessVotersNumProps = { _witness: witness };
    const url = `${config.apiAdress}/rpc/get_witness_voters_num`;
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
    const url = `${config.apiAdress}/rpc/get_witness_voters`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOperationTypes(
    operation_type_pattern: string | null
  ): Promise<Hive.OperationPattern[]> {
    const requestBody: Hive.GetOperationTypesProps = {
      _operation_type_pattern: operation_type_pattern,
    };
    const url = `${config.apiAdress}/rpc/get_matching_operation_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    const requestBody: Hive.GetWitnessProps = {
      _account: witnessName,
    };
    const url = `${config.apiAdress}/rpc/get_witness`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBlockByTime(date: any): Promise<Hive.GetBlockByTimeResponse> {
    const requestBody: Hive.GetBlockByTimeProps = {
      _timestamp: date,
    };
    const url = `${config.apiAdress}/rpc/get_block_by_time`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOperationKeys(operationId: number): Promise<string[][]> {
    const requestBody: Hive.GetOperationKeysProps = {
      _operation_id: operationId,
    }
    const url = `${config.apiAdress}/rpc/get_operation_keys `;
    return await this.makePostRequest(url, requestBody);
  }

  async getBlockByOp(
    operations: number[],
    accountName: string | null,
    from: number | null,
    to: number | null,
    limit: number,
    orderIs: "asc" | "desc",
    propertyValue: string[] | null,
    propertyKeys: string[][] | null
  ): Promise<Hive.BlockByOpResponse[]> {
    const requestBody: Hive.GetBlockByOpProps = {
      _operations: operations,
      _account: accountName,
      _from: from,
      _to: to,
      _limit: limit,
      _order_is: orderIs,
      _key_content: propertyValue,
      _setof_keys: propertyKeys
    };
    const url = `${config.apiAdress}/rpc/get_block_by_op  `;
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
    const url = `${config.apiAdress}/rpc/get_witness_votes_history  `;
    return await this.makePostRequest(url, requestBody);
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
