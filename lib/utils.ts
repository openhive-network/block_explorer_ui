import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Long from "long";
import Explorer from "@/types/Explorer";


 
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
 * Create URL params for given properties and their values.
 * @param urlParams pairs property-value
 * @returns end of URL
 */
export const getPageUrlParams = (urlParams: Explorer.UrlParam[]) => {
  let resultString = "?";
  urlParams.forEach((urlParam, index) => {
    if (urlParam.paramValue) {
      if (index > 0) resultString += "&";
      if (typeof urlParam.paramValue === "string") {
        resultString += `${urlParam.paramName}=${urlParam.paramValue}`;
      } else {
        let arrayProps = ""
        urlParam.paramValue.forEach((arrayValue, arrayIndex) => {
          arrayProps += `${arrayIndex !== 0 ? "-" : ""}${arrayValue}`;
        })
        resultString += `${urlParam.paramName}=${arrayProps}`;
      }
    }
  })
  return resultString;
}