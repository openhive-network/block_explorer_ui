import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

interface WitnessVoteChainResult {
  witnessVotes: string[];
  proxyChain: string[];
}

const resolveVoteChain = async (
  accountName: string
): Promise<WitnessVoteChainResult> => {
  const proxyChain: string[] = [];
  let currentName = accountName;
  let depth = 0;

  while (currentName && depth <= config.maxProxyDepth) {
    const account = await fetchingService.getAccount(currentName);
    const proxy = account.proxy ?? "";

    if (!proxy) {
      return {
        witnessVotes: account.witness_votes ?? [],
        proxyChain,
      };
    }

    proxyChain.push(proxy);
    currentName = proxy;
    depth++;
  }

  return { witnessVotes: [], proxyChain };
};

const useWitnessVoteChain = (accountName: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["witnessVoteChain", accountName],
    queryFn: () => resolveVoteChain(accountName),
    enabled: !!accountName,
    refetchOnWindowFocus: false,
    // One SetProxyButton mounts per table row; staleTime avoids per-row refetch churn.
    staleTime: 60_000,
  });

  return {
    witnessVotes: data?.witnessVotes ?? [],
    proxyChain: data?.proxyChain ?? [],
    isLoading,
  };
};

export default useWitnessVoteChain;
