import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { formatPercent } from "@/lib/utils";
import { GetDynamicGlobalPropertiesResponse, IHiveChainInterface } from "@hive/wax";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

/**
 * Get dynamic global block data and adjust it for page display.
 *
 * @export
 * @param {GetDynamicGlobalPropertiesResponse} dynamicGlobalQuery
 * @param {Hive.PriceFeed} currentPriceFeed
 * @param {Hive.RewardFunds[]} rewardFunds
 * @returns {Explorer.HeadBlockDetails}
 */
export function adjustDynamicGlobalBlockData(
  dynamicGlobalQuery: GetDynamicGlobalPropertiesResponse,
  currentPriceFeed: Hive.PriceFeed,
  rewardFunds: Hive.RewardFunds[],
  hiveChain: IHiveChainInterface
): Explorer.HeadBlockCardData {
  const { base } = currentPriceFeed;
  const basicFormatter = hiveChain.formatter;
  const formattedBaseValues: Explorer.DynamicGlobalBlock = basicFormatter.format(dynamicGlobalQuery);
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
  const rewardBalance: string = basicFormatter.format(rewardFunds[0].reward_balance);
  const headBlockDetails: Explorer.HeadBlockDetails = {
    feedPrice: basicFormatter.format(base),
    blockchainTime: formatAndDelocalizeTime(time),
    rewardFund: rewardBalance,
    currentSupply: current_supply,
    virtualSupply: virtual_supply,
    initHbdSupply: init_hbd_supply,
    currentHbdSupply: current_hbd_supply,
    totalVestingFundHive: total_vesting_fund_hive,
    pendingRewardedVestingHive: pending_rewarded_vesting_hive,
    hbdInterestRate: formatPercent(hbd_interest_rate),
    hbdPrintRate: formatPercent(hbd_print_rate),
    lastIrreversibleBlockNumber: last_irreversible_block_num.toLocaleString(),
    availableAccountSubsidies: available_account_subsidies.toLocaleString(),
    hbdStopPercent: formatPercent(hbd_stop_percent),
    hbdStartPercent: formatPercent(hbd_start_percent),
    nextMaintenanceTime: formatAndDelocalizeTime(next_maintenance_time) ,
    lastBudgetTime: formatAndDelocalizeTime(last_budget_time),
    nextDailyMaintenanceTime: formatAndDelocalizeTime(next_daily_maintenance_time),
    contentRewardPercent: formatPercent(content_reward_percent), // Remember to fix all percentage values later
    vestingRewardPercent: formatPercent(vesting_reward_percent),
    downvotePoolPercent: formatPercent(downvote_pool_percent),
    currentRemoveThreshold: current_remove_threshold,
    earlyVotingSeconds: early_voting_seconds.toLocaleString(),
    midVotingSeconds: mid_voting_seconds.toLocaleString(),
    maxConvecutiveRecurrentTransferFailures: max_consecutive_recurrent_transfer_failures.toLocaleString(),
    maxRecurrentTransferEndDate: max_recurrent_transfer_end_date,
    minRecurrentTransfersRecurrence: min_recurrent_transfers_recurrence,
    maxOpenRecurrentTransfers: max_open_recurrent_transfers

  };
  return {headBlockDetails, headBlockNumber: head_block_number, witnessName: current_witness};
}