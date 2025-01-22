import { useState } from "react";
import moment from "moment";

import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { useHeadBlockNumber } from "../../contexts/HeadBlockContext";

const DEFAULT_LAST_BLOCK_VALUE = 1000;
const DEFAULT_LAST_TIME_UNIT_VALUE = 30;
const DEFAULT_TIME_UNIT_SELECT_KEY = "days";

interface RangesValues {
  payloadFromBlock?: number;
  payloadToBlock?: number;
  payloadStartDate?: Date;
  payloadEndDate?: Date;
}

export interface SearchRangesResult {
  rangeSelectOptions: Explorer.SelectOption[];
  timeSelectOptions: Explorer.SelectOption[];
  fromBlock?: number;
  toBlock?: number;
  startDate?: Date;
  endDate?: Date;
  lastBlocksValue?: number;
  lastTimeUnitValue?: number;
  rangeSelectKey: string;
  timeUnitSelectKey: string;
  setFromBlock: (blockNumber: number | undefined) => void;
  setToBlock: (blockNumber: number | undefined) => void;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setLastBlocksValue: (last: number | undefined) => void;
  setLastTimeUnitValue: (last: number | undefined) => void;
  setRangeSelectKey: (key: string) => void;
  setTimeUnitSelectKey: (blockNumber: string) => void;
  getRangesValues: () => RangesValues;
  setRangesValues: (params: Explorer.CommentSearchParams | undefined) => void;
}

const useSearchRanges = (defaultSelectKey: string = "lastTime") => {
  const rangeSelectOptions: Explorer.SelectOption[] = [
    {
      name: "Last blocks",
      key: "lastBlocks",
    },
    {
      name: "Last days/weeks/months",
      key: "lastTime",
    },
    {
      name: "Block range",
      key: "blockRange",
    },
    {
      name: "Time range",
      key: "timeRange",
    },
    {
      name: "---",
      key: "none",
    },
  ];

  const timeSelectOptions: Explorer.SelectOption[] = [
    {
      name: "Hours",
      key: "hours",
    },
    {
      name: "Days",
      key: "days",
    },
    {
      name: "Weeks",
      key: "weeks",
    },
    {
      name: "Months",
      key: "months",
    },
  ];

  const [fromBlock, setFromBlock] = useState<number | undefined>(undefined);
  const [toBlock, setToBlock] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(config.firstBlockTime)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now()));
  const [lastBlocksValue, setLastBlocksValue] = useState<number>(
    DEFAULT_LAST_BLOCK_VALUE
  );
  const [lastTimeUnitValue, setLastTimeUnitValue] = useState<number>(
    DEFAULT_LAST_TIME_UNIT_VALUE
  );
  const [rangeSelectKey, setRangeSelectKey] =
    useState<string>(defaultSelectKey);
  const [timeUnitSelectKey, setTimeUnitSelectKey] = useState<string>(
    DEFAULT_TIME_UNIT_SELECT_KEY
  );

  const { checkTemporaryHeadBlockNumber } = useHeadBlockNumber();

  const setRangesValues = (params: Explorer.CommentSearchParams) => {
    if (!params) return;

    params.fromBlock && setFromBlock(params.fromBlock);
    params.toBlock && setToBlock(params.toBlock);
    params.startDate && setStartDate(params.startDate);
    params.endDate && setEndDate(params.endDate);
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
    return {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    };
  };

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

export default useSearchRanges;
