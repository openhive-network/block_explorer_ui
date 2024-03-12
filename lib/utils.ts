import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Long from "long";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import Hive from "@/types/Hive";

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
      if (typeof urlParam.paramValue === "string" || typeof urlParam.paramValue === "number") {
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
};

/**
 * Use precision to properly format number on display. Used for hive power and vests.
 * @param numberToFormat Raw number
 * @param isVest 
 * @returns Formatted string
 */
export const formatNumber = (numberToFormat: number, isVest: boolean): string => {
  const precision = isVest ? config.precisions.vests : config.precisions.hivePower;
  const vestsFormat = isVest ? {minimumFractionDigits: precision} : undefined;
  return (numberToFormat / Math.pow(10, precision)).toLocaleString(undefined, vestsFormat);
}

/**
 * Properly format percentage values
 * @param numberToFormat raw percentage from Hive backend.
 * @returns Formatted string with % at the end
 */
export const formatPercent = (numberToFormat: number): string => {
  return `${(numberToFormat / Math.pow(10, config.precisions.percentage)).toLocaleString()}%`
}

export const convertOperationResultsToTableOperations = (operations: Hive.OperationResponse[]): Explorer.OperationForTable[] => {
  return operations.map((operation) => ({
    operation: operation.operation,
    blockNumber: operation.block_num,
    trxId: operation.trx_id,
    operatiopnId: operation.operation_id
  }))
}

export const convertCommentsOperationResultToTableOperations = (operations: Hive.CommentOperation[]): Explorer.OperationForTable[] => {
  return operations.map((operation) => ({
    operation: operation.operation,
    blockNumber: operation.block_num,
    operatiopnId: operation.operation_id,
    trxId: operation.trx_hash
  }))
}



export const convertTransactionResponseToTableOperations = (transaction: Hive.TransactionQueryResponse): Explorer.OperationForTable[] => {
  return transaction.transaction_json.operations.map((operation) => ({
    operation: operation,
    blockNumber: transaction.block_num,
    trxId: transaction.transaction_id
  }))

}

/**
 * Change 32 bit flag from URL into array of boolean.
 * @param urlHexCollection like "0044fad0-33440000-aabbff12"
 * @returns array of on-off booleans for filters
 */
export const parseUrlFlagsIntoBooleanArray = (urlHexCollection: string): boolean[] => {
  const parts = urlHexCollection.split("-");
  let finalValues: boolean[] = [];
  parts.forEach(part => {
    let parsedHexValue = BigInt(parseInt(part, 16));
    let convertedBooleans: boolean[] = new Array(32).fill(false);
    let index = 0;
    while (parsedHexValue > 0) {
      convertedBooleans[index] = (parsedHexValue % BigInt(2) === BigInt(1));
      parsedHexValue = parsedHexValue >> BigInt(1);
      ++index;
    }
    finalValues = [...finalValues, ...convertedBooleans];
  });
  return finalValues;
}

export const convertBooleanArrayIntoHexadecimals = (booleanArray: boolean[]): string => {
  const stringBinaryRepresentations: string[] = [];
  let testBinary: string = "";
  booleanArray.forEach((bit, index) => {
    const representation = bit ? "1" : "0";
    testBinary += representation;
  });
  const parsedNumber = parseInt(testBinary, 2);
  const parsedHexValue = parsedNumber.toString(16);
  return "";
}