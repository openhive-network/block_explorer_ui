import React, { ReactNode } from 'react';

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

  return `${numericValue} $`
}

/**
 * 
 * @param hbd grab pure numeric value without any unit or commas
 * @returns 
 */
export const grabNumericValue = (str: string): number => {
  // 1. Remove all non-numeric characters EXCEPT the decimal point (period or comma).
  const cleaned = str.replace(/[^0-9.,-]/g, '');

  // 2. Handle negative sign: Keep only the first one (if present) and make sure it's at the beginning.
  let negative = '';
  if (cleaned.startsWith('-')) {
    negative = '-';
  }
  const withoutNegative = cleaned.replace(/^-/, ''); // Remove initial negative sign


  //3. Determine the decimal separator (either comma or period), preferring the last occurrence
  let decimalSeparator = '';
  if (withoutNegative.lastIndexOf(',') > withoutNegative.lastIndexOf('.')) {
    decimalSeparator = ',';
  } else if (withoutNegative.lastIndexOf('.') > -1) {
    decimalSeparator = '.';
  }

  // 4. Remove thousands separators, keeping only the decimal point.
  let numberString = withoutNegative;

  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    const regex = new RegExp(thousandsSeparator === '.' ? '\\.' : thousandsSeparator, 'g');
    numberString = numberString.replace(regex, '');
  } else {
    // No decimal separator found, so remove all periods and commas.
    numberString = numberString.replace(/[.,]/g, '');
  }

  // 5. Replace the decimal separator with a period.
  if (decimalSeparator) {
    numberString = numberString.replace(decimalSeparator, '.');
  }

  return Number(negative + numberString);
}

/**
 * function to extract content from React Element returned by operations formatter
 *
 * @param element react node of the element 
 * @returns content of the react element
 */
export const extractTextFromReactElement = (element: ReactNode): string => {
  if (typeof element === 'string') {
    let trimmed = element.trim();
    if (trimmed.startsWith("@")) {
      // No space after @
      return trimmed;
    } else {
      // Add a space after other strings
      return trimmed + " ";
    }
  }

  if (typeof element === 'number') {
    return element.toString() + " ";
  }

  if (!React.isValidElement(element)) {
    return ''; // Or some other appropriate fallback
  }

  let text = '';

  if (Array.isArray(element)) {
    // Recursively process each element in the array
    element.forEach(child => {
      text += extractTextFromReactElement(child);
    });
    return text;
  }

  if (React.isValidElement(element) && typeof element.type === 'function' && element.props && element.props.tooltipContent != null && element.props.tooltipTrigger != null) {
    let trigger = extractTextFromReactElement(element.props.tooltipTrigger);
    let content = extractTextFromReactElement(element.props.tooltipContent).trimEnd();
    return `${trigger} (${content})`
  }

  if (React.isValidElement(element) && element.type === React.Fragment) {
    // Handle React Fragment ( <></> )

    React.Children.forEach(element.props.children, (child) => {

      text += extractTextFromReactElement(child);
    });
    return text
  }

  if (React.isValidElement(element) && typeof element.type === 'string' && element.type === "span" && element.props && element.props.className === 'text-link') {
    //It is a link
    React.Children.forEach(element.props.children, (child) => {

      text += extractTextFromReactElement(child);
    });
  }
  else {
    if (React.isValidElement(element) && element.props) {
      React.Children.forEach(element.props.children, (child) => {

        text += extractTextFromReactElement(child);
      });
    }
  }
  return text;
};