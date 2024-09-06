import {
  convertBooleanArrayIntoHexadecimals,
  parseUrlFlagsIntoBooleanArray,
} from "@/lib/utils";
import { toDateNumber } from "./StringUtils";

const URL_ARRAY_HEX = "_h";
const URL_ARRAY_STRING = "_s";
const SPLIT = "-";

type ParamObject = { [key: string]: any };

export const dataToURL = (value: any) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return null;
    } else {
      if (typeof value[0] === "boolean") {
        return `${convertBooleanArrayIntoHexadecimals(value)}${URL_ARRAY_HEX}`;
      } else {
        if (typeof value[0] === "string") {
          return `${value.join(SPLIT)}${URL_ARRAY_STRING}`;
        } else {
          return value[0];
        }
      }
    }
  }

  if (typeof value === "string") {
    if (!value.length) {
      return null;
    }
  }

  if (value instanceof Date) {
    return `${value.getFullYear()}.${toDateNumber(
      value.getMonth() + 1
    )}.${toDateNumber(value.getDate())}_${toDateNumber(
      value.getHours()
    )}.${toDateNumber(value.getMinutes())}.${toDateNumber(value.getSeconds())}`;
  }

  return value;
};

export const URLToData = (value: any) => {
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  if (value.slice(-2) === URL_ARRAY_HEX) {
    return parseUrlFlagsIntoBooleanArray(value.slice(0, -1));
  }

  if (value.slice(-2) === URL_ARRAY_STRING) {
    return value.slice(0, -2).split(SPLIT);
  }

  if (/^\d{4}\.\d{2}\.\d{2}_\d{2}.\d{2}.\d{2}$/.test(value)) {
    return new Date(
      `${value.split("_")[0]} ${value.split("_")[1].replaceAll(".", ":")}`
    );
  }

  return value;
};

export const paramsShallowEqual = (
  params1: ParamObject,
  params2: ParamObject
) => {
  const keys1 = Object.keys(params1);
  const keys2 = Object.keys(params2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (params1[key] !== params2[key]) {
      return false;
    }
  }

  return true;
};
