import { useState } from "react";
import { config } from "@/Config"; 
import useHeadBlockNumber from "@/api/common/useHeadBlockNum";
import moment from "moment";
import Explorer from "@/types/Explorer";

const DEFAULT_LAST_BLOCK_VALUE = 1000;

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
}

const useSearchRanges = () => {
  const rangeSelectOptions: Explorer.SelectOption[] = [
    {
      name: "Last blocks",
      key: "lastBlocks"
    },
    {
      name: "Last days/weeks/months",
      key: "lastTime"
    },
    {
      name: "Block range",
      key: "blockRange"
    },
    {
      name: "Time range",
      key: "timeRange"
    },
    {
      name: "---",
      key: "none"
    }
  ];
  
  const timeSelectOptions: Explorer.SelectOption[] = [
    {
      name: "Days",
      key: "days"
    },
    {
      name: "Weeks",
      key: "weeks"
    },
    {
      name: "Months",
      key: "months"
    }
  ]

  const [fromBlock, setFromBlock] = useState<number | undefined>(undefined);
  const [toBlock, setToBlock] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(config.firstBlockTime));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date (Date.now()));
  const [lastBlocksValue, setLastBlocksValue] = useState<number | undefined>(DEFAULT_LAST_BLOCK_VALUE);
  const [lastTimeUnitValue, setLastTimeUnitValue] = useState<number | undefined>(undefined);
  const [rangeSelectKey, setRangeSelectKey] = useState<string>("lastBlocks");
  const [timeUnitSelectKey, setTimeUnitSelectKey] = useState<string>("days");

  const {checkTemporaryHeadBlockNumber} = useHeadBlockNumber();

  const getRangesValues = async () => {
    let payloadFromBlock: number | undefined = rangeSelectKey === "blockRange" ? fromBlock : undefined;
    let payloadToBlock: number | undefined = rangeSelectKey === "blockRange" ? toBlock : undefined;
    let payloadStartDate: Date | undefined = rangeSelectKey === "timeRange" ? startDate : undefined;
    let payloadEndDate: Date | undefined = rangeSelectKey === "timeRange" ? endDate : undefined;
    if (lastBlocksValue && rangeSelectKey === "lastBlocks") {
      const currentHeadBlockNumber = await checkTemporaryHeadBlockNumber();
      payloadFromBlock = Number(currentHeadBlockNumber) - lastBlocksValue;
      if (payloadFromBlock <= 0 ) {
        payloadFromBlock = undefined;
      }
    }
    if (lastTimeUnitValue && rangeSelectKey === "lastTime") {
      const typedTimeUnit = timeUnitSelectKey as "days" | "weeks" | "months";
      payloadStartDate = moment().subtract(lastTimeUnitValue, typedTimeUnit).milliseconds(0).toDate();
    }
    return {
      payloadFromBlock, 
      payloadToBlock,
      payloadStartDate,
      payloadEndDate
    }
  }

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
    getRangesValues
  } as SearchRangesResult;
}

export default useSearchRanges;