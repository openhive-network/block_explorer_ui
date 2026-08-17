import { config } from "@/Config";
import moment from "moment";

export const convertUTCDateToLocalDate = (date: string | Date) => {
  const newDate = new Date(date);
  return formatAndDelocalizeTime(newDate);
};

// Hive APIs return ISO timestamps without a timezone marker (e.g. "2026-05-15T14:00:00")
// which JS parses as local time. Force UTC interpretation so date math is correct.
export const convertToUTCDate = (date: string): Date =>
  new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(date) ? date : `${date}Z`);

export const formatAndDelocalizeTime = (date?: string | Date): string => {
  if (!date) return "";
  return moment(date).format(config.baseMomentTimeFormat);
};

/**
 * Formats a date to a human-readable "from now" string (e.g., "a few seconds ago")
 * in a specified locale.
 * @param date The date to format.
 * @param locale The locale to use for formatting (e.g., 'en', 'es', 'fr'). Defaults to 'en'.
 * @returns The formatted, localized time string.
 */
export const formatAndDelocalizeFromTime = (
  date?: string | Date,
  locale?: string
): string => {
  if (!date) return "";
  if (moment.utc(date).unix() === 0) return "--";
  //The locale to use for formatting (e.g., 'en', 'es', 'fr'). Defaults to 'en'.
  return moment
    .utc(date)
    .locale(locale || "en")
    .fromNow();
};

/**
 * Formats a date to a human-readable string (e.g., "Jun 25, 2025")
 * in a specified locale, respecting the app's language setting.
 * @param date The date to format.
 * @param locale The locale to use for formatting (e.g., 'en', 'de', 'es'). Defaults to 'en'.
 * @returns The formatted, localized date string.
 */
export const formatDateToLocale = (
  date?: string | Date,
  locale?: string
): string => {
  if (!date) return "";
  return moment(date)
    .locale(locale || "en")
    .format(config.momentLocaleDateFormat);
};
// The chain reports zoneless timestamps, which are always UTC. "Z" is appended
// only when the string carries no zone, so "…+00:00" keeps parsing. Returns
// null when the input is missing or unparseable.
export const parseChainDate = (raw?: string | null): Date | null => {
  if (!raw) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
  const date = new Date(hasZone ? raw : `${raw}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Some hooks hand back timestamps already formatted for display while others
// pass the raw chain value through. new Date() on the display form is
// browser-dependent (Invalid Date on Firefox/WebKit) and on the zone-less chain
// form is read as local time, so both shapes are normalised to UTC here.
const DISPLAY_TIME = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}:\d{2}:\d{2})(?: UTC)?$/;

export const parseDisplayOrChainDate = (
  value?: string | Date | null
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const match = value.match(DISPLAY_TIME);
  return parseChainDate(
    match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}Z` : value
  );
};

export const formatBlockchainTime = (value?: string | Date | null): string => {
  const date = value instanceof Date ? value : parseChainDate(value);
  if (!date) return "";
  return `${
    date.toISOString().replace("T", " ").replaceAll("-", "/").split(".")[0]
  } UTC`;
};
