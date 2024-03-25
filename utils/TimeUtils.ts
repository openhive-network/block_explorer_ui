import { config } from "@/Config";
import moment from "moment";

export const convertUTCDateToLocalDate = (date: string | Date) => {
  const d = new Date(date);

  const newDate = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);

  return moment(newDate).format("YYYY/MM/DD HH:mm:ss");
};

export const formatAndDelocalizeTime = (date: string | Date) => {
  return moment(date).utc().format(config.baseMomentTimeFormat);
}