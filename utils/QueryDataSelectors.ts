import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import moment from "moment";
import { getAndFormatPrecision } from "./Calculations";
import { config } from "@/Config";

/**
 * Get dynamic global block data and adjust it for page display.
 *
 * @export
 * @param {Hive.DynamicGlobalBlockQuery} dynamicGlobalQuery
 * @param {Hive.PriceFeedQuery} currentPriceFeed
 * @param {Hive.RewardFundsQuery} rewardFunds
 * @returns {Explorer.HeadBlockDetails}
 */
export function adjustDynamicGlobalBlockData(
  dynamicGlobalQuery: Hive.DynamicGlobalBlockQuery,
  currentPriceFeed: Hive.PriceFeedQuery,
  rewardFunds: Hive.RewardFundsQuery
): Explorer.HeadBlockCardData {
  const { base } = currentPriceFeed.result;
  const {
    time,
    current_supply,
    virtual_supply,
    init_hbd_supply,
    current_hbd_supply,
    total_vesting_fund_hive,
    pending_rewarded_vesting_hive,
    hbd_interest_rate,
    hbd_print_rate,
    required_actions_partition_percent,
    last_irreversible_block_num,
    available_account_subsidies,
    hbd_stop_percent,
    hbd_start_percent,
    next_maintenance_time,
    last_budget_time,
    next_daily_maintenance_time,
    content_reward_percent,
    vesting_reward_percent,
    downvote_pool_percent,
    current_remove_threshold,
    early_voting_seconds,
    mid_voting_seconds,
    max_consecutive_recurrent_transfer_failures,
    max_recurrent_transfer_end_date,
    min_recurrent_transfers_recurrence,
    max_open_recurrent_transfers,
    head_block_number,
    current_witness
  } = dynamicGlobalQuery.result;
  const { reward_balance } = rewardFunds.result.funds[0];
  const headBlockDetails: Explorer.HeadBlockDetails = {
    feedPrice: getAndFormatPrecision(base?.amount, base?.precision),
    blockchainTime: moment(time).format(config.baseMomentTimeFormat),
    rewardFund: getAndFormatPrecision(reward_balance?.amount, reward_balance?.precision),
    currentSupply: getAndFormatPrecision(
      current_supply?.amount,
      current_supply?.precision
    ),
    virtualSupply: getAndFormatPrecision(
      virtual_supply?.amount,
      virtual_supply?.precision
    ),
    initHbdSupply: getAndFormatPrecision(
      init_hbd_supply?.amount,
      init_hbd_supply?.precision
    ),
    currentHbdSupply: getAndFormatPrecision(
      current_hbd_supply?.amount,
      current_hbd_supply?.precision
    ),
    totalVestingFundHive: getAndFormatPrecision(
      total_vesting_fund_hive?.amount,
      total_vesting_fund_hive?.precision
    ),
    pendingRewardedVestingHive: getAndFormatPrecision(
      pending_rewarded_vesting_hive?.amount,
      pending_rewarded_vesting_hive?.precision
    ),
    hbdInterestRate: `${hbd_interest_rate}%`,
    hbdPrintRate: `${hbd_print_rate}%`,
    requiredActionsPartitionPercent: `${required_actions_partition_percent}%`,
    lastIrreversibleBlockNumber: last_irreversible_block_num,
    availableAccountSubsidies: available_account_subsidies,
    hbdStopPercent: hbd_stop_percent,
    hbdStartPercent: hbd_start_percent,
    nextMaintenanceTime: moment(next_maintenance_time).format(config.baseMomentTimeFormat),
    lastBudgetTime: moment(last_budget_time).format(config.baseMomentTimeFormat) ,
    nextDailyMaintenanceTime: moment(next_daily_maintenance_time).format(config.baseMomentTimeFormat) ,
    contentRewardPercent: content_reward_percent, // Remember to fix all percentage values later
    vestingRewardPercent: vesting_reward_percent,
    downvotePoolPercent: downvote_pool_percent,
    currentRemoveThreshold: current_remove_threshold,
    earlyVotingSeconds: early_voting_seconds,
    midVotingSeconds: mid_voting_seconds,
    maxConvecutiveRecurrentTransferFailures: max_consecutive_recurrent_transfer_failures,
    maxRecurrentTransferEndDate: max_recurrent_transfer_end_date,
    minRecurrentTransfersRecurrence: min_recurrent_transfers_recurrence,
    maxOpenRecurrentTransfers: max_open_recurrent_transfers

  };
  return {headBlockDetails, headBlockNumber: head_block_number, witnessName: current_witness};
}