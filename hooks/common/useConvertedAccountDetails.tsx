import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountDetails from "../api/accountPage/useAccountDetails";
import useDynamicGlobal from "../api/homePage/useDynamicGlobal";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Explorer from "@/types/Explorer";
import {convertVestsToHP } from "@/utils/Calculations";

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
  const { hiveChain } = useHiveChainContext();
  const {accountDetails, notFound}= useAccountDetails(accountName, liveDataEnabled);
  if (!dynamicGlobalData || !hiveChain || !accountDetails) return {formattedAccountDetails: undefined, notFound: undefined};
  const {
    headBlockDetails: { rawFeedPrice, rawQuote, rawTotalVestingFundHive, rawTotalVestingShares },
  } = dynamicGlobalData;
  const vests = {
    vest_reward_vesting_balance: hiveChain.vests(accountDetails.reward_vesting_balance),
    vest_vesting_withdraw_rate: hiveChain.vests(accountDetails.vesting_withdraw_rate),
    vest_vesting_shares: hiveChain.vests(accountDetails.vesting_shares),
    vest_delegated_vesting_shares: hiveChain.vests(accountDetails.delegated_vesting_shares),
    vest_received_vesting_shares: hiveChain.vests(accountDetails.delegated_vesting_shares),
    vest_posting_rewards: hiveChain.vests(accountDetails.posting_rewards),
    vest_curation_rewards: hiveChain.vests(accountDetails.curation_rewards),
    vest_vesting_balance: hiveChain.vests(accountDetails.vesting_balance)
  }
  console.log("")
  const accountDetailsForFormat = {
    ...accountDetails,
    ...vests,
    balance: hiveChain.hive(accountDetails.balance),
    savings_balance: hiveChain.hive(accountDetails.savings_balance),
    hbd_balance: hiveChain.hbd(accountDetails.hbd_balance),
    hbd_saving_balance: hiveChain.hbd(accountDetails.hbd_saving_balance),
    reward_hbd_balance: hiveChain.hbd(accountDetails.reward_hbd_balance),
    reward_vesting_hive: hiveChain.hive(accountDetails.reward_vesting_hive),
    reward_hive_balance: hiveChain.hive(accountDetails.reward_hive_balance),
    reward_vesting_balance: convertVestsToHP(hiveChain, vests.vest_reward_vesting_balance, rawTotalVestingFundHive, rawTotalVestingShares),
    vesting_withdraw_rate: convertVestsToHP(hiveChain, vests.vest_vesting_withdraw_rate, rawTotalVestingFundHive, rawTotalVestingShares),
    vesting_shares: convertVestsToHP(hiveChain, vests.vest_vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares),
    delegated_vesting_shares: convertVestsToHP(hiveChain, vests.vest_delegated_vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares),
    received_vesting_shares: convertVestsToHP(hiveChain, vests.vest_received_vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares),
    posting_rewards: convertVestsToHP(hiveChain, vests.vest_posting_rewards, rawTotalVestingFundHive, rawTotalVestingShares),
    curation_rewards: convertVestsToHP(hiveChain, vests.vest_curation_rewards, rawTotalVestingFundHive, rawTotalVestingShares),
    vesting_balance: convertVestsToHP(hiveChain, vests.vest_vesting_balance, rawTotalVestingFundHive, rawTotalVestingShares),
    last_account_recovery: formatAndDelocalizeTime(
      accountDetails.last_account_recovery
    ),
    created: formatAndDelocalizeTime(accountDetails.created),
  };

  const dollars = {
    hbd_balance: accountDetailsForFormat.hbd_balance,
    hbd_saving_balance: accountDetailsForFormat.hbd_saving_balance,
    reward_hbd_balance: accountDetailsForFormat.reward_hbd_balance,
    balance: hiveChain.hiveToHbd(accountDetailsForFormat.balance, rawFeedPrice, rawQuote),
    savings_balance: hiveChain.hiveToHbd(accountDetailsForFormat.savings_balance, rawFeedPrice, rawQuote),
    reward_hive_balance: hiveChain.hiveToHbd(accountDetailsForFormat.reward_hive_balance, rawFeedPrice, rawQuote),
    vesting_balance: hiveChain.hiveToHbd(accountDetailsForFormat.vesting_balance, rawFeedPrice, rawQuote),
    reward_vesting_hive: hiveChain.hiveToHbd(accountDetailsForFormat.reward_vesting_hive, rawFeedPrice, rawQuote),
    received_vesting_shares: hiveChain.hiveToHbd(accountDetailsForFormat.received_vesting_shares, rawFeedPrice, rawQuote),
    delegated_vesting_shares: hiveChain.hiveToHbd(accountDetailsForFormat.delegated_vesting_shares, rawFeedPrice, rawQuote),
    vesting_withdraw_rate: hiveChain.hiveToHbd(accountDetailsForFormat.vesting_withdraw_rate, rawFeedPrice, rawQuote)
  }

  const formattedAccountDetails = {...hiveChain?.formatter.format(
    {...accountDetailsForFormat, dollars}
    )
  } as Explorer.FormattedAccountDetails;
  console.log('FORMATTED ACCOUNT DETAILS', formattedAccountDetails);
  delete formattedAccountDetails.last_post;
  delete formattedAccountDetails.last_root_post;
  delete formattedAccountDetails.post_count;
  return {
    formattedAccountDetails, 
    notFound
  };
}

export default useConvertedAccountDetails;