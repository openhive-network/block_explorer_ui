declare module Hive {
  interface HiveBlogProps {
    id: number;
    method: string;
    jsonrpc: string;
  }

  interface GetBlockOpTypesProps {
    _block_num: number;
  }

  interface GetOpsByBlockProps {
    _block_num: number;
    _filter: number[];
  }

  interface GetTransactionProps {
    _trx_hash: string;
  }

  interface GetAccOpTypesProps {
    _account: string;
  }

  interface GetOpsByAccountProps {
    _account: string;
    _top_op_id: number;
    _limit: number;
    _filter: number[];
    _date_start: unknown,
    _date_end: unknown,
  }

  interface GetAccountProps {
    _account: string;
  }

  interface GetAccountResourceCreditsProps {
    _account: string;
  }

  interface GetBtrackerAccountBalanceProps {
    _account: string;
  }

  interface GetWitnessesProps {
    _limit: number;
    _offset: number;
    _order_by: string;
    _order_is: string
  }

  interface GetWitnessVotersNumProps {
    _witness: string;
  }

  interface GetWitnessVotersProps {
    _witness: string;
    _limit: number;
    _offset: number;
  }
}

export default Hive