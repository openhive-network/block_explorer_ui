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

export const formatBlockchainTime = (value?: string | Date | null): string => {
  const date = value instanceof Date ? value : parseChainDate(value);
  if (!date) return "";
  return `${
    date.toISOString().replace("T", " ").replaceAll("-", "/").split(".")[0]
  } UTC`;
};
