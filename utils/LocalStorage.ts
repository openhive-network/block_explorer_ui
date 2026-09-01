export const GUEST_STORAGE_SCOPE = "guest";

// Public pages have logged-out readers, so no username scopes to a guest bucket.
export const scopedStorageKey = (key: string, username?: string | null) =>
  `${key}_${username || GUEST_STORAGE_SCOPE}`;

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
