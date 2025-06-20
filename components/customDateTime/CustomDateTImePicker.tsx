//CUSTOM UTC DATE TIME PICKER

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./customDateTimePicker.css";
import { useI18n } from "@/i18n/i18n";

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  open: boolean;
  onClose: () => void;
  isValidDate: (day: Date) => boolean;
}

const WEEK_DAYS_KEYS = [
  "customDateTimePicker.weekdays.sun",
  "customDateTimePicker.weekdays.mon",
  "customDateTimePicker.weekdays.tue",
  "customDateTimePicker.weekdays.wed",
  "customDateTimePicker.weekdays.thu",
  "customDateTimePicker.weekdays.fri",
  "customDateTimePicker.weekdays.sat",
];
const MONTHS_KEYS = [
  "customDateTimePicker.months.january",
  "customDateTimePicker.months.february",
  "customDateTimePicker.months.march",
  "customDateTimePicker.months.april",
  "customDateTimePicker.months.may",
  "customDateTimePicker.months.june",
  "customDateTimePicker.months.july",
  "customDateTimePicker.months.august",
  "customDateTimePicker.months.september",
  "customDateTimePicker.months.october",
  "customDateTimePicker.months.november",
  "customDateTimePicker.months.december",
];

const pad = (n: number) => n.toString().padStart(2, "0");
const sameUTCDay = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const addUTCMonths = (dt: Date, m: number) =>
  new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + m, 1));

const clampNum = (raw: string, max: number) => {
  const digits = raw.replace(/\D/g, "").slice(0, 2); // keep ≤ 2 digits
  if (digits === "") return "";
  return Math.min(max, parseInt(digits, 10)).toString();
};

const padIfNeeded = (txt: string) => (txt.length === 1 ? `0${txt}` : txt);

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  open,
  onClose,
  isValidDate,
}) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Date>(new Date(value));
  const [monthPage, setMonthPage] = useState<Date>(addUTCMonths(value, 0));
  const [hour, setHour] = useState(pad(value.getUTCHours()));
  const [minute, setMinute] = useState(pad(value.getUTCMinutes()));
  const [second, setSecond] = useState(pad(value.getUTCSeconds()));
  const [showYM, setShowYM] = useState(false);
  const [tmpYear, setTmpYear] = useState(value.getUTCFullYear());
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowYM(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  const renderGrid = useCallback(() => {
    const firstOfMonth = new Date(
      Date.UTC(monthPage.getUTCFullYear(), monthPage.getUTCMonth(), 1)
    );
    const gridStart = new Date(firstOfMonth);
    gridStart.setUTCDate(1 - firstOfMonth.getUTCDay());
    const rows: JSX.Element[] = [];

    for (let w = 0; w < 6; w++) {
      const days: JSX.Element[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(gridStart.getTime() + (w * 7 + d) * 864e5);
        const disabled = !isValidDate(day);
        const css = [
          "calendar-day",
          day.getUTCMonth() !== monthPage.getUTCMonth() ? "not-same-month" : "",
          sameUTCDay(day, selected) ? "selected-day" : "",
          disabled ? "disabled-day" : "",
        ].join(" ");

        days.push(
          <div
            key={day.toISOString()}
            className={css}
            onClick={() => !disabled && setSelected(day)}
          >
            {day.getUTCDate()}
          </div>
        );
      }
      rows.push(
        <div
          className="calendar-row"
          key={w}
        >
          {days}
        </div>
      );
    }
    return <div className="calendar-body">{rows}</div>;
  }, [monthPage, selected, isValidDate]);

  const confirm = () => {
    const h = Number(hour) || 0;
    const m = Number(minute) || 0;
    const s = Number(second) || 0;
    const dt = new Date(
      Date.UTC(
        selected.getUTCFullYear(),
        selected.getUTCMonth(),
        selected.getUTCDate(),
        h,
        m,
        s
      )
    );

    onChange(dt);
    setShowYM(false);
    onClose();
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTmpYear(parseInt(e.target.value, 10));
  };

  const handleTodaySelect = () => {
    const now = new Date();
    setSelected(now);
    setHour(pad(now.getUTCHours()));
    setMinute(pad(now.getUTCMinutes()));
    setSecond(pad(now.getUTCSeconds()));
    setMonthPage(addUTCMonths(now, 0));
  };

  const handleCancelSelect = () => {
    onClose();
    setShowYM(false);
  };

  if (!open) return null;

  return (
    <div
      ref={wrapperRef}
      className="datetime-popover"
    >
      {showYM ? (
        <div className="year-month-picker">
          <div className="year-input-section">
            <label>{t("customDateTimePicker.year")}</label>
            <input
              type="number"
              value={tmpYear}
              onChange={handleYearChange}
            />
          </div>
          <div className="month-grid">
            {MONTHS_KEYS.map((monthKey, i) => (
              <div
                key={monthKey}
                className="month-cell"
                onClick={() => {
                  setMonthPage(new Date(Date.UTC(tmpYear, i, 1)));
                  setShowYM(false);
                }}
              >
                {t(monthKey)}
              </div>
            ))}
          </div>
          <div className="actions">
            <button onClick={() => setShowYM(false)}>{t("customDateTimePicker.back")}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="calendar-header">
            <button onClick={() => setMonthPage(addUTCMonths(monthPage, -1))}>
              {"<"}
            </button>
            <span
              className="month-label"
              onClick={() => setShowYM(true)}
            >
              {t(MONTHS_KEYS[monthPage.getUTCMonth()])} {monthPage.getUTCFullYear()}
            </span>
            <button onClick={() => setMonthPage(addUTCMonths(monthPage, +1))}>
              {">"}
            </button>
          </div>

          <div className="calendar-day-names">
            {WEEK_DAYS_KEYS.map((dayKey) => (
              <div
                key={dayKey}
                className="day-name"
              >
                {t(dayKey)}
              </div>
            ))}
          </div>

          {renderGrid()}

          <div className="time-section">
            <div className="time-field">
              <label>{t("customDateTimePicker.hours")}</label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(clampNum(e.target.value, 23))}
                onBlur={(e) => setHour(padIfNeeded(e.target.value))}
              />
            </div>
            <div className="time-field">
              <label>{t("customDateTimePicker.minutes")}</label>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(clampNum(e.target.value, 59))}
                onBlur={(e) => setMinute(padIfNeeded(e.target.value))}
              />
            </div>
            <div className="time-field">
              <label>{t("customDateTimePicker.seconds")}</label>
              <input
                type="text"
                value={second}
                onChange={(e) => setSecond(clampNum(e.target.value, 59))}
                onBlur={(e) => setSecond(padIfNeeded(e.target.value))}
              />
            </div>
            <div className="mt-6">{t("customDateTimePicker.utc")}</div>
          </div>

          <div className="actions"> 
            <button onClick={handleCancelSelect}>{t("common.cancel")}</button>
            <div>
              <button onClick={handleTodaySelect}>{t("customDateTimePicker.today")}</button>
              <button onClick={confirm}>{t("customDateTimePicker.ok")}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
