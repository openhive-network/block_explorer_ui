import React from "react";

import { SearchRangesResult } from "../../hooks/common/useSearchRanges";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
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
    <div className="py-2 flex flex-col gap-y-2">
      <Select
        onValueChange={setRangeSelectKey}
        value={rangeSelectKey}
      >
        <SelectTrigger className="w-1/2 border-0 border-b-2 bg-theme text-text">
          {
            rangeSelectOptions.find(
              (selectOption) => selectOption.key === rangeSelectKey
            )?.name
          }
        </SelectTrigger>
        <SelectContent className="bg-theme text-text rounded-sm max-h-[31rem]">
          {rangeSelectOptions.map((selectOption, index) => (
            <SelectItem
              className="text-center"
              key={index}
              value={selectOption.key}
              defaultChecked={false}
              data-testid="search-select-option"
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
              className="w-1/2 border-0 border-b-2 bg-theme"
              type="number"
              value={lastBlocksValue || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setLastBlocksValue)
              }
              placeholder={"Last"}
              min="0"
            />
          </div>
        </div>
      )}
      {rangeSelectKey === "lastTime" && (
        <>
          <div className="flex items-center justify-center">
            <div className="flex flex-col w-full mr-2">
              <Input
                type="number"
                className="bg-theme border-0 border-b-2 text-text"
                value={lastTimeUnitValue || ""}
                onChange={(e) =>
                  setNumericValue(Number(e.target.value), setLastTimeUnitValue)
                }
                placeholder={"Last"}
                min="0"
              />
            </div>
            <Select onValueChange={setTimeUnitSelectKey}>
              <SelectTrigger className="pl-2 bg-theme border-0 border-b-2 text-text">
                {
                  timeSelectOptions.find(
                    (selectOption) => selectOption.key === timeUnitSelectKey
                  )?.name
                }
              </SelectTrigger>
              <SelectContent
                className="bg-theme text-text rounded-sm max-h-[31rem]"
                data-testid="select-time-option-units"
              >
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
          <div className="flex flex-col w-full mr-2">
            <Input
              type="number"
              className="bg-theme border-0 border-b-2"
              data-testid="from-block-input"
              value={fromBlock || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setFromBlock)
              }
              placeholder="From"
              min="0"
            />
          </div>
          <div className="flex flex-col w-full">
            <Input
              className="bg-theme border-0 border-b-2"
              data-testid="headblock-number"
              type="number"
              value={toBlock || ""}
              onChange={(e) =>
                setNumericValue(Number(e.target.value), setToBlock)
              }
              placeholder={"To"}
              min={0}
            />
          </div>
        </div>
      )}
      {rangeSelectKey === "timeRange" && (
        <div className="flex flex-col mt-5">
          <div className="flex flex-col w-full mb-4">
            <label className="ml-2 my-2">From date</label>
            <DateTimePicker
              date={startDate || new Date()}
              setDate={setStartDate}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="ml-2 mb-2">To date</label>
            <DateTimePicker
              date={endDate || new Date()}
              setDate={setEndDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRanges;
