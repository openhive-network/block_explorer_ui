import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import moment from "moment";
import { SearchRangesResult } from "../../hooks/common/useSearchRanges";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import DateTimePicker from "../DateTimePicker";
import ErrorMessage from "../ErrorMessage";

interface SearchRangesProps {
  rangesProps: SearchRangesResult;
  setIsSearchButtonDisabled: Dispatch<SetStateAction<boolean>>;
  safeTimeRangeDisplay?: boolean;
}

export const isSearchButtonDisabled = (
  rangeSelectKey: string,
  localLastBlocks: string,
  localLastTimeUnit: string,
  localFromBlock: string
) => {
  if (rangeSelectKey === "lastTime") {
    return Boolean(!localLastTimeUnit);
  }
  if (rangeSelectKey === "lastBlocks") {
    return Boolean(!localLastBlocks);
  }
  if (rangeSelectKey === "blockRange") {
    return Boolean(!localFromBlock);
  }
  return false;
};

const SearchRanges: React.FC<SearchRangesProps> = ({
  rangesProps,
  setIsSearchButtonDisabled,
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

  const [rangeError, setRangeError] = useState<string | null>(null);

  const [localLastBlocks, setLocalLastBlocks] = useState(
    lastBlocksValue !== undefined ? String(lastBlocksValue) : ""
  );
  const [localLastTimeUnit, setLocalLastTimeUnit] = useState(
    lastTimeUnitValue !== undefined ? String(lastTimeUnitValue) : ""
  );
  const [localFromBlock, setLocalFromBlock] = useState(
    fromBlock !== undefined ? String(fromBlock) : ""
  );
  const [localToBlock, setLocalToBlock] = useState(
    toBlock !== undefined ? String(toBlock) : ""
  );

  useEffect(() => {
    setLocalLastBlocks(
      lastBlocksValue !== undefined ? String(lastBlocksValue) : ""
    );
    setLocalLastTimeUnit(
      lastTimeUnitValue !== undefined ? String(lastTimeUnitValue) : ""
    );
    setLocalFromBlock(fromBlock !== undefined ? String(fromBlock) : "");
    setLocalToBlock(toBlock !== undefined ? String(toBlock) : "");
  }, [lastBlocksValue, lastTimeUnitValue, fromBlock, toBlock]);

  const sanitizeNumericInput = (value: string, allowDecimal = false) => {
    let cleaned = allowDecimal
      ? value.replace(/[^0-9.]/g, "")
      : value.replace(/[^0-9]/g, "");

    if (allowDecimal && cleaned.split(".").length > 2) {
      const parts = cleaned.split(".");
      cleaned = parts.shift() + "." + parts.join("");
    }

    if (cleaned.length > 15) {
      cleaned = cleaned.slice(0, 15);
    }
    return cleaned;
  };

  const validateFromBlock = (numVal: number | undefined) => {
    if (numVal !== undefined && numVal <= 0) {
      setRangeError("Block Number must be a positive number");
      return false;
    }
    if (numVal && toBlock && !isNaN(numVal) && numVal > toBlock) {
      setRangeError("From block must be less than To block");
      return false;
    }
    return true;
  };

  const validateToBlock = (numVal: number | undefined) => {
    if (numVal !== undefined && numVal <= 0) {
      setRangeError("Block Number must be a positive number");
      return false;
    }
    if (numVal && fromBlock && !isNaN(numVal) && numVal < fromBlock) {
      setRangeError("To block must be greater than From block");
      return false;
    }
    return true;
  };

  const handleLastBlocksBlur = () => {
    const val = localLastBlocks ? Number(localLastBlocks) : undefined;
    setLastBlocksValue(val);
    setRangeError(null);
  };

  const handleLastTimeUnitBlur = () => {
    const val = localLastTimeUnit ? Number(localLastTimeUnit) : undefined;
    setLastTimeUnitValue(val);
    setRangeError(null);
  };

  const handleFromBlockBlur = () => {
    const val = localFromBlock ? Number(localFromBlock) : undefined;
    if (!validateFromBlock(val)) {
      setFromBlock(undefined);
      return;
    }
    setFromBlock(val);
    setRangeError(null);
  };

  const handleToBlockBlur = () => {
    const val = localToBlock ? Number(localToBlock) : undefined;
    if (!validateToBlock(val)) {
      setToBlock(undefined);
      return;
    }
    setToBlock(val);
    setRangeError(null);
  };

  useEffect(() => {
    if (
      moment(startDate).isSame(endDate) ||
      moment(startDate).isAfter(endDate)
    ) {
      setStartDate(moment(startDate).subtract(1, "hours").toDate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Disable `Search` button if value field is empty
  useEffect(() => {
    const isDisabled = isSearchButtonDisabled(
      rangeSelectKey,
      localLastBlocks,
      localLastTimeUnit,
      localFromBlock
    );
    setIsSearchButtonDisabled(isDisabled);
  }, [
    rangeSelectKey,
    localLastTimeUnit,
    localLastBlocks,
    localFromBlock,
    localToBlock,
  ]);

  return (
    <div className="py-2 flex flex-col gap-y-2">
      <Select
        onValueChange={setRangeSelectKey}
        value={rangeSelectKey}
      >
        <SelectTrigger className="w-1/2 border-0 border-b-2 bg-theme text-text">
          {rangeSelectOptions.find((opt) => opt.key === rangeSelectKey)?.name}
        </SelectTrigger>
        <SelectContent className="bg-theme text-text rounded-sm max-h-[31rem]">
          {rangeSelectOptions.map((option, idx) => (
            <SelectItem
              className="text-center"
              key={idx}
              value={option.key}
              data-testid="search-select-option"
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {rangeSelectKey === "lastBlocks" && (
        <div className="flex items-center">
          <Input
            required
            className="w-1/2 border-0 border-b-2 bg-theme"
            type="text"
            value={localLastBlocks}
            onChange={(e) =>
              setLocalLastBlocks(sanitizeNumericInput(e.target.value))
            }
            onBlur={handleLastBlocksBlur}
            placeholder="Last *"
          />
        </div>
      )}

      {rangeSelectKey === "lastTime" && (
        <div className="flex items-center justify-center">
          <Input
            required
            type="text"
            className="bg-theme border-0 border-b-2 text-text mr-2"
            value={localLastTimeUnit}
            onChange={(e) =>
              setLocalLastTimeUnit(sanitizeNumericInput(e.target.value, true))
            }
            onBlur={handleLastTimeUnitBlur}
            placeholder="Last *"
          />
          <Select
            onValueChange={setTimeUnitSelectKey}
            value={timeUnitSelectKey}
          >
            <SelectTrigger className="pl-2 bg-theme border-0 border-b-2 text-text">
              {
                timeSelectOptions.find((opt) => opt.key === timeUnitSelectKey)
                  ?.name
              }
            </SelectTrigger>
            <SelectContent className="bg-theme text-text rounded-sm max-h-[31rem]">
              {timeSelectOptions.map((option, index) => (
                <SelectItem
                  className="text-center"
                  key={index}
                  value={option.key}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {rangeSelectKey === "blockRange" && (
        <div className="flex items-center">
          <div className="mr-2 w-full">
            <Input
              required
              type="text"
              className="bg-theme border-0 border-b-2"
              data-testid="from-block-input"
              value={localFromBlock}
              onChange={(e) =>
                setLocalFromBlock(sanitizeNumericInput(e.target.value))
              }
              onBlur={handleFromBlockBlur}
              placeholder="From *"
            />
          </div>
          <div className="w-full">
            <Input
              className="bg-theme border-0 border-b-2"
              data-testid="headblock-number"
              type="text"
              value={localToBlock}
              onChange={(e) =>
                setLocalToBlock(sanitizeNumericInput(e.target.value))
              }
              onBlur={handleToBlockBlur}
              placeholder="To"
            />
          </div>
        </div>
      )}

      {rangeError && (
        <ErrorMessage
          message={rangeError}
          onClose={() => setRangeError(null)}
          timeout={3000}
        />
      )}

      {rangeSelectKey === "timeRange" && (
        <div className="flex flex-col mt-5">
          <div className="flex flex-col w-full mb-4">
            <label className="ml-2 my-2">From date</label>
            <DateTimePicker
              date={startDate ?? new Date()}
              setDate={setStartDate}
              lastDate={endDate}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="ml-2 mb-2">To date</label>
            <DateTimePicker
              date={endDate ?? new Date()}
              setDate={setEndDate}
              firstDate={startDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchRanges;
