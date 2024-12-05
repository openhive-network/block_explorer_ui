import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import moment from "moment";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { numberToTimeString } from "@/utils/StringUtils";
import CustomDateTimePicker from "./customDateTime/CustomDateTImePicker";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  side?: "left" | "top" | "right" | "bottom";
  disableFutureDates?: boolean;
  lastDate?: Date;
  firstDate?: Date;
}

const displayDate = (d: Date) => {
  return `${d.toDateString()} ${numberToTimeString(
    d.getUTCHours()
  )}:${numberToTimeString(d.getUTCMinutes())}:${numberToTimeString(
    d.getUTCSeconds()
  )} UTC`;
};

const normalizeToMidnight = (d: Date) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  setDate,
  side,
  disableFutureDates = true,
  lastDate,
  firstDate,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const handleSelect = (d: Date | undefined) => {
    if (d) {
      setDate(moment(d).toDate());
    }
  };

  const isValidDate = (d: Date) => {
    const nd = normalizeToMidnight(d);

    if (disableFutureDates) {
      if (firstDate) {
        const nf = normalizeToMidnight(firstDate);
        const now = normalizeToMidnight(new Date());
        return nd >= nf && nd <= now;
      }
      if (lastDate) {
        const nl = normalizeToMidnight(lastDate);
        return nd <= nl;
      }
      return nd < new Date();
    }

    return true;
  };

  const handleCloseDateTimePicker = () => {
    setIsCalendarOpen(false);
  };

  return (
    <Popover
      open={isCalendarOpen}
      onOpenChange={() => setIsCalendarOpen(!isCalendarOpen)}
    >
      <PopoverTrigger
        asChild
        className="z-10 border-0 border-b-2"
      >
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-auto cursor-pointer",
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
        <CustomDateTimePicker
          value={date}
          onChange={handleSelect}
          open={isCalendarOpen}
          onClose={handleCloseDateTimePicker}
          isValidDate={isValidDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
