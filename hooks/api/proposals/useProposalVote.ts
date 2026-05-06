import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import { buildProposalVoteSignUrl } from "@/lib/smart-signer/providers/hivesigner";
import useVoterProposals from "./useVoterProposals";

const useProposalVote = (proposalId: number) => {
  const { username, method, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { votedProposalIds } = useVoterProposals(username ?? "");
  const isVoted = !!(votedProposalIds ?? []).includes(proposalId);

  const vote = async (approve: boolean) => {
    if (!username || !method || !isLoggedIn) return;
    setIsVoting(true);
    setError(null);

    if (method === 'hivesigner') {
      const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const sep = base.includes('?') ? '&' : '?';
      const redirectUri = `${base}${sep}hs_voted=1#proposal-${proposalId}`;
      window.location.href = buildProposalVoteSignUrl(username, proposalId, approve, redirectUri);
      return;
    }

    try {
      await SmartSigner.broadcast(username, method, [
        [
          "update_proposal_votes",
          {
            voter: username,
            proposal_ids: [proposalId],
            approve,
            extensions: [],
          },
        ],
      ], 'Active');

      // Optimistic cache update — no full refetch needed
      queryClient.setQueryData<number[]>(["voterProposals", username], (old) => {
        const ids = old ?? [];
        return approve
          ? ids.includes(proposalId) ? ids : [...ids, proposalId]
          : ids.filter((id) => id !== proposalId);
      });
    } catch (err: any) {
      setError(typeof err === "string" ? err : err?.message ?? "Transaction failed");
    } finally {
      setIsVoting(false);
    }
  };

  return { isVoted, isVoting, error, vote, isLoggedIn };
};

export default useProposalVote;
