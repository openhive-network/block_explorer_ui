import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

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

const displayDateUTC = (d: Date) =>
  `${d.getUTCFullYear()}/${numberToTimeString(
    d.getUTCMonth() + 1
  )}/${numberToTimeString(d.getUTCDate())} ` +
  `${numberToTimeString(d.getUTCHours())}:${numberToTimeString(
    d.getUTCMinutes()
  )}:${numberToTimeString(d.getUTCSeconds())} UTC`;

const normalizeUTCMidnight = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  setDate,
  side,
  disableFutureDates = true,
  lastDate,
  firstDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isValidDate = (d: Date) => {
    const nd = normalizeUTCMidnight(d);
    if (disableFutureDates) {
      if (firstDate) {
        return (
          nd >= normalizeUTCMidnight(firstDate) &&
          nd <= normalizeUTCMidnight(new Date())
        );
      }
      if (lastDate) {
        return nd <= normalizeUTCMidnight(lastDate);
      }
      return nd <= normalizeUTCMidnight(new Date());
    }
    return true;
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={() => setIsOpen((o) => !o)}
    >
      <PopoverTrigger
        asChild
        className="z-10 border-0 border-b-2"
      >
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-auto cursor-pointer",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? displayDateUTC(date) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        className="w-auto p-0 text-text bg-theme"
      >
        <CustomDateTimePicker
          value={date}
          onChange={setDate}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          isValidDate={isValidDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
