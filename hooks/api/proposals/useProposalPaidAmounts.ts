import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

// Cumulative HBD paid per proposal id (milli-HBD strings). One request for
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

export default useProposalPaidAmounts;
