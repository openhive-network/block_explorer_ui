import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import {
  useRef,
  RefObject,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { buildDecodedURL, toDateNumber } from "./StringUtils";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import useDynamicGlobal from "@/api/homePage/useDynamicGlobal";
import useHeadBlock from "@/api/homePage/useHeadBlock";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";
import OperationsFormatter from "@/lib/Formatter";
import {
  convertBooleanArrayIntoHexadecimals,
  parseUrlFlagsIntoBooleanArray,
} from "@/lib/utils";
import { useHeadBlockNumber } from "@/components/contexts/HeadBlockContext";

/**
 * hook for using debounce
 *
 * @param func function to be called after wait
 * @param wait wait in ms
 * @returns callable debounce function
 */
export const useDebounce = <T extends (...args: any) => any>(
  func: T,
  wait: number
) => {
  let timeoutID = useRef(setTimeout(() => null, 0));

  const debounced = (...args: any) => {
    clearTimeout(timeoutID.current);
    timeoutID.current = setTimeout(() => func(...args), wait);
  };

  return debounced;
};

/**
 * hook listening for clicks outside of ref element
 *
 * @param ref ref to an element
 * @param handler function to be called on outside click
 */
export const useOnClickOutside = (
  ref: RefObject<HTMLDivElement>,
  handler: Function
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};

/**
 * hook listening to screen width changes
 *
 * @param query string query in form of CSS media query e.g. (max-width: 768px)
 * @returns boolean stating if current screen size matches the media query
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    if (matches === null) {
      setMatches(window.matchMedia(query).matches);
    }

    const matchQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    matchQueryList.addEventListener("change", handleChange);

    return () => {
      matchQueryList.removeEventListener("change", handleChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
};

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

const URLToData = (value: any) => {
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

const paramsShallowEqual = (params1: ParamObject, params2: ParamObject) => {
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

export const useURLParams = <T>(defaultState: T, omit?: string[]) => {
  const router = useRouter();
  const [paramsState, setParamsState] = useState<T>(defaultState);
  const interpolationParams = useMemo(() => {
    const regex = /(?:\[([^\]]+)\]|\[\[([^\[]+?)\.\.\.\]\])/g;

    let match;
    const matches = [];

    while ((match = regex.exec(router.pathname)) !== null) {
      matches.push(match[1].replace("[...", ""));
    }

    return matches as (keyof T)[];
  }, [router.pathname]);

  const setParams = (params: T) => {
    if (
      interpolationParams.every((param) => !!params[param]) &&
      router.isReady
    ) {
      let urlParams: ParamObject = {};
      Object.keys(params as ParamObject).forEach((key) => {
        const paramKey = key as keyof T;
        const value = dataToURL(params[paramKey]);
        if (
          !!value &&
          !omit?.includes(key) &&
          value !== defaultState[paramKey]
        ) {
          urlParams[key] = value;
        } else {
          delete urlParams[key];
        }
      });
      let path = router.asPath.split("?")[0];
      const fullPath = buildDecodedURL(path, urlParams);
      if (
        !paramsShallowEqual(router.query, urlParams) &&
        fullPath !== router.asPath
      ) {
        router.replace(fullPath);
      }
    }
  };

  const getParams = () => {
    let queryParams = { ...(router.query as T) };

    Object.keys(queryParams as ParamObject).forEach((key) => {
      queryParams[key as keyof typeof queryParams] = URLToData(
        queryParams[key as keyof typeof queryParams]
      );
    });

    setParamsState({ ...defaultState, ...queryParams });
  };

  useEffect(() => {
    getParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  return {
    paramsState,
    setParams,
  };
};

const getSyncInfoData = (
  globalData?: Explorer.HeadBlockCardData,
  headBlockData?: Hive.BlockDetails
) => {
  const hiveBlockNumber =
    globalData?.headBlockNumber && globalData?.headBlockNumber;
  const explorerBlockNumber =
    headBlockData?.block_num && headBlockData?.block_num;
  const hiveBlockTime =
    globalData?.headBlockDetails.blockchainTime &&
    new Date(globalData?.headBlockDetails.blockchainTime).getTime();
  const explorerTime =
    headBlockData?.created_at && new Date(headBlockData?.created_at).getTime();

  return {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
  };
};

export const convertVestsToHP = (vests: string) => {
  const dynamicGlobalData = useDynamicGlobal().dynamicGlobalData;
  return dynamicGlobalData?.headBlockDetails
    ? (parseFloat(vests.replace(/,/g, "").split(" ")[0]) *
        parseFloat(
          dynamicGlobalData?.headBlockDetails?.totalVestingFundHive
            ?.replace(/,/g, "")
            .split(" ")[0]
        )) /
        parseFloat(
          dynamicGlobalData?.headBlockDetails?.totalVestingShares
            ?.replace(/,/g, "")
            .split(" ")[0]
        )
    : 0;
};

export const convertHiveToUSD = (hiveAmount: number) => {
  const dynamicGlobalData = useDynamicGlobal().dynamicGlobalData;
  const hivePrice =
    dynamicGlobalData?.headBlockDetails?.feedPrice?.split(" ")[0];
  return hiveAmount * parseFloat(hivePrice ?? "0"); //default to 0 if no matching price is found
};

export const useBlockchainSyncInfo = () => {
  const dynamicGlobalQueryData = useDynamicGlobal().dynamicGlobalData;
  const headBlockNum = useHeadBlockNumber().headBlockNumberData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;

  const { explorerBlockNumber, hiveBlockNumber, explorerTime, hiveBlockTime } =
    useMemo(
      () => getSyncInfoData(dynamicGlobalQueryData, headBlockData),
      [dynamicGlobalQueryData, headBlockData]
    );

  const loading =
    typeof explorerBlockNumber === "undefined" ||
    typeof hiveBlockNumber === "undefined";

  return {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
    loading,
  };
};

export const useOperationsFormatter = (operations?: any) => {
  const { hiveChain } = useHiveChainContext();

  let basicFormatter = hiveChain?.formatter;
  basicFormatter = basicFormatter?.extend(OperationsFormatter, {
    transaction: { displayAsId: false },
  });

  if (basicFormatter && operations) {
    return basicFormatter.format(operations);
  } else {
    return operations;
  }
};
