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
    _date_start: unknown;
    _date_end: unknown;
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
    _order_is: string;
  }

  interface GetWitnessVotersNumProps {
    _witness: string;
  }

  interface GetWitnessVotersProps {
    _witness: string;
    _limit: number;
    _offset: number;
  }
  interface GetOperationTypesProps {
    _operation_type_pattern: string | null;
  }

  interface DynamicGlobalQuery {
    id: number;
    jsonrpc: string;
    result: {
      id: number;
      head_block_number: number;
      head_block_id: string;
      time: Date;
      current_witness: string;
      total_pow: number;
      num_pow_witnesses: number;
      virtual_supply: {
        amount: string;
        precision: number;
        nai: string;
      };
      current_supply: {
        amount: string;
        precision: number;
        nai: string;
      };
      init_hbd_supply: {
        amount: string;
        precision: number;
        nai: string;
      };
      current_hbd_supply: {
        amount: string;
        precision: number;
        nai: string;
      };
      total_vesting_fund_hive: {
        amount: string;
        precision: number;
        nai: string;
      };
      total_vesting_shares: {
        amount: string;
        precision: number;
        nai: string;
      };
      total_reward_fund_hive: {
        amount: string;
        precision: number;
        nai: string;
      };
      total_reward_shares2: string;
      pending_rewarded_vesting_shares: {
        amount: string;
        precision: number;
        nai: string;
      };
      pending_rewarded_vesting_hive: {
        amount: 495000998;
        precision: number;
        nai: string;
      };
      hbd_interest_rate: number;
      hbd_print_rate: number;
      maximum_block_size: number;
      required_actions_partition_percent: number;
      current_aslot: number;
      recent_slots_filled: string;
      participation_count: number;
      last_irreversible_block_num: number;
      vote_power_reserve_rate: number;
      delegation_return_period: number;
      reverse_auction_seconds: number;
      available_account_subsidies: number;
      hbd_stop_percent: number;
      hbd_start_percent: number;
      next_maintenance_time: Date;
      last_budget_time: Date;
      next_daily_maintenance_time: Date;
      content_reward_percent: number;
      vesting_reward_percent: number;
      proposal_fund_percent: number;
      dhf_interval_ledger: {
        amount: string;
        precision: number;
        nai: string;
      };
      downvote_pool_percent: number;
      current_remove_threshold: number;
      early_voting_seconds: number;
      mid_voting_seconds: number;
      max_consecutive_recurrent_transfer_failures: number;
      max_recurrent_transfer_end_date: number;
      min_recurrent_transfers_recurrence: number;
      max_open_recurrent_transfers: number;
    };
  }

  type OperationType = "vote_operation" | "comment_operation";

  interface Operation {
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
  interface TransactionQueryResponse {
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

  interface OpsByBlockResponse {
    acc_operation_id: string | null;
    age: string;
    block: number;
    op_in_trx: number;
    operation_id: number;
    operation: Operation;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
    length: number;
  }

  type OperationTypes = [number, string, boolean];

  interface TransactionQueryResponse {
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

export default Hive;
