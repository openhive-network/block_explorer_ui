import { useEffect, useState } from "react";
import moment from "moment";

import { config } from "@/Config";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useURLParams from "@/hooks/common/useURLParams";
import { AccountSearchParams } from "@/pages/[accountName]";
import {
  SearchRangesResult,
  rangeSelectOptions,
  timeSelectOptions,
} from "@/hooks/common/useSearchRanges";

export const defaultAccountOperationsTabSearchParams: AccountSearchParams = {
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: undefined,
  timeUnit: undefined,
  rangeSelectKey: "none",
  page: undefined,
  filters: [],
};

const useAccountOperationsTabSearchRanges = (
  defaultSelectKey: string = "none"
) => {
  const { paramsState } = useURLParams(defaultAccountOperationsTabSearchParams);

  const [fromBlock, setFromBlock] = useState<number | undefined>(undefined);
  const [toBlock, setToBlock] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(config.firstBlockTime)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now()));
  const [lastBlocksValue, setLastBlocksValue] = useState<number | undefined>(
    undefined
  );
  const [lastTimeUnitValue, setLastTimeUnitValue] = useState<
    number | undefined
  >(undefined);
  const [rangeSelectKey, setRangeSelectKey] =
    useState<string>(defaultSelectKey);
  const [timeUnitSelectKey, setTimeUnitSelectKey] = useState<
    string | undefined
  >(undefined);
  const { checkTemporaryHeadBlockNumber } = useHeadBlockNumber();

  const setRangesValues = (params: any) => {
    if (!params) return;

    params.fromBlock && setFromBlock(params.fromBlock);
    params.toBlock && setToBlock(params.toBlock);
    params.startDate && setStartDate(params.startDate);
    params.endDate && setEndDate(params.endDate);
    params.fromDate && setStartDate(params.fromDate);
    params.toDate && setEndDate(params.toDate);
    params.lastBlocks && setLastBlocksValue(params.lastBlocks);
    params.lastTime && setLastTimeUnitValue(params.lastTime);
    params.rangeSelectKey && setRangeSelectKey(params.rangeSelectKey);
    params.timeUnit && setTimeUnitSelectKey(params.timeUnit);
  };

  const getRangesValues = async () => {
    let payloadFromBlock: number | undefined =
      rangeSelectKey === "blockRange" ? fromBlock : undefined;
    let payloadToBlock: number | undefined =
      rangeSelectKey === "blockRange" ? toBlock : undefined;
    let payloadStartDate: Date | undefined =
      rangeSelectKey === "timeRange" ? startDate : undefined;
    let payloadEndDate: Date | undefined =
      rangeSelectKey === "timeRange" ? endDate : undefined;
    if (lastBlocksValue && rangeSelectKey === "lastBlocks") {
      const currentHeadBlockNumber = await checkTemporaryHeadBlockNumber();
      payloadFromBlock = Number(currentHeadBlockNumber) - lastBlocksValue;
      if (payloadFromBlock <= 0) {
        payloadFromBlock = undefined;
      }
    }
    if (lastTimeUnitValue && rangeSelectKey === "lastTime") {
      const typedTimeUnit = timeUnitSelectKey as
        | "days"
        | "weeks"
        | "months"
        | "hours";
      payloadStartDate = moment()
        .subtract(lastTimeUnitValue, typedTimeUnit)
        .milliseconds(0)
        .toDate();
    }

    //Validate that payloadStartDate is a valid
    if (
      payloadStartDate &&
      (isNaN(payloadStartDate?.getTime()) || payloadStartDate?.getTime() <= 0)
    ) {
      payloadStartDate = undefined; //fallback
    }
    //Validate that payloadToBlock does not exceed latest headblock number
    if (payloadToBlock) {
      const currentHeadBlockNumber = await checkTemporaryHeadBlockNumber();
      if (payloadToBlock > currentHeadBlockNumber) {
        payloadToBlock = currentHeadBlockNumber; //fallback
      }
    }
    if (payloadFromBlock) {
      const currentHeadBlockNumber = await checkTemporaryHeadBlockNumber();
      if (payloadFromBlock > currentHeadBlockNumber) {
        payloadFromBlock = currentHeadBlockNumber; //fallback
      }
    }

    return {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    };
  };

  //   Set range values from url params
  useEffect(() => {
    if (paramsState) {
      setRangesValues(paramsState);
    }
  }, [paramsState]);

  return {
    rangeSelectOptions,
    timeSelectOptions,
    fromBlock,
    toBlock,
    startDate,
    endDate,
    lastBlocksValue,
    lastTimeUnitValue,
    rangeSelectKey,
    timeUnitSelectKey,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    getRangesValues,
    setRangesValues,
  } as SearchRangesResult;
};

export default useAccountOperationsTabSearchRanges;
