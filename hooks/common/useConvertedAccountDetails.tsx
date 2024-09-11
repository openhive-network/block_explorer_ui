import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountDetails from "../api/accountPage/useAccountDetails";
import useDynamicGlobal from "../api/homePage/useDynamicGlobal";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Explorer from "@/types/Explorer";
import { convertHiveToUSD, convertVestsToHP } from "@/utils/Calculations";

const useConvertedAccountDetails = (accountName: string, liveDataEnabled: boolean) => {
  const { dynamicGlobalData } = useDynamicGlobal();
  const { hiveChain } = useHiveChainContext();
  if (!dynamicGlobalData || !hiveChain) return {formattedAccountDetails: undefined, notFound: undefined};
  const {
    headBlockDetails: { feedPrice, rawTotalVestingFundHive, rawTotalVestingShares },
  } = dynamicGlobalData;
  const {accountDetails, notFound}= useAccountDetails(accountName, liveDataEnabled);
  if (!accountDetails) return {formattedAccountDetails: undefined, notFound: undefined};;
    const accountDetailsForFormat = {
      ...accountDetails,
      balance: hiveChain.hive(accountDetails.balance),
      savings_balance: hiveChain.hive(accountDetails.savings_balance),
      hbd_balance: hiveChain.hbd(accountDetails.hbd_balance),
      hbd_saving_balance: hiveChain.hbd(accountDetails.hbd_saving_balance),
      reward_hbd_balance: hiveChain.hbd(accountDetails.reward_hbd_balance),
      reward_vesting_balance: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.reward_vesting_balance), rawTotalVestingFundHive, rawTotalVestingShares),
      reward_vesting_hive: hiveChain.hive(accountDetails.reward_vesting_hive),
      reward_hive_balance: hiveChain.hive(accountDetails.reward_hive_balance),
      vesting_withdraw_rate: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.vesting_withdraw_rate), rawTotalVestingFundHive, rawTotalVestingShares),
      vesting_shares: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.vesting_shares), rawTotalVestingFundHive, rawTotalVestingShares),
      delegated_vesting_shares: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.delegated_vesting_shares), rawTotalVestingFundHive, rawTotalVestingShares),
      received_vesting_shares: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.received_vesting_shares), rawTotalVestingFundHive, rawTotalVestingShares),
      posting_rewards: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.posting_rewards), rawTotalVestingFundHive, rawTotalVestingShares),
      curation_rewards: convertVestsToHP(hiveChain, hiveChain.vests(accountDetails.curation_rewards), rawTotalVestingFundHive, rawTotalVestingShares),
      vesting_balance: hiveChain.hive(accountDetails.vesting_balance),
      last_account_recovery: formatAndDelocalizeTime(
        accountDetails.last_account_recovery
      ),
      created: formatAndDelocalizeTime(accountDetails.created),
    };

    const formattedAccountDetails = {...hiveChain?.formatter.format(
      accountDetailsForFormat
      )
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