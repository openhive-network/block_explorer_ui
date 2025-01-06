import React, { useEffect , useState } from "react";
import moment from "moment";

import { SearchRangesResult } from "../../hooks/common/useSearchRanges";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import DateTimePicker from "../DateTimePicker";
import ErrorMessage from "../ErrorMessage";// Import the ErrorMessage component

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

  // Validate and update numeric values
  const handleNumericInput = (
    value: string,
    fieldSetter: Function,
    allowDecimal: boolean = false
  ) => {
    // If decimals are allowed, preserve the decimal point in the input value
    let cleanedValue = allowDecimal
      ? value.replace(/[^0-9.]/g, "") // Allow numbers and decimal point
      : value.replace(/[^0-9]/g, ""); // Only allow numbers

   // If the decimal is allowed, ensure there is only one decimal point
    if (allowDecimal && cleanedValue.split(".").length > 2) {
      // Remove extra decimals, keeping only the first one
      cleanedValue = cleanedValue.slice(0, cleanedValue.indexOf(".") + 1) + 
      cleanedValue.split(".").slice(1).join(""); // Remove all decimals after the first one
    }

    // Limit the value to a maximum of 15 digits
    if (cleanedValue.length > 15) {
      cleanedValue = cleanedValue.slice(0, 15);
    }

    // If the cleaned value is empty, set it to undefined
    if (cleanedValue === "") {
      fieldSetter(undefined);
    } else {
      fieldSetter(cleanedValue); // Invalid input, set to undefined
    }
  };

  useEffect(() => {
    if (
      moment(startDate).isSame(endDate) ||
      moment(startDate).isAfter(endDate)
    ) {
      setStartDate(moment(startDate).subtract(1, "hours").toDate());
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const [blockRangeError, setBlockRangeError] = useState<string | null>(null); // Error state for block range validation

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
              value={lastBlocksValue || ""}
              onChange={(e) =>
                handleNumericInput(e.target.value,setLastBlocksValue)
              }
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
                value={lastTimeUnitValue || ""}
                onChange={(e) =>
                  handleNumericInput(e.target.value,setLastTimeUnitValue,true)
                }
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
              value={fromBlock || ""}
              onChange={(e) =>
                handleNumericInput(e.target.value,setFromBlock)
              }
              placeholder="From"
            />
          </div>
          <div className="flex flex-col w-full">
            <Input
              className="bg-theme border-0 border-b-2"
              data-testid="headblock-number"
              type="text"
              value={toBlock || ""}
              onChange={(e) =>
                handleNumericInput(e.target.value, setToBlock)
              }
              placeholder={"To"}
              onBlur={() => {
                if (
                  Number(toBlock) &&
                  Number(fromBlock) &&
                  !isNaN(Number(toBlock)) &&
                  !isNaN(Number(fromBlock)) &&
                  Number(toBlock) < Number(fromBlock)
                ) {
                  setBlockRangeError(
                    "To block must be greater than From block"
                  );
                  setToBlock(undefined); // Clear the 'toBlock' field
                } else if (Number(toBlock) <= 0 && Number(fromBlock)) {
                  setBlockRangeError(
                    "To block must be greater than From block"
                  );
                  setToBlock(undefined); // Clear the 'toBlock' field
                } else {
                  setBlockRangeError(null); // Clear the error message immediately if 'toBlock' is valid
                }
              }}
            />
          </div>
        </div>
      )}
      {blockRangeError && (
        <ErrorMessage
          message={blockRangeError}
          onClose={() => setBlockRangeError(null)} // Close the error message
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
