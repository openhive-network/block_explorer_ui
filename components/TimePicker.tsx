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
  increment: number;
  onChange: (value: number) => void;
  className?: string;
}

const S_INTERVAL = 3;
const HM_INTERVAL = 1;

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  max = 59,
  min = 0,
  increment,
  onChange,
  className,
}) => {
  const [currentValue, setCurrentValue] = useState(numberToTimeString(value));
  const [focused, setFocused] = useState(false);

  const handleValueChange = (value: string) => {
    if (!/\D/.test(value)) {
      let v = Number(value);
      if (max && Number(value) > max) {
        v = min;
      }
      if (min && Number(value) < min) {
        v = min;
      }
      onChange(v);
      setCurrentValue(numberToTimeString(v));
    }
  };

  useEffect(() => {
    const keyDownEvent = (event: KeyboardEvent) => {
      if (focused) {
        if (event.code === "ArrowUp") {
          event.preventDefault();
          handleValueChange((Number(currentValue) + increment).toString());
        }
        if (event.code === "ArrowDown") {
          event.preventDefault();
          handleValueChange((Number(currentValue) - increment).toString());
        }
      }
    };

    document.addEventListener("keydown", keyDownEvent);
    return () => {
      document.removeEventListener("keydown", keyDownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, focused, increment]);

  useEffect(() => {
    setCurrentValue(numberToTimeString(value));
  }, [value]);

  return (
    <input
      value={currentValue}
      onChange={(e) => handleValueChange(e.target.value)}
      className={cn(
        "outline-none bg-explorer-dark-gray text-white w-5 mx-1",
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
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
        value={hours}
        increment={HM_INTERVAL}
        className="text-right"
        max={23}
        onChange={setHours}
      />
      {" : "}
      <TimeInput
        value={minutes}
        increment={HM_INTERVAL}
        className="text-right"
        onChange={setMinutes}
      />
      {" : "}
      <TimeInput value={seconds} increment={S_INTERVAL} onChange={setSeconds} />
    </section>
  );
};

export default TimePicker;
