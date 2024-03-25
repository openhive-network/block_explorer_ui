import { config } from "@/Config";
import moment from "moment";

export const convertUTCDateToLocalDate = (date: string | Date) => {
  const d = new Date(date);

  const newDate = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);

  return formatAndDelocalizeTime(date);;
};

export const formatAndDelocalizeTime = (date?: string | Date): string => {
  if (!date) return "";
  return moment(date).utc().format(config.baseMomentTimeFormat);
}