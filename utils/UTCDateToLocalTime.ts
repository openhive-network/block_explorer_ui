import moment from "moment";

export const convertUTCDateToLocalDate = (date: string | Date) => {
  const d = new Date(date);

  const newDate = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);

  return moment(newDate).format("YYYY/MM/DD HH:mm:ss");
};
