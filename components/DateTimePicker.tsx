import * as React from "react";
import { DateTime } from "luxon";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { SelectSingleEventHandler } from "react-day-picker";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useDebounce } from "@/utils/Hooks";

interface DateTimePickerProps {
  date: Date | any;
  setDate: (date: Date) => void;
  side?: "left" | "top" | "right" | "bottom" | undefined;
}

const DateTimePicker = ({ date, setDate, side }: DateTimePickerProps) => {
  const [selectedDateTime, setSelectedDateTime] = React.useState<any>(
    DateTime.fromJSDate(date)
  );

  const handleSelect: SelectSingleEventHandler = (day, selected) => {
    const selectedDay = DateTime.fromJSDate(selected);
    const modifiedDay = selectedDay.set({
      hour: selectedDateTime.hour,
      minute: selectedDateTime.minute,
    });

    setSelectedDateTime(modifiedDay);
    setDate(modifiedDay.toJSDate());
  };

  const debounceDateChange = useDebounce((value: any) => setDate(value), 1000);

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    const hours = Number.parseInt(value.split(":")[0] || "00", 10);
    const minutes = Number.parseInt(value.split(":")[1] || "00", 10);
    const modifiedDay = selectedDateTime.set({ hour: hours, minute: minutes });

    setSelectedDateTime(modifiedDay);
    debounceDateChange(modifiedDay.toJSDate());
  };

  const footer = (
    <>
      <div className="px-4 pt-0 pb-4">
        <Label>Time</Label>
        <Input
          type="time"
          onChange={handleTimeChange}
          value={selectedDateTime.toFormat("HH:mm")}
          pattern="[0-9]+([\.][0-9]{1,2})?"
        />
      </div>
      {!selectedDateTime && <p>Please pick a day.</p>}
    </>
  );

  return (
    <Popover>
      <PopoverTrigger
        asChild
        className="z-10"
      >
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            selectedDateTime.toFormat("DDD HH:mm")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-auto p-0 text-white bg-explorer-dark-gray"
      >
        <Calendar
          mode="single"
          selected={selectedDateTime.toFormat("DDD HH:mm")}
          onSelect={handleSelect}
          initialFocus
        />
        {footer}
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePicker;
