declare module Explorer {
  interface BlockOperationTypes {
    type: string;
    // Value depends on operationType, probably should be 'any' at the time
    value: {
      amount_to_sell: {
        amount: string;
        nai: string;
        precision: number;
      };
      expiration: string;
      fill_or_kill: boolean;
      min_to_receive: {
        amount: string;
        nai: string;
        precision: number;
      };
      orderid: number;
      owner: string;
    };
  }
  interface Block {
    acc_operation_id: string | null;
    age: string;
    block: number;
    op_in_trx: number;
    operation_id: number;
    operations: BlockOperationTypes;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    length: number;
  }

  type OperationTypes = number | string | boolean;
  export type OperationType = "vote_operation" | "comment_operation";

  export interface Operation {
    type: OperationType;
    value: {
      author: string;
      permlink: string;
      voter?: string;
      weight?: number;
      body?: string;
      json_metadata?: string;
      parent_author?: string;
      parent_permlink?: string;
      title?: string;
    };
  }

  export interface TransactionQueryResponse {
    age: string;
    block_num: number;
    expiration: string;
    extensions: any[];
    operations: Operation[];
    ref_block_num: number;
    ref_block_prefix: number;
    signatures: string[];
    timestamp: string;
    transaction_id: string;
  }
}

export default Explorer;
