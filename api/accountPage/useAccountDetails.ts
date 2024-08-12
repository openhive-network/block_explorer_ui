import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

const useAccountDetails = (accountName: string) => {
  const { hiveChain } = useHiveChainContext();

  const accountDetailsSelector = (
    data: Hive.AccountDetailsQueryResponse
  ): Explorer.FormattedAccountDetails => {
    const accountDetails = {
      ...data,
      balance: hiveChain?.hive(data.balance),
      savings_balance: hiveChain?.hive(data.savings_balance),
      hbd_balance: hiveChain?.hbd(data.hbd_balance),
      hbd_saving_balance: hiveChain?.hbd(data.hbd_saving_balance),
      reward_hbd_balance: hiveChain?.hbd(data.reward_hbd_balance),
      reward_vesting_balance: hiveChain?.vests(data.reward_vesting_balance),
      reward_vesting_hive: hiveChain?.hive(data.reward_vesting_hive),
      reward_hive_balance: hiveChain?.hive(data.reward_hive_balance),
      vesting_withdraw_rate: hiveChain?.vests(data.vesting_withdraw_rate),
      vesting_shares: hiveChain?.vests(data.vesting_shares),
      delegated_vesting_shares: hiveChain?.vests(data.delegated_vesting_shares),
      received_vesting_shares: hiveChain?.vests(data.received_vesting_shares),
      posting_rewards: hiveChain?.vests(data.posting_rewards),
      curation_rewards: hiveChain?.vests(data.curation_rewards),
      vesting_balance: hiveChain?.hive(data.vesting_balance),
      last_account_recovery: formatAndDelocalizeTime(
        data.last_account_recovery
      ),
      created: formatAndDelocalizeTime(data.created),
      last_vote_time: formatAndDelocalizeTime(data.last_vote_time),
    };

    const formattedAccountDetails = hiveChain?.formatter.format(
      accountDetails
    ) as Explorer.FormattedAccountDetails;
    delete formattedAccountDetails.last_post;
    delete formattedAccountDetails.last_root_post;
    delete formattedAccountDetails.post_count;
    return formattedAccountDetails;
  };

  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    isError: isAccountDetailsError,
    refetch: refetchAccountDetails,
  }: UseQueryResult<Explorer.FormattedAccountDetails> = useQuery({
    queryKey: ["account_details", accountName],
    queryFn: () => fetchingService.getAccount(accountName),
    refetchOnWindowFocus: false,
    select: (data) => accountDetailsSelector(data),
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountDetails,
    isAccountDetailsLoading,
    isAccountDetailsError,
    notFound:
      !isAccountDetailsLoading && accountDetails && accountDetails.id === null,
    refetchAccountDetails,
  };
};

export default useAccountDetails;
