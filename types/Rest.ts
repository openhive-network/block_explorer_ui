import Hive from "./Hive";

export class RestGetWitnessesParamsReq {
  limit!: number;
  offset!: number;
  sort!: string;
  direction!: Hive.Direction;
}

export class Witness {
  witness!: string;
  rank!: number;
  url!: string;
  vests!: number;
  votes_hive_power!: number;
  votes_daily_change!: number;
  votes_daily_change_hive_power!: number;
  voters_num!: number;
  voters_num_daily_change!: number;
  price_feed!: number;
  bias!: number;
  feed_age!: string;
  feed_updated_at!: Date;
  block_size!: number;
  signing_key!: string;
  version!: string;
  missed_blocks!: number;
  hbd_interest_rate!: number;
}

export class RestGetWitnessParamsReq {
  accountName!: string;
}

export class Voter {
  voter!: string;
  vests!: number;
  votes_hive_power!: number;
  account_vests!: number;
  account_hive_power!: number;
  proxied_vests!: number;
  proxied_hive_power!: number;
  timestamp!: Date;
}

export class RestGetVotersParamsReq {
  accountName!: string;
  sort?: string;
  direction?: Hive.Direction;
  limit?: number;
}

export class WitnessVotesHistory {
  voter!: string;
  approve!: boolean;
  vests!: number;
  vests_hive_power!: number;
  account_vests!: number;
  account_hive_power!: number;
  proxied_vests!: number;
  proxied_hive_power!: number;
  timestamp!: Date;
}

export class RestGetVotesHistoryParamsReq {
  accountName!: string;
  sort?: string;
  direction?: Hive.Direction;
  limit!: number | null;
  "start-date"?: Date;
  "end-date"?: Date;
}