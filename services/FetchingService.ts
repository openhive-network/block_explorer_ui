import Hive from "@/types/Hive";
import { config } from "@/Config";

class FetchingService {

  async makePostRequest<T>(url: string, requestBody: T) {
    try {
      console.log('URL', url);
      const response = await fetch(
        url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        }
      )
      return response.json();
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getBlockOpTypes(blockNumber: number): Promise<unknown> {
    const requestBody: Hive.GetBlockOpTypesProps = {_block_num: blockNumber};
    const url = `http://${config.apiAdress}/rpc/get_block_op_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOpsByBlock(blockNumber: number, filter: number[]): Promise<unknown> {
    const requestBody: Hive.GetOpsByBlockProps = {_block_num: blockNumber, _filter: filter};
    const url = `http://${config.apiAdress}/rpc/get_ops_by_block`;
    return await this.makePostRequest(url, requestBody);
  }

  async getTransaction(transactionHash: string): Promise<unknown> {
    const requestBody: Hive.GetTransactionProps = {_trx_hash: transactionHash};
    const url = `http://${config.apiAdress}/rpc/get_transaction`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccOpTypes(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccOpTypesProps = {_account: account};
    const url = `http://${config.apiAdress}/rpc/get_acc_op_types`;
    return await this.makePostRequest(url, requestBody);
  }

  async getOpsByAccount(account: string, topOpId: number, limit: number, filter: number[]): Promise<unknown> {
    const requestBody: Hive.GetOpsByAccountProps = {_account: account, _filter: filter, _top_op_id: topOpId, _limit: limit, _date_start: null, _date_end: null};
    const url = `http://${config.apiAdress}/rpc/get_ops_by_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccount(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountProps = {_account: account};
    const url = `http://${config.apiAdress}/rpc/get_account`;
    return await this.makePostRequest(url, requestBody);
  }

  async getAccountResourceCredits(account: string): Promise<unknown> {
    const requestBody: Hive.GetAccountResourceCreditsProps = {_account: account};
    const url = `http://${config.apiAdress}/rpc/get_account_resource_credits`;
    return await this.makePostRequest(url, requestBody);
  }

  async getBtrackerAccountBalance(account: string): Promise<unknown> {
    const requestBody: Hive.GetBtrackerAccountBalanceProps = {_account: account};
    const url = `http://${config.apiAdress}/rpc/get_btracker_account_balance`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitnesses(limit: number, offset: number, orderBy: string, orderIs: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessesProps = {_limit: limit, _offset: offset, _order_by: orderBy, _order_is: orderIs};
    const url = `http://${config.apiAdress}/rpc/get_witnesses`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitnessesVotersNum(witness: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessVotersNumProps = {_witness: witness};
    const url = `http://${config.apiAdress}/rpc/get_witness_voters_num`;
    return await this.makePostRequest(url, requestBody);
  }

  async getWitnessVoters(witness: string, limit: number, offset: number, orderBy: string, orderIs: string): Promise<unknown> {
    const requestBody: Hive.GetWitnessVotersProps = {_witness: witness, _limit: limit, _offset: offset};
    const url = `http://${config.apiAdress}/rpc/get_witness_voters`;
    return await this.makePostRequest(url, requestBody);
  }


}

const fetchingService = new FetchingService();

export default fetchingService;
