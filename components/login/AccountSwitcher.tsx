import React, { useId, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import HiveAvatar from "@/components/ui/HiveAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import { SmartSigner } from "@/lib/smart-signer";
import {
  SESSION_FAILED,
  isKeychainSignInCancel,
  keychainErrorText,
  keychainSignIn,
} from "@/lib/smart-signer/keychainSignIn";
import { isLoginMethodEnabled } from "@/utils/deploySettings";
import { getImageSrc } from "@/utils/PathUtils";
import {
  RememberedAccount,
  forgetAccount,
  readRememberedAccounts,
} from "@/utils/rememberedAccounts";

const METHOD_LOGOS = {
  keychain: "/logos/keychain.png",
  hivesigner: "/logos/hivesigner.svg",
} as const;

// Clears the current account's server cookies. Keychain sign-in replaces only
// the session cookie, so a Hivesigner token would otherwise outlive the switch.
// Throws when that may not have happened, which fails the switch.
const clearServerSession = async () => {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error(`logout_failed_${res.status}`);
};

// The switch in progress. Module-level, not state: closing the menu unmounts
// the switcher, and a reopened one must not start a second switch alongside.
let switchInFlight: string | null = null;
const markSwitchInFlight = (target: string | null) => {
  switchInFlight = target;
};

// The other accounts that have signed in on this device, one click away.
// Mounted only while the user menu is open, so it reads storage fresh each time.
const AccountSwitcher = ({ onSwitched }: { onSwitched: () => void }) => {
  const { username, login, logout } = useAuth();
  const { t } = useI18n();
  const [accounts, setAccounts] = useState(readRememberedAccounts);
  const [switchingTo, setSwitchingToState] = useState(() => switchInFlight);
  const setSwitchingTo = (target: string | null) => {
    markSwitchInFlight(target);
    setSwitchingToState(target);
  };
  const headingId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const others = accounts.filter(
    (account) =>
      account.username !== username && isLoginMethodEnabled(account.method)
  );
  if (!others.length) return null;

  const switchTo = async ({ username: target, method }: RememberedAccount) => {
    if (switchInFlight) return;
    setSwitchingTo(target);

    // Hivesigner leaves the page; its callback signs in whichever account
    // approves there and replaces every cookie. Coming back without approving
    // keeps this session.
    if (method === "hivesigner") {
      try {
        await SmartSigner.login("hivesigner");
      } catch {
        setSwitchingTo(null);
        toast.error(t("auth.switchFailed", { account: target }));
      }
      return;
    }

    try {
      const signInError = await keychainSignIn(
        target,
        t("auth.connectSecurely"),
        { beforeSession: clearServerSession, strict: true }
      );
      if (signInError === SESSION_FAILED) {
        // The cookies may now belong to neither account shown: sign out.
        await logout();
        toast.error(t("auth.switchFailed", { account: target }));
        return;
      }
      if (signInError !== null) {
        if (signInError && !isKeychainSignInCancel(signInError))
          toast.error(keychainErrorText(t, signInError));
        return;
      }
      const loginError = await login(target, "keychain");
      if (loginError) {
        // The old account's cookies are gone and the session is the new
        // account's: staying signed in as the old one would encrypt its
        // workspace under the wrong session. Sign out instead.
        await logout();
        toast.error(t("auth.switchFailed", { account: target }));
        return;
      }
      toast.success(t("auth.switchedTo", { account: target }));
      onSwitched();
    } finally {
      setSwitchingTo(null);
    }
  };

  const forget = (target: string, index: number) => {
    forgetAccount(target);
    setAccounts(readRememberedAccounts());
    // The focused button is gone: move to the row that takes its place.
    requestAnimationFrame(() => {
      const rows = listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-switch-target]"
      );
      if (rows?.length) rows[Math.min(index, rows.length - 1)].focus();
    });
  };

  return (
    <div
      ref={listRef}
      role="group"
      aria-labelledby={headingId}
      className="mb-1.5 rounded-xl border border-border/30 p-1"
      data-testid="account-switcher"
    >
      <p
        id={headingId}
        className="px-1.5 pb-0.5 pt-1 text-[10px] uppercase tracking-wider text-text/70"
      >
        {t("auth.switchAccount")}
      </p>
      {others.map((account, index) => (
        <div
          key={account.username}
          className="flex items-center rounded-lg hover:bg-secondary/60"
          data-testid="switch-account-row"
        >
          <button
            type="button"
            onClick={() => switchTo(account)}
            data-switch-target
            disabled={!!switchingTo}
            aria-busy={switchingTo === account.username}
            aria-label={t("auth.switchTo", { account: account.username })}
            className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1.5 text-start text-sm font-medium text-text disabled:cursor-wait disabled:opacity-60"
          >
            {switchingTo === account.username ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <HiveAvatar
                accountName={account.username}
                alt=""
                size={20}
                className="h-5 w-5 shrink-0 border border-border/50"
              />
            )}
            {/* ltr keeps the "@" in front in RTL locales. */}
            <span dir="ltr" className="truncate">
              @{account.username}
            </span>
            <img
              src={getImageSrc(METHOD_LOGOS[account.method])}
              alt=""
              width={12}
              height={12}
              className="ms-auto shrink-0 opacity-70"
            />
          </button>
          <button
            type="button"
            onClick={() => forget(account.username, index)}
            disabled={!!switchingTo}
            aria-label={t("auth.forgetAccount", { account: account.username })}
            title={t("auth.forgetAccount", { account: account.username })}
            className="me-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text/50 hover:bg-secondary hover:text-text disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AccountSwitcher;
