import React from "react";
import Explorer from "@/types/Explorer";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { SearchRangesResult } from "./useSearchRanges";


interface SearchRangesProps {
  rangesProps: SearchRangesResult;
}

const SearchRanges: React.FC<SearchRangesProps> = ({
  rangesProps
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
    setLastTimeUnitValue
  } = rangesProps

  const setNumericValue = (value: number, fieldSetter: Function) => {
    if (value === 0) {
      fieldSetter(undefined);
    } else {
      fieldSetter(value);
    }
  }

  return (
    <div className="m-2 my-4 border-y border-solid border-gray-600">
        <Select onValueChange={setRangeSelectKey}>
          <SelectTrigger className="mt-2">
            {rangeSelectOptions.find((selectOption) => selectOption.key === rangeSelectKey)?.name}
          </SelectTrigger>
          <SelectContent className="bg-white text-black rounded-[2px] max-h-[31rem]">
            {rangeSelectOptions.map((selectOption, index) => (
              <SelectItem                          
                className="m-1 text-center"
                key={index}
                value={selectOption.key}
                defaultChecked={false}
              >
                {selectOption.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {
          rangeSelectKey === "lastBlocks" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <Input
                  type="number"
                  value={lastBlocksValue || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setLastBlocksValue)
                  }
                  placeholder={"Last"}
                />
              </div>
            </div>
        }
        {
          rangeSelectKey === "lastTime" &&
          <>
            <div className="flex items-center justify-center  my-2">
              <div className="flex flex-col w-full ">
                <Input
                  type="number"
                  value={lastTimeUnitValue || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setLastTimeUnitValue)
                  }
                  placeholder={"Last"}
                />
              </div>
              <Select onValueChange={setTimeUnitSelectKey}>
                <SelectTrigger>
                  {timeSelectOptions.find((selectOption) => selectOption.key === timeUnitSelectKey)?.name}
                </SelectTrigger>
                <SelectContent className="bg-white text-black rounded-[2px] max-h-[31rem]">
                  {timeSelectOptions.map((selectOption, index) => (
                    <SelectItem                          
                      className="m-1 text-center"
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
        }
        {
          rangeSelectKey === "blockRange" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <label className="mx-2">From block</label>
                <Input
                  type="number"
                  value={fromBlock || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setFromBlock)
                  }
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="mx-2">To block</label>
                <Input
                  type="number"
                  value={toBlock || ""}
                  onChange={(e) =>
                    setNumericValue(Number(e.target.value), setToBlock)
                  }
                  placeholder={"Headblock"}
                />
              </div>
            </div>
        }
        {
          rangeSelectKey === "timeRange" &&
            <div className="flex items-center  my-2">
              <div className="flex flex-col w-full">
                <label className="mx-2">From date</label>
                <DateTimePicker 
                  value={startDate} 
                  onChange={(date) => setStartDate(date!)}
                  className="text-white  border"
                  calendarClassName="text-gray-800"
                  format="yyyy/MM/dd HH:mm:ss"
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                  showLeadingZeros={false}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="mx-2">To date</label>
                <DateTimePicker 
                  value={endDate} 
                  onChange={(date) => setEndDate(date!)}
                  className="text-white ml-2 border"
                  calendarClassName="text-gray-800"
                  format="yyyy/MM/dd HH:mm:ss"
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                  showLeadingZeros={false}
                />
              </div>
            </div>
        }

      </div>
    )
}

export default SearchRanges