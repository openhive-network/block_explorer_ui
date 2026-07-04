import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Long from "long";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import { grabNumericValue } from "@/utils/StringUtils";
import Hive from "@/types/Hive";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert given number to an object of low and high
 * @param value normal integer number
 * @returns two elements array.
 */
export const numToHighLow = (value: number) => {
  const long = Long.fromNumber(value);

  return { low: long.low, high: long.high };
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
      if (
        typeof urlParam.paramValue === "string" ||
        typeof urlParam.paramValue === "number"
      ) {
        resultString += `${urlParam.paramName}=${urlParam.paramValue}`;
      } else {
        let arrayProps = "";
        urlParam.paramValue.forEach((arrayValue, arrayIndex) => {
          arrayProps += `${arrayIndex !== 0 ? "-" : ""}${arrayValue}`;
        });
        resultString += `${urlParam.paramName}=${arrayProps}`;
      }
    }
  });
  return resultString;
};

/**
 * Use precision to properly format number on display. Used for hive power and vests.
 * @param numberToFormat Raw number
 * @param isVest
 * @returns Formatted string
 */
export const formatNumber = (
  numberToFormat: number | string,
  isVest: boolean,
  skipPrecision: boolean = false,
  decimalPoints: number = 2
): string => {
  let valueStr =
    typeof numberToFormat === "string"
      ? numberToFormat
      : numberToFormat.toString();

  if (skipPrecision) {
    const [intPart, decPart] = valueStr.split(".");
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimalPoints === 0) {
      return intWithCommas;
    }
    if (!decPart) return `${intWithCommas}.${"0".repeat(decimalPoints)}`;
    const paddedDec = decPart
      .padEnd(decimalPoints, "0")
      .slice(0, decimalPoints);
    return `${intWithCommas}.${paddedDec}`;
  }

  const precision = isVest
    ? config.precisions.vests
    : config.precisions.hivePower;

  if (typeof numberToFormat === "string" && numberToFormat.length > 15) {
    const intLength = valueStr.length - precision;
    const intPart = valueStr.substring(0, intLength) || "0";
    const decPart = valueStr.substring(intLength).padEnd(precision, "0");
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedDec = decPart.slice(0, precision); // Force only 2 decimals
    return `${intWithCommas}.${formattedDec}`;
  } else {
    const num =
      typeof numberToFormat === "string"
        ? parseFloat(numberToFormat)
        : numberToFormat;
    const fixed = (num / Math.pow(10, precision)).toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    return fixed;
  }
};

/**
 * Properly format percentage values
 * @param numberToFormat raw percentage from Hive backend.
 * @returns Formatted string with % at the end
 */
export const formatPercent = (
  numberToFormat: number,
  locale?: string
): string => {
  return `${(
    numberToFormat / Math.pow(10, config.precisions.percentage)
  ).toLocaleString(locale)}%`;
};

/**
 * Format HP values consistently with decimals defined in config.
 * Accepts number or string (with or without unit) and returns a string like "1.234 HP".
 */
export const formatHp = (
  value: number | string | undefined | null,
  decimals: number = config.precisions.hivePower,
  appendUnit: boolean = true
): string => {
  if (value === undefined || value === null) return "--";

  const numericValue =
    typeof value === "string" ? grabNumericValue(value) : Number(value);

  if (Number.isNaN(numericValue)) return "--";

  const formatted = numericValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return appendUnit ? `${formatted} HP` : formatted;
};

export const convertOperationResultsToTableOperations = (
  operations: Hive.OperationResponse[]
): Explorer.OperationForTable[] => {
  return operations?.map((operation) => ({
    operation: operation.op,
    blockNumber: operation.block,
    trxId: operation.trx_id,
    timestamp: operation.timestamp,
    operationId: operation.operation_id,
  }));
};

export const convertCommentsOperationResultToTableOperations = (
  operations: Hive.CommentOperation[]
): Explorer.OperationForTable[] => {
  return operations?.map((operation) => ({
    operation: operation.op,
    blockNumber: operation.block,
    operationId: String(operation.operation_id),
    trxId: operation.trx_id,
    timestamp: operation.timestamp,
  }));
};

export const convertTransactionResponseToTableOperations = (
  transaction: Hive.TransactionResponse
): Explorer.OperationForTable[] => {
  return transaction.transaction_json.operations.map((operation) => ({
    operation: operation,
    blockNumber: transaction.block_num,
    trxId: transaction.transaction_id,
    timestamp: transaction?.timestamp?.toString() || Date.now().toString(),
  }));
};

/**
 * Change 32 bit flag from URL into array of boolean.
 * @param urlHexCollection like "0044fad0-33440000-aabbff12"
 * @returns array of on-off booleans for filters
 */
export const parseUrlFlagsIntoBooleanArray = (
  urlHexCollection: string
): boolean[] => {
  const parts = urlHexCollection.split("-");
  let finalValues: boolean[] = [];
  parts.forEach((part) => {
    let parsedHexValue = BigInt(parseInt(part, 16));
    let convertedBooleans: boolean[] = new Array(32).fill(false);
    let index = 0;
    while (parsedHexValue > 0) {
      convertedBooleans[index] = parsedHexValue % BigInt(2) === BigInt(1);
      parsedHexValue = parsedHexValue >> BigInt(1);
      ++index;
    }
    finalValues = [...finalValues, ...convertedBooleans];
  });
  return finalValues;
};

/**
 * Convert boolean into hexadecimals formatted for URL
 * @param booleanArray
 * @returns like "aaffbb00-ffffffff-12345678"
 */
export const convertBooleanArrayIntoHexadecimals = (
  booleanArray: boolean[]
): string => {
  let binaryString: string = "";
  booleanArray.forEach((bit) => {
    binaryString += bit ? "1" : "0";
  });
  const slicedBinaryRepresentation: string[] = [];
  for (
    let stringIndex = 0;
    stringIndex < binaryString.length;
    stringIndex += 32
  ) {
    const slicedRepresentation = binaryString.slice(
      stringIndex,
      stringIndex + 32
    );
    const reversedSlicedRepresentation = slicedRepresentation
      .split("")
      .reverse()
      .join("");
    slicedBinaryRepresentation.push(reversedSlicedRepresentation);
  }
  let finalString = "";
  slicedBinaryRepresentation.forEach((singleRepresentation, index) => {
    const parsedNumber = parseInt(singleRepresentation, 2);
    const parsedHexValue = parsedNumber.toString(16).padStart(8, "0");
    if (index !== 0) finalString += "-";
    finalString += parsedHexValue;
  });
  return finalString;
};

export const convertBooleanArrayToIds = (filters: boolean[]) => {
  const idsArray: number[] = [];
  filters.forEach((filter, i) => {
    if (filter) idsArray.push(i);
  });
  return idsArray;
};

export const convertIdsToBooleanArray = (
  filters: number[] | null,
  numOfTypes?: number
) => {
  if (!filters || filters.length === 0) return [];
  const booleanArray = new Array(numOfTypes ?? Math.max(...filters)).fill(
    false
  );
  filters.forEach((filter) => (booleanArray[filter] = true));
  return booleanArray;
};

export const createPathFilterString = (
  keyContent?: string,
  setOfKeys?: string[]
): string | undefined => {
  if (keyContent && setOfKeys) {
    const path = setOfKeys.join(".");
    return `${path}=${keyContent}`;
  }
  return undefined;
};

export const convertBalanceHistoryResultsToTableOperations = (
  response: Hive.AccountBalanceHistoryResponse
): Explorer.BalanceHistoryForTable[] => {
  if (!response || !response.operations_result) {
    return [];
  }
  return response.operations_result.map((operation) => ({
    operationId: operation.operation_id,
    blockNumber: operation.block_num,
    timestamp: operation.timestamp,
    opTypeId: operation.op_type_id,
    balance: operation.balance,
    prev_balance: operation.prev_balance,
    balanceChange: operation.balance_change,
    hivePrice: operation.hivePrice,
  }));
};
