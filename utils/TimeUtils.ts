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

export const formatAndDelocalizeFromTime = (date?: string | Date): string => {
  if (!date) return "";
  if (moment.utc(date).unix() === 0) return "--";
  return moment.utc(date).fromNow();
}