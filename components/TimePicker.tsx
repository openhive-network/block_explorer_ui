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
  value: number;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  className?: string;
}

const S_INTERVAL = 3;

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  max = 59,
  min = 0,
  onChange,
  className,
}) => {
  const [currentValue, setCurrentValue] = useState(numberToTimeString(value));

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
      setCurrentValue(numberToTimeString(v));
    }
  };

  useEffect(() => {
    setCurrentValue(numberToTimeString(value));
  }, [value]);

  return (
    <input
      value={currentValue}
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

  useEffect(() => {
    const incrementSeconds = (interval: number) => {
      let newTime = new Date();
      newTime.setHours(hours);
      newTime.setMinutes(minutes);
      newTime.setSeconds(seconds + interval);
      setHours(newTime.getHours());
      setMinutes(newTime.getMinutes());
      setSeconds(newTime.getSeconds());
    };

    const keyDownEvent = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {
        event.preventDefault();
        incrementSeconds(-S_INTERVAL);
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
        incrementSeconds(S_INTERVAL);
      }
    };

    document.addEventListener("keydown", keyDownEvent);
    return () => {
      document.removeEventListener("keydown", keyDownEvent);
    };
  }, [hours, minutes, seconds]);

  return (
    <section
      className={cn("flex border border-white w-fit", className)}
      ref={timePickerRef}
    >
      <TimeInput
        value={hours}
        className="text-right"
        max={23}
        onChange={setHours}
      />
      {" : "}
      <TimeInput value={minutes} className="text-right" onChange={setMinutes} />
      {" : "}
      <TimeInput value={seconds} onChange={setSeconds} />
    </section>
  );
};

export default TimePicker;
