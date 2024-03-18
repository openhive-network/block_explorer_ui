import { cn } from "@/lib/utils";
import { useOnClickOutside } from "@/utils/Hooks";
import { numberToTimeString } from "@/utils/StringUtils";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface TimePickerProps {
  date: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

interface TimeInputProps {
  max?: number;
  min?: number;
  initialValue?: string;
  onChange: (value: number) => void;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  max = 59,
  min = 0,
  initialValue,
  onChange,
  className,
}) => {
  const [value, setValue] = useState(initialValue ?? "00");

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!/\D/.test(e.target.value)) {
      let v = Number(e.target.value);
      onChange(v);
      if (max && Number(e.target.value) > max) {
        v = max;
      }
      if (min && Number(e.target.value) < min) {
        v = min;
      }
      setValue(numberToTimeString(v));
    }
  };

  return (
    <input
      value={value}
      onChange={handleValueChange}
      className={cn(
        "outline-none bg-explorer-dark-gray text-white w-5 mx-1",
        className
      )}
    />
  );
};

const TimePicker: React.FC<TimePickerProps> = ({
  date,
  onSelect,
  className,
}) => {
  const [hours, setHours] = useState(date.getUTCHours());
  const [minutes, setMinutes] = useState(date.getUTCMinutes());
  const [seconds, setSeconds] = useState(date.getUTCSeconds());
  const timePickerRef = useRef(null);

  useOnClickOutside(timePickerRef, () => handleTimeSelect());

  const handleTimeSelect = () => {
    if (
      hours !== date.getUTCHours() ||
      minutes !== date.getUTCMinutes() ||
      seconds !== date.getUTCSeconds()
    ) {
      let newDate = date;
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(seconds);
      onSelect(new Date(newDate.toString() + "z"));
    }
  };

  return (
    <section
      className={cn("flex border border-white w-fit", className)}
      ref={timePickerRef}
    >
      <TimeInput
        className="text-right"
        max={23}
        initialValue={numberToTimeString(hours)}
        onChange={setHours}
      />
      {" : "}
      <TimeInput
        className="text-right"
        initialValue={numberToTimeString(minutes)}
        onChange={setMinutes}
      />
      {" : "}
      <TimeInput
        initialValue={numberToTimeString(seconds)}
        onChange={setSeconds}
      />
    </section>
  );
};

export default TimePicker;
