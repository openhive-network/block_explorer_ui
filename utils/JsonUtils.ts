// FILE: src/lib/jsonUtils.ts

/**
 * =================================================================================
 *  JSON Parsing Utilities
 * =================================================================================
 *
 * This file contains utility functions for safely handling JSON data that may
 * be malformed, single-encoded, or double-encoded. The primary goal is to
 * prevent application crashes from unexpected JSON formats and to provide
 * user-friendly, translated feedback when data is unparseable.
 *
 */
type TFunction = (key: string) => string;

export function safelyParseJson(data: any, t: TFunction): object {
    console.log('t',t);
  if (typeof data !== "string") {
    if (typeof data === "object" && data !== null) {
      return data;
    }

    return { [t("jsonUtils.malformedJson")]: data };
  }

  if (!data.trim()) {
    return { [t("jsonUtils.info")]: t("jsonUtils.emptyString") };
  }
  try {
    let parsedData = JSON.parse(data);

    if (typeof parsedData === "string") {
      try {
        return JSON.parse(parsedData);
      } catch (innerError) {
        return { [t("jsonUtils.malformedJson")]: parsedData };
      }
    }
    return parsedData;
  } catch (outerError) {
    return { [t("jsonUtils.malformedJson")]: data };
  }
}
