import React, { useEffect, useState } from "react";
import moment from "moment";

import { SearchRangesResult } from "../../hooks/common/useSearchRanges";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import DateTimePicker from "../DateTimePicker";
import ErrorMessage from "../ErrorMessage"; // Import the ErrorMessage component
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

  const [rangeError, setRangeError] = useState<string | null>(null);

  const handleOnBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    fieldSetter: Function,
    validateField: Function | null
  ) => {
    const value = e.target.value;
    const numericValue = value ? Number(value) : undefined;

    // Fetch the latest block number dynamically
    let validated = true;
    if (validateField) {
      validated = validateField(e, numericValue);
    }

    validated ? fieldSetter(numericValue) : fieldSetter(null);
  };

  const validateToBlock = (
    e: React.FocusEvent<HTMLInputElement>,
    value: number | undefined
  ) => {
    if (value !== undefined && value <= 0) {
      setRangeError("Block Number must be a positive number");
      e.target.value = "";
      return false;
    }
    if (value && fromBlock && !isNaN(value) && value < fromBlock) {
      setRangeError("To block must be greater than From block");
      e.target.value = "";
      return false;
    }
    return true;
  };

  const validateFromBlock = (
    e: React.FocusEvent<HTMLInputElement>,
    value: number | undefined
  ) => {
    if (value !== undefined && value <= 0) {
      setRangeError("Block Number must be a positive number");
      e.target.value = "";
      return false;
    }
    if (value && toBlock && !isNaN(value) && value > toBlock) {
      setRangeError("From block must be less than To block");
      e.target.value = "";
      return false;
    }
    return true;
  };

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    allowDecimal: boolean = false
  ) => {
    let cleanedValue = e.target.value;

    // Clean the value based on the logic
    cleanedValue = allowDecimal
      ? cleanedValue.replace(/[^0-9.]/g, "") // Allow numbers and decimal point
      : cleanedValue.replace(/[^0-9]/g, ""); // Only allow numbers

    if (allowDecimal && cleanedValue.split(".").length > 2) {
      cleanedValue =
        cleanedValue.slice(0, cleanedValue.indexOf(".") + 1) +
        cleanedValue.split(".").slice(1).join(""); // Remove extra decimals
    }

    if (cleanedValue.length > 15) {
      cleanedValue = cleanedValue.slice(0, 15); // Limit to 15 digits
    }

    e.target.value = cleanedValue;
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
              type="text" // Use type="text" to allow custom validation
              defaultValue={lastBlocksValue || ""}
              onChange={(e) => handleNumericInput(e)}
              onBlur={(e) => handleOnBlur(e, setLastBlocksValue, null)}
              placeholder={"Last"}
            />
          </div>
        </div>
      )}

      {rangeSelectKey === "lastTime" && (
        <>
          <div className="flex items-center justify-center">
            <div className="flex flex-col w-full mr-2">
              <Input
                type="text"
                className="bg-theme border-0 border-b-2 text-text"
                defaultValue={lastTimeUnitValue || ""}
                onChange={(e) => handleNumericInput(e, true)}
                onBlur={(e) => handleOnBlur(e, setLastTimeUnitValue, null)}
                placeholder={"Last"}
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
              type="text"
              className="bg-theme border-0 border-b-2"
              data-testid="from-block-input"
              defaultValue={fromBlock || ""}
              onChange={(e) => handleNumericInput(e)}
              onBlur={(e) => handleOnBlur(e, setFromBlock, validateFromBlock)}
              placeholder="From"
            />
          </div>
          <div className="flex flex-col w-full">
            <Input
              className="bg-theme border-0 border-b-2"
              data-testid="headblock-number"
              type="text"
              defaultValue={toBlock || ""}
              onChange={(e) => handleNumericInput(e)}
              placeholder={"To"}
              onBlur={(e) => handleOnBlur(e, setToBlock, validateToBlock)}
            />
          </div>
        </div>
      )}
      {rangeError && (
        <ErrorMessage
          message={rangeError}
          onClose={() => setRangeError(null)} // Close the error message
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
