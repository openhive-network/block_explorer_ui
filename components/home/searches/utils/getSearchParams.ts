import { SearchRangesResult } from "@/hooks/common/useSearchRanges";

export const getSearchParams = async (searchRanges: SearchRangesResult) => {
  const { getRangesValues } = searchRanges;

  const { payloadFromBlock, payloadToBlock, payloadStartDate, payloadEndDate } =
    await getRangesValues();

  return {
    fromBlock: payloadFromBlock,
    toBlock: payloadToBlock,
    startDate: payloadStartDate,
    endDate: payloadEndDate,
    lastBlocks:
      searchRanges.rangeSelectKey === "lastBlocks"
        ? searchRanges.lastBlocksValue
        : undefined,
    lastTime: searchRanges.lastTimeUnitValue,
    rangeSelectKey: searchRanges.rangeSelectKey,
    timeUnit: searchRanges.timeUnitSelectKey,
  };
};
