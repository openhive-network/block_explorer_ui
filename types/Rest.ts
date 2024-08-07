export class RestGetWitnessesParamsReq {
  limit!: number;
  offset!: number;
  sort!: string;
  direction!: "asc" | "desc";
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