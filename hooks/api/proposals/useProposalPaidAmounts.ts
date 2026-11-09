import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";

// Cumulative HBD paid per proposal id (milli-HBD strings), one request per
// status, so cards of the same status share it.
const useProposalPaidAmounts = (status: Hive.ProposalVoteStatus) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["proposalPaidAmounts", status],
    queryFn: () => fetchingService.getProposalsPaidAmounts(status),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Optional figure: on failure the card just leaves it out.
    meta: { suppressErrorToast: true },
  });
  return { paidAmounts: data, isPending, isError };
};

const MILLI = BigInt(1000);

// paid_amount is an integer count of milli-HBD; stay in integers so large
// totals keep every digit.
export const formatMilliHbd = (
  raw: string,
  locale?: string,
  exact = false
): string | null => {
  if (!/^\d+$/.test(raw)) return null;
  const value = BigInt(raw);
  if (!exact)
    return ((value + MILLI / BigInt(2)) / MILLI).toLocaleString(locale);
  const decimal =
    new Intl.NumberFormat(locale)
      .formatToParts(1.5)
      .find((p) => p.type === "decimal")?.value ?? ".";
  const fraction = (value % MILLI).toString().padStart(3, "0");
  return `${(value / MILLI).toLocaleString(locale)}${decimal}${fraction}`;
};

export default useProposalPaidAmounts;
