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
  json && Object.keys(json).forEach(key => {
    if (typeof json[key] === "object") {
      formatted[key] = formatJson(json[key]);
    } else {
      try {
        formatted[key] = JSON.parse(json[key]);
      } catch (error) {
        formatted[key] = json[key];
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
}