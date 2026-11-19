import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import fetchingService from "@/services/FetchingService";
import { parseChainDate } from "@/utils/TimeUtils";
import useHeadBlock from "../api/homePage/useHeadBlock";

const IDLE_REFRESH_MS = 30_000;
const OPEN_REFRESH_MS = 3_000;

// How far the block this page shows trails the chain. The page's head block is
// only read here, never polled, so with Live Data off the gap grows until the
// user refreshes. React Query pauses the interval while the tab is hidden.
const useBlockchainSyncInfo = (isDialogOpen = false) => {
  const explorerBlockNumber: number | undefined =
    useHeadBlockNumber().headBlockNumberData;
  // The block's time is shown only in the dialog. Fetched with it closed, it
  // cost one request per new head block on every page.
  const headBlockData = useHeadBlock(
    isDialogOpen ? explorerBlockNumber : undefined
  ).headBlockData;

  const { data: nodeHead, refetch } = useQuery({
    queryKey: ["blockchainNodeHead"],
    queryFn: async () => {
      const globals = await fetchingService.getDynamicGlobalProperties();
      return { hiveBlockNumber: globals.head_block_number };
    },
    refetchInterval: isDialogOpen ? OPEN_REFRESH_MS : IDLE_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isDialogOpen) refetch();
  }, [isDialogOpen, refetch]);

  // The chain's zoneless timestamp is UTC; new Date() alone reads it as local.
  const explorerTime = parseChainDate(headBlockData?.created_at)?.getTime();

  return {
    explorerBlockNumber,
    hiveBlockNumber: nodeHead?.hiveBlockNumber,
    explorerTime,
    loading: !nodeHead || typeof explorerBlockNumber !== "number",
  };
};

export default useBlockchainSyncInfo;
