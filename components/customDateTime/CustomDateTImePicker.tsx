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

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  open,
  onClose,
  isValidDate,
}) => {
  const [internalValue, setInternalValue] = useState(value || new Date());
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [tempYear, setTempYear] = useState((value || new Date()).getFullYear());

  const containerRef: React.MutableRefObject<null | any> = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setShowYearMonthPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (day: Date) => {
    if (isValidDate && !isValidDate(day)) return;

    const hours = internalValue.getUTCHours();
    const minutes = internalValue.getUTCMinutes();
    const seconds = internalValue.getUTCSeconds();

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
    setInternalValue(updatedDate);
  };

  const handleMonthChange = (direction: any) => {
    setCurrentMonth(addMonths(currentMonth, direction));
  };

  const handleTimeChange = (type: any, newValue: any) => {
    const updatedDate = new Date(internalValue.getTime());
    if (type === "hours") {
      updatedDate.setUTCHours(
        parseInt(newValue, 10),
        updatedDate.getUTCMinutes(),
        updatedDate.getUTCSeconds()
      );
    } else if (type === "minutes") {
      updatedDate.setUTCMinutes(
        parseInt(newValue, 10),
        updatedDate.getUTCSeconds()
      );
    } else if (type === "seconds") {
      updatedDate.setUTCSeconds(parseInt(newValue, 10));
    }

    setInternalValue(updatedDate);
  };

  const handleConfirm = () => {
    onChange(internalValue);
    setShowYearMonthPicker(false);
    onClose();
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dayFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      const weekStart = day;
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, dayFormat);
        const isSelectedDay = isSameDay(cloneDay, internalValue);
        const inCurrentMonth = isSameMonth(cloneDay, monthStart);
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
            <span>{formattedDate}</span>
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

  const handleYearChange = (e: any) => {
    setTempYear(parseInt(e.target.value, 10));
  };

  const handleMonthSelect = (monthIndex: any) => {
    const updatedMonth = setYear(
      setMonth(new Date(currentMonth), monthIndex),
      tempYear
    );
    setCurrentMonth(updatedMonth);
    setShowYearMonthPicker(false);
  };

  const hours = internalValue.getUTCHours();
  const minutes = internalValue.getUTCMinutes();
  const seconds = internalValue.getUTCSeconds();

  return (
    <>
      {open && (
        <div className="datetime-popover">
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
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) =>
                        handleTimeChange("hours", e.target.value)
                      }
                    />
                  </div>
                  <div className="time-field">
                    <label>Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) =>
                        handleTimeChange("minutes", e.target.value)
                      }
                    />
                  </div>
                  <div className="time-field">
                    <label>Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) =>
                        handleTimeChange("seconds", e.target.value)
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
