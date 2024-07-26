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

export function formatFeedAge(feedAge: string): string {
  if (!feedAge) return "--";
  const [hoursStr, minutesStr, secondsStr] = feedAge.split(":");
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const seconds = parseInt(secondsStr, 10) || 0;
  const dayMatch = feedAge.match(/(\d+)\s*days?/);
  const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
  const totalMinutes = hours * 60 + minutes;
  const totalHours = hours + minutes / 60;
  if (days > 0) {
    return days === 1 ? "1 day" : `${days} days`;
  } else if (totalHours >= 1) {
    const minutesPart = minutes > 0 ? ` ${minutes} min${minutes > 1 ? 's' : ''}` : '';
    return Math.floor(totalHours) === 1 ? `1 hour${minutesPart}` : `${Math.floor(totalHours)} hours${minutesPart}`;
  } else if (totalMinutes >= 1) {
    return Math.floor(totalMinutes) === 1 ? "1 min" : `${Math.floor(totalMinutes)} mins`;
  } else {
    return "0 mins";
  }
}
export function isFeedAgeBeyondThreshold(feedAge: string, thresholdInDays: number): boolean {
  if (!feedAge) return false;
  const [hours, minutes] = feedAge.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const dayMatch = feedAge.match(/(\d+)\s*days?/);
  const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  return days > thresholdInDays;
}