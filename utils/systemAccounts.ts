import { ACCOUNT_LABELS } from "@/utils/accountLabels";

// Treasury (DAO/DHF) + burn accounts, derived from the labels map. Excluded from
// concentration / supply-share so they don't inflate the numbers past 100%.
export const SYSTEM_ACCOUNTS = new Set(
  Object.entries(ACCOUNT_LABELS)
    .filter(([, v]) => v.type === "treasury" || v.type === "burn")
    .map(([account]) => account)
);

export const isSystemAccount = (account: string): boolean =>
  SYSTEM_ACCOUNTS.has(account);
