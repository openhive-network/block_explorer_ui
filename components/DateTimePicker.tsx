import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import TimePicker from "./TimePicker";
import { numberToTimeString } from "@/utils/StringUtils";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  side?: "left" | "top" | "right" | "bottom";
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  setDate,
  side,
}) => {
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(new Date(date));
    }
  };

  const displayDate = (date: Date) => {
    return `${date.toDateString()} ${numberToTimeString(
      date.getUTCHours()
    )}:${numberToTimeString(date.getUTCMinutes())}:${numberToTimeString(
      date.getUTCSeconds()
    )}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild className="z-10">
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? displayDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-auto p-0 text-white bg-explorer-dark-gray"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="flex justify-center items-center mb-4">
          <TimePicker date={date} onSelect={handleSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
