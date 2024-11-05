import {
    TWaxRestApiRequest,
  } from "@hiveio/wax";
  import Hive from "@/types/Hive";

export type ExplorerNodeApi = {
    database_api: {
      get_reward_funds: TWaxRestApiRequest<{}, { funds: Hive.RewardFunds[] }>;
      get_current_price_feed: TWaxRestApiRequest<{}, Hive.PriceFeed>;
      find_vesting_delegations: TWaxRestApiRequest<
        { account: string },
        { delegations: Hive.VestingDelegations[] }
      >;
      get_witness_schedule: TWaxRestApiRequest<
        { id: number },
        Hive.WitnessesSchedule
      >;
    };
    rc_api: {
      list_rc_direct_delegations: TWaxRestApiRequest<
        { start: [string, string]; limit: number },
        { rc_direct_delegations: Hive.RCDelegations[] }
      >;
    };
  };