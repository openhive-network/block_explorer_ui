import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

// Per proposal id, milli-HBD strings: HBD paid so far and, when hafbe returns
// it, the full-term budget at the daily pay in force each day. One request for
// every status: the page derives a card's status from the browser clock and
// hafbe from its head block, so a per-status lookup could miss a proposal at
// its start or end date.
const useProposalPaidAmounts = () => {
  const { data, isPending } = useQuery({
    queryKey: ["proposalPaidAmounts"],
    queryFn: () => fetchingService.getProposalsPaidAmounts(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Optional figure: on failure the card just leaves it out.
    meta: { suppressErrorToast: true },
  });
  return { paidAmounts: data, isPending };
};

// paid_amount is a whole number of milli-HBD. The largest on chain is about
// 2.7e11, far inside Number's exact range, so dividing by 1000 loses nothing.
export const formatMilliHbd = (
  raw: string,
  locale?: string,
  exact = false
): string | null => {
  if (!/^\d+$/.test(raw)) return null;
  const digits = exact ? 3 : 0;
  return (Number(raw) / 1000).toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

// Full-term budget in HBD. hafbe's figure follows the daily pay in force each
// day; without it (older hafbe, or still loading) today's daily pay stands in
// for the whole term, which is too low if the daily pay was lowered.
export const proposalTotalBudget = (
  totalBudgetRaw: string | undefined,
  dailyPay: number,
  totalDays: number
): number =>
  totalBudgetRaw && /^\d+$/.test(totalBudgetRaw)
    ? Number(totalBudgetRaw) / 1000
    : dailyPay * totalDays;

export default useProposalPaidAmounts;
