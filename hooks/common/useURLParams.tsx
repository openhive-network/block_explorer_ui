import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { dataToURL, paramsShallowEqual, URLToData } from "@/utils/URLutils";
import { buildDecodedURL } from "@/utils/StringUtils";

type ParamObject = { [key: string]: any };

const useURLParams = <T,>(defaultState: T, omit?: string[]) => {
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

  const setParams = (params: T, excludeParams = omit) => {
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
          !excludeParams?.includes(key) &&
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

  // If someone messes with a url query, remove empty value param
  useEffect(() => {
    if (!router.isReady) return;

    const queryParams = router.query;

    Object.keys(queryParams).forEach((key) => {
      if (!queryParams[key]) {
        setParams(queryParams as T, ["accountName"]);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, router.isReady]);

  return {
    paramsState,
    setParams,
  };
};

export default useURLParams;
