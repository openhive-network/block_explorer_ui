import { useMemo } from "react";

import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useDynamicGlobal from "../api/homePage/useDynamicGlobal";
import useHeadBlock from "../api/homePage/useHeadBlock";

const useBlockchainSyncInfo = () => {
  const dynamicGlobalQueryData = useDynamicGlobal().dynamicGlobalData;
  const headBlockNum = useHeadBlockNumber().headBlockNumberData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;

  const { explorerBlockNumber, hiveBlockNumber, explorerTime, hiveBlockTime } =
    useMemo(
      () => getSyncInfoData(dynamicGlobalQueryData, headBlockData),
      [dynamicGlobalQueryData, headBlockData]
    );

  const loading =
    typeof explorerBlockNumber === "undefined" ||
    typeof hiveBlockNumber === "undefined";

  return {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
    loading,
  };
};

export default useBlockchainSyncInfo;

const getSyncInfoData = (
  globalData?: Explorer.HeadBlockCardData,
  headBlockData?: Hive.BlockDetails
) => {
  const hiveBlockNumber =
    globalData?.headBlockNumber && globalData?.headBlockNumber;
  const explorerBlockNumber =
    headBlockData?.block_num && headBlockData?.block_num;
  const hiveBlockTime =
    globalData?.headBlockDetails.blockchainTime &&
    new Date(globalData?.headBlockDetails.blockchainTime).getTime();
  const explorerTime =
    headBlockData?.created_at && new Date(headBlockData?.created_at).getTime();

  return {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
  };
};
