import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addDays,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
} from "date-fns";
import "./customDateTimePicker.css";

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  open: boolean;
  onClose: () => void;
  isValidDate: (day: Date) => boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const sanitizeTimeValue = (rawValue: string, max: number): string => {
  let clean = rawValue.replace(/\D/g, "");

  if (clean.length > 2) {
    clean = clean.slice(0, 2);
  }

  if (clean === "") return "";

  let num = parseInt(clean, 10);

  if (num < 0) num = 0;
  if (num > max) num = max;

  return String(num);
};

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  open,
  onClose,
  isValidDate,
}) => {
  const [internalDate, setInternalDate] = useState<Date>(value || new Date());

  const [hourStr, setHourStr] = useState(String(value.getUTCHours()));
  const [minuteStr, setMinuteStr] = useState(String(value.getUTCMinutes()));
  const [secondStr, setSecondStr] = useState(String(value.getUTCSeconds()));

  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [tempYear, setTempYear] = useState(currentMonth.getFullYear());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        e.target instanceof Node &&
        !containerRef.current.contains(e.target)
      ) {
        setShowYearMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocalTimeChange = (
    type: "hours" | "minutes" | "seconds",
    val: string
  ) => {
    if (type === "hours") {
      setHourStr(sanitizeTimeValue(val, 23));
    } else if (type === "minutes") {
      setMinuteStr(sanitizeTimeValue(val, 59));
    } else if (type === "seconds") {
      setSecondStr(sanitizeTimeValue(val, 59));
    }
  };

  const handleDateClick = (day: Date) => {
    if (isValidDate && !isValidDate(day)) return;
    const hours = parseInt(hourStr, 10) || 0;
    const minutes = parseInt(minuteStr, 10) || 0;
    const seconds = parseInt(secondStr, 10) || 0;

    const updatedDate = new Date(
      Date.UTC(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hours,
        minutes,
        seconds
      )
    );
    setInternalDate(updatedDate);
  };

  const handleMonthChange = (direction: number) => {
    setCurrentMonth(addMonths(currentMonth, direction));
  };

  const handleConfirm = () => {
    const h = parseInt(hourStr, 10) || 0;
    const m = parseInt(minuteStr, 10) || 0;
    const s = parseInt(secondStr, 10) || 0;

    const hours = Math.max(0, Math.min(h, 23));
    const minutes = Math.max(0, Math.min(m, 59));
    const seconds = Math.max(0, Math.min(s, 59));

    const finalDate = new Date(
      Date.UTC(
        internalDate.getFullYear(),
        internalDate.getMonth(),
        internalDate.getDate(),
        hours,
        minutes,
        seconds
      )
    );
    onChange(finalDate);
    setShowYearMonthPicker(false);
    onClose();
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      const weekStart = day;
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const inCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isSelectedDay = isSameDay(cloneDay, internalDate);
        const dayIsValid = !isValidDate || isValidDate(cloneDay);

        const disabledClass = !inCurrentMonth ? "not-same-month" : "";
        const selectedClass = isSelectedDay ? "selected-day" : "";
        const invalidClass = dayIsValid ? "" : "disabled-day";

        days.push(
          <div
            className={`calendar-day ${disabledClass} ${selectedClass} ${invalidClass}`}
            key={cloneDay.toISOString()}
            onClick={() => handleDateClick(cloneDay)}
          >
            <span>{format(day, "d")}</span>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div
          className="calendar-row"
          key={weekStart.toISOString()}
        >
          {days}
        </div>
      );
      days = [];
    }

    return <div className="calendar-body">{rows}</div>;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempYear(parseInt(e.target.value, 10));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const updatedMonth = setYear(
      setMonth(new Date(currentMonth), monthIndex),
      tempYear
    );
    setCurrentMonth(updatedMonth);
    setShowYearMonthPicker(false);
  };

  return (
    <>
      {open && (
        <div
          ref={containerRef}
          className="datetime-popover"
        >
          {!showYearMonthPicker && (
            <>
              <div className="calendar-header">
                <button
                  className="month-button"
                  onClick={() => handleMonthChange(-1)}
                >
                  {"<"}
                </button>
                <span
                  className="month-label"
                  onClick={() => {
                    setTempYear(currentMonth.getFullYear());
                    setShowYearMonthPicker(true);
                  }}
                >
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  className="month-button"
                  onClick={() => handleMonthChange(1)}
                >
                  {">"}
                </button>
              </div>
              <div className="calendar-day-names">
                {WEEK_DAYS.map((day) => (
                  <div
                    className="day-name"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {renderDays()}

              <div className="time-section">
                <div className="time-inputs">
                  <div className="time-field">
                    <label>Hours</label>
                    <input
                      type="text"
                      value={hourStr}
                      onChange={(e) =>
                        handleLocalTimeChange("hours", e.target.value)
                      }
                    />
                  </div>
                  <div className="time-field">
                    <label>Minutes</label>
                    <input
                      type="text"
                      value={minuteStr}
                      onChange={(e) =>
                        handleLocalTimeChange("minutes", e.target.value)
                      }
                    />
                  </div>
                  <div className="time-field">
                    <label>Seconds</label>
                    <input
                      type="text"
                      value={secondStr}
                      onChange={(e) =>
                        handleLocalTimeChange("seconds", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="actions">
                <button
                  onClick={() => {
                    onClose();
                    setShowYearMonthPicker(false);
                  }}
                >
                  Cancel
                </button>
                <button onClick={handleConfirm}>OK</button>
              </div>
            </>
          )}

          {showYearMonthPicker && (
            <div className="year-month-picker">
              <div className="year-input-section">
                <label>Select Year:</label>
                <input
                  type="number"
                  value={tempYear}
                  onChange={handleYearChange}
                  style={{ width: "80px", textAlign: "center" }}
                />
              </div>
              <div className="month-grid">
                {MONTHS.map((month, index) => (
                  <div
                    key={month}
                    className="month-cell"
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </div>
                ))}
              </div>
              <div className="actions">
                <button onClick={() => setShowYearMonthPicker(false)}>
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomDateTimePicker;
