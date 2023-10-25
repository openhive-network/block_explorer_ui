export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const addSpacesAndCapitalizeFirst = (text: string) => {
  return capitalizeFirst(text).replaceAll("_", " ");
};

export const isJson = (item: unknown) => {
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
 * properly formats json inlcuding nested json objects
 *
 * @param json json object
 * @returns formatted json
 */
export const formatJson = (json: { [key: string]: any }) => {
  let formatted = json;
  Object.keys(formatted).forEach((key) => {
    if (isJson(json[key])) {
      try {
        formatted[key] = JSON.parse(json[key]);
      } catch (error) {
        formatted[key] = json[key];
      }
    }
  });
  return JSON.stringify(formatted, null, 2);
};
