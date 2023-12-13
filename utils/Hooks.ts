import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useRef, RefObject, useEffect, useState, useCallback } from "react";

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

const SPLIT = "-";
const URL_ARRAY_END = "~";

type ParamObject = { [key: string]: any };

const dataToURL = (value: any) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return null;
    }
    return `${value.join(SPLIT)}${URL_ARRAY_END}`;
  }

  if (typeof value === "string") {
    if (!value.length) {
      return null;
    }
  }

  return value;
};

const URLToData = (value: any) => {
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  
  if (value.at(-1) === URL_ARRAY_END) {
    return value.match(/[\d|,|.|e|E|\+]+/g).map((v: string) => Number(v));
  }

  return value;
};

export const useURLParams = <T>(defaultState: T) => {
  const router = useRouter();
  const [paramsState, setParamsState] = useState<T>(defaultState);

  const setParams = (params: T, omit?: string[]) => {
    let urlParams: ParamObject = {};
    Object.keys(params as ParamObject).forEach((key) => {
      const value = dataToURL(params[key as keyof typeof params]);
      if (!!value && !omit?.includes(key)) {
        urlParams[key] = value;
      } else {
        delete urlParams[key];
      }
    });
    router.replace({
      query: {
        ...urlParams,
      },
    });
  };

  const getParams = () => {
    let queryParams = router.query as T;
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
