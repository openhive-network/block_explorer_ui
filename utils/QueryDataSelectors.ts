import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import moment from "moment";
import { config } from "@/Config";
import { formatPercent } from "@/lib/utils";
import { IHiveChainInterface } from "@hive/wax/web";
import TestFormatter from "@/lib/Formatter";

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
  rewardFunds: Hive.RewardFundsQuery,
  hiveChain: IHiveChainInterface
): Explorer.HeadBlockCardData {
  const { base } = currentPriceFeed.result;
  const basicFormatter = hiveChain.formatter;
  const formattedBaseValues: Explorer.DynamicGlobalBlock = basicFormatter.format(dynamicGlobalQuery.result);
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
  } = formattedBaseValues;
  const formatter = hiveChain.formatter.extend(TestFormatter); 
  // const testResults = formatter.format(dynamicGlobalQuery.result);
  const rewardBalance: string = basicFormatter.format(rewardFunds.result.funds[0].reward_balance);
  const headBlockDetails: Explorer.HeadBlockDetails = {
    feedPrice: hiveChain.waxify`${base}`,
    blockchainTime: moment(time).format(config.baseMomentTimeFormat),
    rewardFund: rewardBalance,
    currentSupply: current_supply,
    virtualSupply: virtual_supply,
    initHbdSupply: init_hbd_supply,
    currentHbdSupply: current_hbd_supply,
    totalVestingFundHive: total_vesting_fund_hive,
    pendingRewardedVestingHive: pending_rewarded_vesting_hive,
    hbdInterestRate: formatPercent(hbd_interest_rate),
    hbdPrintRate: formatPercent(hbd_print_rate),
    lastIrreversibleBlockNumber: last_irreversible_block_num,
    availableAccountSubsidies: available_account_subsidies,
    hbdStopPercent: formatPercent(hbd_stop_percent),
    hbdStartPercent: formatPercent(hbd_start_percent),
    nextMaintenanceTime: moment(next_maintenance_time).format(config.baseMomentTimeFormat),
    lastBudgetTime: moment(last_budget_time).format(config.baseMomentTimeFormat) ,
    nextDailyMaintenanceTime: moment(next_daily_maintenance_time).format(config.baseMomentTimeFormat) ,
    contentRewardPercent: formatPercent(content_reward_percent), // Remember to fix all percentage values later
    vestingRewardPercent: formatPercent(vesting_reward_percent),
    downvotePoolPercent: formatPercent(downvote_pool_percent),
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