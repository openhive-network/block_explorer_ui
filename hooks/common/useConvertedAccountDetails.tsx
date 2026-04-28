import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountDetails from "../api/accountPage/useAccountDetails";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { IHiveChainInterface } from "@hiveio/wax";
import useAccountRecurrentTransfers from "../api/accountPage/useAccoutRecurrentTransfers";
import useAccountBalances from "../api/accountPage/useAccountBalances";

export const VEST_HP_KEYS_MAP: Record<string, string> = {
  reward_vesting_balance: "vest_reward_vesting_balance",
  vesting_withdraw_rate: "vest_vesting_withdraw_rate",
  vesting_shares: "vest_vesting_shares",
  delegated_vesting_shares: "vest_delegated_vesting_shares",
  received_vesting_shares: "vest_received_vesting_shares",
  posting_rewards: "vest_posting_rewards",
  curation_rewards: "vest_curation_rewards",
  vesting_balance: "vest_vesting_balance",
};

const useConvertedAccountDetails = (
  accountName: string,
  liveDataEnabled: boolean,
  dynamicGlobalData?: Explorer.HeadBlockCardData
) => {
  const formatRawHP = (
    hiveChain: IHiveChainInterface,
    rawHP: Hive.Supply
  ): string => {
    const formattedHP = hiveChain.formatter.format(rawHP).replace("HIVE", "HP");
    return formattedHP as string;
  };

  const { hiveChain } = useHiveChainContext();
  const { accountDetails, notFound, isAccountDetailsLoading } =
    useAccountDetails(accountName, liveDataEnabled);
  const { accountBalancesData } = useAccountBalances(accountName);
  const { recurrentTransfers } = useAccountRecurrentTransfers(
    accountName,
    liveDataEnabled
  );

  if (!dynamicGlobalData || !hiveChain)
    return {
      formattedAccountDetails: undefined,
      notFound: undefined,
      isAccountDetailsLoading,
    };

  if (!accountDetails) {
    return {
      formattedAccountDetails: undefined,
      notFound: !accountDetails,
      isAccountDetailsLoading,
    };
  }
  const {
    headBlockDetails: {
      rawFeedPrice,
      rawQuote,
      rawTotalVestingFundHive,
      rawTotalVestingShares,
    },
  } = dynamicGlobalData;
  // Get VEST
  const vests = {
    reward_vesting_balance: hiveChain.vests(
      accountDetails.reward_vesting_balance
    ),
    vesting_withdraw_rate: hiveChain.vests(
      accountDetails.vesting_withdraw_rate
    ),
    vesting_shares: hiveChain.vests(accountDetails.vesting_shares),
    delegated_vesting_shares: hiveChain.vests(
      accountDetails.delegated_vesting_shares
    ),
    received_vesting_shares: hiveChain.vests(
      accountDetails.received_vesting_shares
    ),
    posting_rewards: hiveChain.vests(accountDetails.posting_rewards),
    curation_rewards: hiveChain.vests(accountDetails.curation_rewards),
    vesting_balance: hiveChain.vests(accountDetails.vesting_balance),
  };
  // CONVERT VEST to HP
  const reward_vesting_balance = hiveChain.hive(
    accountDetails.reward_vesting_hive
  );
  const vesting_withdraw_rate = hiveChain.vestsToHp(
    vests.vesting_withdraw_rate,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );
  const vesting_shares = hiveChain.vestsToHp(
    vests.vesting_shares,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );
  const delegated_vesting_shares = hiveChain.vestsToHp(
    vests.delegated_vesting_shares,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );
  const received_vesting_shares = hiveChain.vestsToHp(
    vests.received_vesting_shares,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );
  const posting_rewards = hiveChain.vestsToHp(
    vests.posting_rewards,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );
  const curation_rewards = hiveChain.vestsToHp(
    vests.curation_rewards,
    rawTotalVestingFundHive,
    rawTotalVestingShares
  );

  const api = accountBalancesData as any;

  const balanceApiFormatted = {
    open_orders_hive_amount: hiveChain.hive(api.open_orders_hive_amount),
    open_orders_hbd_amount: hiveChain.hbd(api.open_orders_hbd_amount),
    conversion_pending_amount_hive: hiveChain.hive(
      api.conversion_pending_amount_hive,
    ),
    conversion_pending_amount_hbd: hiveChain.hbd(
      api.conversion_pending_amount_hbd,
    ),
    savings_pending_amount_hive: hiveChain.hive(
      api.savings_pending_amount_hive,
    ),
    savings_pending_amount_hbd: hiveChain.hbd(api.savings_pending_amount_hbd),
    escrow_pending_amount_hive: hiveChain.hive(api.escrow_pending_amount_hive),
    escrow_pending_amount_hbd: hiveChain.hbd(api.escrow_pending_amount_hbd),

    // Counts (Passed as raw values)
    conversion_pending_count_hive: api.conversion_pending_count_hive,
    conversion_pending_count_hbd: api.conversion_pending_count_hbd,
    escrow_pending_count: api.escrow_pending_count,
    open_orders_hbd_count: api.open_orders_hbd_count,
    open_orders_hive_count: api.open_orders_hive_count,
  };

  // Put values for display
  const accountDetailsForFormat = {
    ...accountDetails,
    ...vests,
     ...balanceApiFormatted,
    balance: hiveChain.hive(accountDetails.balance),
    savings_balance: hiveChain.hive(accountDetails.savings_balance),
    hbd_balance: hiveChain.hbd(accountDetails.hbd_balance),
    hbd_saving_balance: hiveChain.hbd(accountDetails.hbd_saving_balance),
    reward_hbd_balance: hiveChain.hbd(accountDetails.reward_hbd_balance),
    reward_hive_balance: hiveChain.hive(accountDetails.reward_hive_balance),
    reward_vesting_balance: formatRawHP(hiveChain, reward_vesting_balance),
    reward_vesting_hive: hiveChain.hive(accountDetails.reward_vesting_hive),
    vesting_withdraw_rate: formatRawHP(hiveChain, vesting_withdraw_rate),
    delegated_vesting_shares: formatRawHP(hiveChain, delegated_vesting_shares),
    received_vesting_shares: formatRawHP(hiveChain, received_vesting_shares),
    posting_rewards: formatRawHP(hiveChain, posting_rewards),
    curation_rewards: formatRawHP(hiveChain, curation_rewards),
    vesting_shares: formatRawHP(hiveChain, vesting_shares),
    last_account_recovery: formatAndDelocalizeTime(
      accountDetails.last_account_recovery
    ),
    created: formatAndDelocalizeTime(accountDetails.created),
    open_recurrent_transfer:
      recurrentTransfers?.outgoing_recurrent_transfers?.length || 0,
  };

  // Prepare HBD for $ display
  const dollars = {
    hbd_balance: accountDetailsForFormat.hbd_balance,
    hbd_saving_balance: accountDetailsForFormat.hbd_saving_balance,
    reward_hbd_balance: accountDetailsForFormat.reward_hbd_balance,
    balance: hiveChain.hiveToHbd(
      accountDetailsForFormat.balance,
      rawFeedPrice,
      rawQuote
    ),
    savings_balance: hiveChain.hiveToHbd(
      accountDetailsForFormat.savings_balance,
      rawFeedPrice,
      rawQuote
    ),
    reward_hive_balance: hiveChain.hiveToHbd(
      accountDetailsForFormat.reward_hive_balance,
      rawFeedPrice,
      rawQuote
    ),
    reward_vesting_balance: hiveChain.hiveToHbd(
      reward_vesting_balance,
      rawFeedPrice,
      rawQuote
    ),
    received_vesting_shares: hiveChain.hiveToHbd(
      received_vesting_shares,
      rawFeedPrice,
      rawQuote
    ),
    delegated_vesting_shares: hiveChain.hiveToHbd(
      delegated_vesting_shares,
      rawFeedPrice,
      rawQuote
    ),
    vesting_shares: hiveChain.hiveToHbd(vesting_shares, rawFeedPrice, rawQuote),
    vesting_withdraw_rate: hiveChain.hiveToHbd(
      vesting_withdraw_rate,
      rawFeedPrice,
      rawQuote,
    ),
    open_orders_hbd_amount: balanceApiFormatted.open_orders_hbd_amount,
    open_orders_hive_amount: hiveChain.hiveToHbd(
      balanceApiFormatted.open_orders_hive_amount,
      rawFeedPrice,
      rawQuote,
    ),
    conversion_pending_amount_hbd:
      balanceApiFormatted.conversion_pending_amount_hbd,
    conversion_pending_amount_hive: hiveChain.hiveToHbd(
      balanceApiFormatted.conversion_pending_amount_hive,
      rawFeedPrice,
      rawQuote,
    ),
    savings_pending_amount_hbd: balanceApiFormatted.savings_pending_amount_hbd,
    savings_pending_amount_hive: hiveChain.hiveToHbd(
      balanceApiFormatted.savings_pending_amount_hive,
      rawFeedPrice,
      rawQuote,
    ),
    escrow_pending_amount_hbd: balanceApiFormatted.escrow_pending_amount_hbd,
    escrow_pending_amount_hive: hiveChain.hiveToHbd(
      balanceApiFormatted.escrow_pending_amount_hive,
      rawFeedPrice,
      rawQuote,
    ),
  };
  interface NaiAsset {
    amount: string;
    nai: string;
    precision: number;
  }

  /* Account Value Calculations */
  const skipCalculation = [
    "delegated_vesting_shares",
    "received_vesting_shares",
  ];

  let totalAccountValue = Object.entries(dollars).reduce(
    (sum, [key, value]) => {
      if (
        value &&
        value.hasOwnProperty("amount") &&
        !skipCalculation.includes(key)
      ) {
        return sum + Number((value as NaiAsset).amount);
      }
      return sum;
    },
    0
  );

  (dollars as any)["account_value"] = hiveChain.hbd(totalAccountValue);

  const formattedAccountDetails = {
    ...hiveChain?.formatter.format({
      ...accountDetailsForFormat,
      dollars,
      vests,
      has_hbd_reward: !!accountDetails.reward_hbd_balance,
      has_vesting_reward: !!Number(accountDetails.reward_vesting_balance),
      has_hive_reward: !!accountDetails.reward_hive_balance,
    }),
  } as Explorer.FormattedAccountDetails;
  return {
    formattedAccountDetails,
    notFound,
    isAccountDetailsLoading,
  };
};

export default useConvertedAccountDetails;
