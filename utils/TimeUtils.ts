import { config } from "@/Config";
import moment from "moment";

export const convertUTCDateToLocalDate = (date: string | Date) => {
  const newDate = new Date(date);
  return formatAndDelocalizeTime(newDate);
};

export const formatAndDelocalizeTime = (date?: string | Date): string => {
  if (!date) return "";
  return moment(date).format(config.baseMomentTimeFormat);
}

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
  return moment.utc(date).locale(locale || "en").fromNow();
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
  return moment(date).locale(locale || 'en').format(config.momentLocaleDateFormat);
};