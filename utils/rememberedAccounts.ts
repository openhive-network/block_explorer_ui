import { LOGIN_METHODS, LoginMethod } from "@/lib/smart-signer/types";

// Accounts that have signed in on this device, newest first, for the user
// menu's quick switch. Device-level like LAST_USERNAME_KEY, and only public
// data: a name and how it signed in, never a key or token.
export const REMEMBERED_ACCOUNTS_KEY = "hivescan_remembered_accounts";
export const MAX_REMEMBERED_ACCOUNTS = 5;

export interface RememberedAccount {
  username: string;
  method: LoginMethod;
}

// Hive account names: 3-16 chars, lowercase letters, digits, dots and dashes.
const ACCOUNT_NAME = /^[a-z][a-z0-9.-]{2,15}$/;

const isRememberedAccount = (value: unknown): value is RememberedAccount => {
  const entry = value as RememberedAccount | null;
  return (
    typeof entry?.username === "string" &&
    ACCOUNT_NAME.test(entry.username) &&
    (LOGIN_METHODS as readonly string[]).includes(entry.method)
  );
};

export const readRememberedAccounts = (): RememberedAccount[] => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) ?? "[]"
    );
    if (!Array.isArray(parsed)) return [];
    // Copy only the known fields, so nothing else stored under the key survives.
    return parsed
      .filter(isRememberedAccount)
      .slice(0, MAX_REMEMBERED_ACCOUNTS)
      .map(({ username, method }) => ({ username, method }));
  } catch {
    return [];
  }
};

const write = (accounts: RememberedAccount[]) => {
  try {
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage blocked or full: the switch list just stays as it was.
  }
};

// Moves the account to the front, updating how it signed in.
export const rememberAccount = (username: string, method: LoginMethod) => {
  const entry = { username, method };
  if (!isRememberedAccount(entry)) return;
  write(
    [
      entry,
      ...readRememberedAccounts().filter((a) => a.username !== username),
    ].slice(0, MAX_REMEMBERED_ACCOUNTS)
  );
};

export const forgetAccount = (username: string) => {
  write(readRememberedAccounts().filter((a) => a.username !== username));
};
