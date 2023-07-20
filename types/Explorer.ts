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
}

export default Explorer;
