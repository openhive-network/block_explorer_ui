import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Long from "long";


 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert given number to an object of low and high
 * @param value normal integer number
 * @returns two elements array.
 */
export const numToHighLow = (value: number) => {
  const long = Long.fromNumber(value);

  return {low: long.low, high: long.high};
};

/**
 * Substract given units from given date.
 * @param date normal JS date
 * @param numberToSubstract units to substract
 * @param unit days weeks or months
 * @returns date after substraction
 */
export const substractFromDate = (date: Date, numberToSubstract: number, unit: string): Date => {
  let resultDate = date;
  if (unit === "days") {
    resultDate.setDate(resultDate.getDate() - numberToSubstract);
  } else if (unit === "weeks") {
    const numberOfDaysInWeeks = numberToSubstract * 7;
    resultDate.setDate(resultDate.getDate() - numberOfDaysInWeeks);
  } else if (unit === "months") {
    resultDate.setMonth(resultDate.getMonth() - numberToSubstract);
  }
  resultDate.setMilliseconds(0);
  return resultDate;
}
