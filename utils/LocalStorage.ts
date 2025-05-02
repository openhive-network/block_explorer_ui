export const getLocalStorage = (key: string, asObject: boolean = false) => {
  const result = localStorage.getItem(key) as string;
  return asObject ? JSON.parse(result) : result;
};

export const setLocalStorage = (key: string, value: unknown) => {
  const stringValue = JSON.stringify(value);
  localStorage.setItem(key, stringValue);
};

export const removeStorageItem = (key: string) => {
  return localStorage.removeItem(key);
};
