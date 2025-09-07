import React, { ReactNode } from "react";



export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const addSpacesAndCapitalizeFirst = (text: string) => {
  return capitalizeFirst(text).replaceAll("_", " ");
};

export const isJson = (item: unknown) => {
  try {
    JSON.parse(item as string);
  } catch (error) {
    return false;
  }

  let value = typeof item !== "string" ? JSON.stringify(item) : item;

  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }

  return (
    typeof value === "object" &&
    value !== null &&
    JSON.stringify(value).includes("{")
  );
};

/**
 * properly formats json including nested json objects
 *
 * @param json json object
 * @returns formatted and parsed json
 */
export const formatJson = (json: { [key: string]: any }) => {
  let formatted = structuredClone(json);
  json &&
    Object.keys(json).forEach((key) => {
      if (typeof json[key] === "object") {
        formatted[key] = formatJson(json[key]);
      } else {
        try {
          formatted[key] = JSON.parse(json[key]);
        } catch (error) {
          formatted[key] = json[key];
        }
      }
    });
  return formatted;
};

export const toDateNumber = (value: number) => {
  if (value < 10) {
    return "0" + value;
  } else {
    return value.toString();
  }
};

/**
 * function to keep path and query string in a URL with decoded reserved charcters
 *
 * @param path path including all needed interpolation params
 * @param query query string as object
 * @returns string containing full path with decoded reserved characters
 */
export const buildDecodedURL = (path: string, query: Object) => {
  let url = `${path}?`;
  Object.entries(query).forEach(([key, value]) => {
    url += `&${key}=${value}`;
  });
  return url;
};

export const formatAccountName = (accountName: string | string[]) => {
  if (Array.isArray(accountName)) {
    return accountName[0].replace("@", "");
  } else {
    return accountName.replace("@", "");
  }
};

export const numberToTimeString = (num: number) => {
  if (num < 10) {
    return `0${num.toString()}`;
  } else {
    return num.toString();
  }
};

export const trimAccountName = (accountName: string) => {
  const trimmedName = accountName.trim();

  if (trimmedName[0] === "@") {
    return trimmedName.slice(1, accountName.length);
  }
  return trimmedName;
};

/**
 * Returns only numbers as string type and trims last word such as `HIVE` or `VESTS`
 *
 * @param value string value that needs to be trimmed
 * @param keyword string keyword of what we want to split from our string
 * @returns trimmed string without keyword
 */

export const splitStringValue = (value: string, keyword: string) => {
  return value.split(keyword)[0];
};

/**
 * Use this to change 123.123 HBD into 123.123 $
 * @param hbd Formatted HBD
 */
export const changeHBDToDollarsDisplay = (hbd: string): string => {
  const numericValue = hbd.split(" ")[0].slice(0, -1);

  return `${numericValue} $`;
};

/**
 *
 * @param hbd grab pure numeric value without any unit or commas
 * @returns
 */
export const grabNumericValue = (str: string): number => {
  // 1. Remove all non-numeric characters EXCEPT the decimal point (period or comma).
  const cleaned = str?.replace(/[^0-9.,-]/g, "");

  // 2. Handle negative sign: Keep only the first one (if present) and make sure it's at the beginning.
  let negative = "";
  if (cleaned.startsWith("-")) {
    negative = "-";
  }
  const withoutNegative = cleaned.replace(/^-/, ""); // Remove initial negative sign

  //3. Determine the decimal separator (either comma or period), preferring the last occurrence
  let decimalSeparator = "";
  if (withoutNegative.lastIndexOf(",") > withoutNegative.lastIndexOf(".")) {
    decimalSeparator = ",";
  } else if (withoutNegative.lastIndexOf(".") > -1) {
    decimalSeparator = ".";
  }

  // 4. Remove thousands separators, keeping only the decimal point.
  let numberString = withoutNegative;

  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    const regex = new RegExp(
      thousandsSeparator === "." ? "\\." : thousandsSeparator,
      "g"
    );
    numberString = numberString.replace(regex, "");
  } else {
    // No decimal separator found, so remove all periods and commas.
    numberString = numberString.replace(/[.,]/g, "");
  }

  // 5. Replace the decimal separator with a period.
  if (decimalSeparator) {
    numberString = numberString.replace(decimalSeparator, ".");
  }

  return Number(negative + numberString);
};

/**
 * Extracts plain text from a ReactNode tree.
 * It can handle nested components, arrays, strings, and numbers.
 * It can also be "taught" how to handle custom components, like i18n components,
 * by passing in a translation function.
 *
 * @param element The ReactNode to extract text from.
 * @param i18n_t (Optional) Your app's translation function (`t`) to resolve i18n keys.
 * @returns A single string of concatenated text.
 */
export const extractTextFromReactElement = (
  element: ReactNode,
  i18n_t?: (key: string, options?: any) => string
): string => {
  // 1. Handle null, undefined, and booleans first
  if (element == null || typeof element === "boolean") {
    return "";
  }

  // 2. Handle primitives (strings and numbers)
  if (typeof element === "string") {
    const trimmed = element.trim();
    if (!trimmed) return ""; // Return empty for whitespace-only strings
    return trimmed.startsWith("@") ? trimmed : trimmed + " ";
  }
  if (typeof element === "number") {
    return element.toString() + " ";
  }

  // 3. Handle arrays
  if (Array.isArray(element)) {
    return element
      .map((child) => extractTextFromReactElement(child, i18n_t))
      .join("");
  }

  // 4. If it's not a valid element, we can't process it.
  if (!React.isValidElement(element)) {
    return "";
  }

  const { type, props } = element as React.ReactElement<{ [key: string]: any }>;

  // 5. Handle special components
  if (typeof type === "function") {
    // Case A: A full Tooltip with trigger AND content.
    if (props.tooltipContent != null && props.tooltipTrigger != null) {
      const trigger = extractTextFromReactElement(props.tooltipTrigger, i18n_t);
      const content = extractTextFromReactElement(
        props.tooltipContent,
        i18n_t
      ).trimEnd();
      return `${trigger} (${content}) `;
    }

    // Case B: A component that uses `tooltipTrigger` as its primary text display.
    if (props.tooltipTrigger != null) {
      return extractTextFromReactElement(props.tooltipTrigger, i18n_t);
    }

    // Case C: i18n translation component.
    if (i18n_t && props.i18nKey && typeof props.i18nKey === "string") {
      return i18n_t(props.i18nKey) + " ";
    }
  }

  // 6. Generic handler for all other elements with children (div, span, Fragment, etc.)
  if (props.children) {
    return extractTextFromReactElement(props.children, i18n_t);
  }

  // 7. Fallback for elements with no processable text/children
  return "";
};

/**
 * format transaction hash
 * @param hash hash number
 */
export const formatHash = (hash: string): string => {
  return hash?.slice(0, 10);
};

/**
 * Wraps a string in `="<value>"` to ensure spreadsheet software
 * treats it as a literal string, preventing automatic type conversion (e.g., to a date).
 * This is a serialization utility, not a formatting utility.
 * @param value The pre-formatted string or number to wrap.
 * @returns A CSV-safe string.
 */
export const asCsvString = (value: string | number | undefined | null) => {
  if (value === null || typeof value === "undefined") return "";
  return `="${String(value)}"`;
};



/**
 * Validates if a string could be a valid Hive account name.
 * - Length between 3 and 16 characters.
 * - Starts with a letter.
 * - Contains only letters, numbers, hyphens, or periods.
 * - Ends with a letter or number.
 * @param name The string to validate.
 * @returns true if the string is a valid Hive account name format, false otherwise.
 */
export const isHiveAccountName = (name: string): boolean => {
  if (!name) {
    return false;
  }
  const regex = /^[a-z][a-z0-9-.]*$/;
  return name.length >= 3 && name.length <= 16 && regex.test(name);
};