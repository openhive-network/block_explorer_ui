import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountDetails from "../api/accountPage/useAccountDetails";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { IHiveChainInterface } from "@hiveio/wax";

export const VEST_HP_KEYS_MAP: Record<string, string> = {
  reward_vesting_balance: "vest_reward_vesting_balance",
  vesting_withdraw_rate: "vest_vesting_withdraw_rate",
  vesting_shares: "vest_vesting_shares",
  delegated_vesting_shares: "vest_delegated_vesting_shares",
  received_vesting_shares: "vest_received_vesting_shares",
  posting_rewards: "vest_posting_rewards",
  curation_rewards: "vest_curation_rewards",
  vesting_balance: "vest_vesting_balance"
}

const useConvertedAccountDetails = (accountName: string, liveDataEnabled: boolean, dynamicGlobalData?: Explorer.HeadBlockCardData) => {

  const formatRawHP = (hiveChain: IHiveChainInterface, rawHP: Hive.Supply): string => {
    const formattedHP = hiveChain.formatter
      .format(rawHP)
      .replace("HIVE", "HP");
    return formattedHP as string;
  }

  const { hiveChain } = useHiveChainContext();
  const {accountDetails, notFound}= useAccountDetails(accountName, liveDataEnabled);
  if (!dynamicGlobalData || !hiveChain || !accountDetails) return {formattedAccountDetails: undefined, notFound: undefined};
  const {
    headBlockDetails: { rawFeedPrice, rawQuote, rawTotalVestingFundHive, rawTotalVestingShares },
  } = dynamicGlobalData;
  // Get VEST
  const vests = {
    reward_vesting_balance: hiveChain.vests(accountDetails.reward_vesting_balance),
    vesting_withdraw_rate: hiveChain.vests(accountDetails.vesting_withdraw_rate),
    vesting_shares: hiveChain.vests(accountDetails.vesting_shares),
    delegated_vesting_shares: hiveChain.vests(accountDetails.delegated_vesting_shares),
    received_vesting_shares: hiveChain.vests(accountDetails.delegated_vesting_shares),
    posting_rewards: hiveChain.vests(accountDetails.posting_rewards),
    curation_rewards: hiveChain.vests(accountDetails.curation_rewards),
    vesting_balance: hiveChain.vests(accountDetails.vesting_balance),
    reward_vesting_hive: hiveChain.vests(accountDetails.reward_vesting_hive),
  }
  // CONVERT VEST to HP
  const reward_vesting_hive = hiveChain.vestsToHp(vests.reward_vesting_hive, rawTotalVestingFundHive, rawTotalVestingShares);
  const reward_vesting_balance = hiveChain.vestsToHp(vests.reward_vesting_balance, rawTotalVestingFundHive, rawTotalVestingShares);
  const vesting_withdraw_rate = hiveChain.vestsToHp(vests.vesting_withdraw_rate, rawTotalVestingFundHive, rawTotalVestingShares);
  const vesting_shares = hiveChain.vestsToHp(vests.vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares);
  const delegated_vesting_shares = hiveChain.vestsToHp(vests.delegated_vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares);
  const received_vesting_shares = hiveChain.vestsToHp(vests.received_vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares);
  const posting_rewards = hiveChain.vestsToHp(vests.posting_rewards, rawTotalVestingFundHive, rawTotalVestingShares);
  const curation_rewards = hiveChain.vestsToHp(vests.curation_rewards, rawTotalVestingFundHive, rawTotalVestingShares);
  const vesting_balance = hiveChain.vestsToHp(vests.vesting_balance, rawTotalVestingFundHive, rawTotalVestingShares);
  // Put values for display
  const accountDetailsForFormat = {
    ...accountDetails,
    ...vests,
    balance: hiveChain.hive(accountDetails.balance),
    savings_balance: hiveChain.hive(accountDetails.savings_balance),
    hbd_balance: hiveChain.hbd(accountDetails.hbd_balance),
    hbd_saving_balance: hiveChain.hbd(accountDetails.hbd_saving_balance),
    reward_hbd_balance: hiveChain.hbd(accountDetails.reward_hbd_balance),
    reward_hive_balance: hiveChain.hive(accountDetails.reward_hive_balance),
    reward_vesting_hive: formatRawHP(hiveChain, reward_vesting_hive),
    reward_vesting_balance: formatRawHP(hiveChain, reward_vesting_balance),
    vesting_withdraw_rate: formatRawHP(hiveChain, vesting_withdraw_rate),
    vesting_shares: formatRawHP(hiveChain, vesting_shares),
    delegated_vesting_shares: formatRawHP(hiveChain, delegated_vesting_shares),
    received_vesting_shares: formatRawHP(hiveChain, received_vesting_shares),
    posting_rewards: formatRawHP(hiveChain, posting_rewards),
    curation_rewards: formatRawHP(hiveChain, curation_rewards),
    vesting_balance: formatRawHP(hiveChain, vesting_balance),
    last_account_recovery: formatAndDelocalizeTime(
      accountDetails.last_account_recovery
    ),
    created: formatAndDelocalizeTime(accountDetails.created),
  };

  // Prepare HBD for $ display
  const dollars = {
    hbd_balance: accountDetailsForFormat.hbd_balance,
    hbd_saving_balance: accountDetailsForFormat.hbd_saving_balance,
    reward_hbd_balance: accountDetailsForFormat.reward_hbd_balance,
    balance: hiveChain.hiveToHbd(accountDetailsForFormat.balance, rawFeedPrice, rawQuote),
    savings_balance: hiveChain.hiveToHbd(accountDetailsForFormat.savings_balance, rawFeedPrice, rawQuote),
    reward_hive_balance: hiveChain.hiveToHbd(accountDetailsForFormat.reward_hive_balance, rawFeedPrice, rawQuote),
    vesting_balance: hiveChain.hiveToHbd(vesting_balance, rawFeedPrice, rawQuote),
    reward_vesting_hive: hiveChain.hiveToHbd(reward_vesting_hive, rawFeedPrice, rawQuote),
    received_vesting_shares: hiveChain.hiveToHbd(received_vesting_shares, rawFeedPrice, rawQuote),
    delegated_vesting_shares: hiveChain.hiveToHbd(delegated_vesting_shares, rawFeedPrice, rawQuote),
    vesting_withdraw_rate: hiveChain.hiveToHbd(vesting_withdraw_rate, rawFeedPrice, rawQuote)
  }

  const formattedAccountDetails = {...hiveChain?.formatter.format(
    {...accountDetailsForFormat, dollars, vests}
    ),
  } as Explorer.FormattedAccountDetails;
  delete formattedAccountDetails.last_post;
  delete formattedAccountDetails.last_root_post;
  delete formattedAccountDetails.post_count;
  return {
    formattedAccountDetails, 
    notFound
  };
}

export default useConvertedAccountDetails;