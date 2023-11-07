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
