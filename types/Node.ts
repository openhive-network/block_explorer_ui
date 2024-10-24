import {
    TWaxApiRequest,
  } from "@hiveio/wax";
  import Hive from "@/types/Hive";

export type ExplorerNodeApi = {
    database_api: {
      get_reward_funds: TWaxApiRequest<{}, { funds: Hive.RewardFunds[] }>;
      get_current_price_feed: TWaxApiRequest<{}, Hive.PriceFeed>;
      find_vesting_delegations: TWaxApiRequest<
        { account: string },
        { delegations: Hive.VestingDelegations[] }
      >;
      get_witness_schedule: TWaxApiRequest<
        { id: number },
        Hive.WitnessesSchedule
      >;
    };
    rc_api: {
      list_rc_direct_delegations: TWaxApiRequest<
        { start: [string, string]; limit: number },
        { rc_direct_delegations: Hive.RCDelegations[] }
      >;
    };
  };