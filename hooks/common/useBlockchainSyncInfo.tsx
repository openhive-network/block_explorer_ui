import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import fetchingService from "@/services/FetchingService";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import useHeadBlock from "../api/homePage/useHeadBlock";

const IDLE_REFRESH_MS = 30_000;
const OPEN_REFRESH_MS = 3_000;

// How far the block this page shows trails the chain. The page's head block is
// only read here, never polled, so with Live Data off the gap grows until the
// user refreshes. React Query pauses the interval while the tab is hidden.
const useBlockchainSyncInfo = (isDialogOpen = false) => {
  const explorerBlockNumber: number | undefined =
    useHeadBlockNumber().headBlockNumberData;
  const headBlockData = useHeadBlock(explorerBlockNumber).headBlockData;

  const { data: nodeHead, refetch } = useQuery({
    queryKey: ["blockchainNodeHead"],
    queryFn: async () => {
      const globals = await fetchingService.getDynamicGlobalProperties();
      return {
        hiveBlockNumber: globals.head_block_number,
        hiveBlockTime: new Date(
          formatAndDelocalizeTime(globals.time)
        ).getTime(),
      };
    },
    refetchInterval: isDialogOpen ? OPEN_REFRESH_MS : IDLE_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isDialogOpen) refetch();
  }, [isDialogOpen, refetch]);

  const explorerTime = headBlockData?.created_at
    ? new Date(headBlockData.created_at).getTime()
    : undefined;

  return {
    explorerBlockNumber,
    hiveBlockNumber: nodeHead?.hiveBlockNumber,
    explorerTime,
    hiveBlockTime: nodeHead?.hiveBlockTime,
    loading: !nodeHead || typeof explorerBlockNumber !== "number",
  };
};

export default useBlockchainSyncInfo;
