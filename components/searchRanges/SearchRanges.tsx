import React from "react";
import Explorer from "@/types/Explorer";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { SearchRangesResult } from "./useSearchRanges";
import { cn } from "@/lib/utils";
import DateTimePicker from "../DateTimePicker";

interface SearchRangesProps {
  rangesProps: SearchRangesResult;
  safeTimeRangeDisplay?: boolean;
}

const SearchRanges: React.FC<SearchRangesProps> = ({
  rangesProps,
  safeTimeRangeDisplay,
}) => {
  const {
    rangeSelectOptions,
    timeSelectOptions,
    rangeSelectKey,
    timeUnitSelectKey,
    toBlock,
    fromBlock,
    startDate,
    endDate,
    lastBlocksValue,
    lastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
    setLastTimeUnitValue,
  } = rangesProps;

  const setNumericValue = (value: number, fieldSetter: Function) => {
    if (value === 0) {
      fieldSetter(undefined);
    } else {
      fieldSetter(value);
    }
  };

  return (
    <div className="border-y border-solid border-gray-600 py-2 flex flex-col gap-y-2">
      <Select onValueChange={setRangeSelectKey} value={rangeSelectKey}>
        <SelectTrigger className="bg-gray-700">
          {
            rangeSelectOptions.find(
              (selectOption) => selectOption.key === rangeSelectKey
            )?.name
          }
        </SelectTrigger>
        <SelectContent className="bg-white text-black rounded-sm max-h-[31rem]">
          {rangeSelectOptions.map((selectOption, index) => (
            <SelectItem
              className="text-center"
              key={index}
              value={selectOption.key}
              defaultChecked={false}
            >
              {selectOption.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {rangeSelectKey === "lastBlocks" && (
        <div className="flex items-center">
          <div className="flex flex-col w-full">
            <Input
              className="bg-gray-700"
              type="number"
              value={lastBlocksValue || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setLastBlocksValue)
              }
              placeholder={"Last"}
            />
          </div>
        </div>
      )}
      {rangeSelectKey === "lastTime" && (
        <>
          <div className="flex items-center justify-center">
            <div className="flex flex-col w-full ">
              <Input
                type="number"
                className="bg-gray-700"
                value={lastTimeUnitValue || ""}
                onChange={(e) =>
                  setNumericValue(Number(e.target.value), setLastTimeUnitValue)
                }
                placeholder={"Last"}
              />
            </div>
            <Select onValueChange={setTimeUnitSelectKey}>
              <SelectTrigger className="bg-gray-700">
                {
                  timeSelectOptions.find(
                    (selectOption) => selectOption.key === timeUnitSelectKey
                  )?.name
                }
              </SelectTrigger>
              <SelectContent className="bg-white text-black rounded-sm max-h-[31rem]">
                {timeSelectOptions.map((selectOption, index) => (
                  <SelectItem
                    className="text-center"
                    key={index}
                    value={selectOption.key}
                    defaultChecked={false}
                  >
                    {selectOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {rangeSelectKey === "blockRange" && (
        <div className="flex items-center">
          <div className="flex flex-col w-full">
            <label className="ml-2">From block</label>
            <Input
              type="number"
              className="bg-gray-700"
              value={fromBlock || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setFromBlock)
              }
              placeholder="1"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="ml-2">To block</label>
            <Input
              className="bg-gray-700"
              data-testid="headblock-number"
              type="number"
              value={toBlock || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setToBlock)
              }
              placeholder={"Headblock"}
            />
          </div>
        </div>
      )}
      {rangeSelectKey === "timeRange" && (
        <div className="flex items-center flex-wrap">
          <div className="flex flex-col w-full">
            <label className="ml-2">From date</label>
            <DateTimePicker
              date={startDate || new Date()}
              setDate={setStartDate}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="ml-2">To date</label>
            <DateTimePicker date={endDate || new Date()} setDate={setEndDate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRanges;
