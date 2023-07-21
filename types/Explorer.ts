declare module Explorer {
  interface Operation {
    type: string;
    value: {
      author: string;
      permlink: string;
      voter: string;
      weight: number;
    }
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