import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Matcher } from "react-day-picker";
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
  disableFutureDates?: boolean;
  lastDate?: Date;
  firstDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  setDate,
  side,
  disableFutureDates = true,
  lastDate,
  firstDate,
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
    )} UTC`;
  };

  const disableFuture: Matcher | Matcher[] | undefined | any = (date: Date) => {
    if (disableFutureDates) {
      if (firstDate) {
        return date < firstDate || date < new Date("1900-01-01");
      }
      if (lastDate) {
        return date > lastDate || date < new Date("1900-01-01");
      }
      return date > new Date() || date < new Date("1900-01-01");
    }
  };
  return (
    <Popover>
      <PopoverTrigger
        asChild
        className="z-10 border-0 border-b-2"
      >
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-auto",
            !date && "text-muted-foreground"
          )}
          data-testid="datepicker-trigger"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? displayDate(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-auto p-0 text-text bg-theme"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          data-testid="datepicker-calender"
          disabled={disableFuture}
        />
        <div className="flex justify-center items-center mb-4">
          <TimePicker
            date={date}
            onSelect={handleSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
