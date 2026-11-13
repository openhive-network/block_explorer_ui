import { SmartSigner } from "./index";

// The server session could not be swapped over (see `strict`).
export const SESSION_FAILED = "SESSION_FAILED";

// Signs the login message with Keychain, then opens the server session. Shared
// by the login dialog and the account switcher. Returns null on success, or
// Keychain's error ("" when it gave none; see keychainErrorText).
// `beforeSession` runs only once the signature is in, so a cancelled prompt
// leaves the current session untouched. `strict` (the switcher) returns
// SESSION_FAILED when `beforeSession` throws or the session request fails,
// since the cookies may then belong to another account than the one shown.
export const keychainSignIn = async (
  username: string,
  message: string,
  {
    beforeSession,
    strict = false,
  }: { beforeSession?: () => Promise<void>; strict?: boolean } = {}
): Promise<string | null> => {
  const response = await SmartSigner.login("keychain", username, message);
  if (!response.success) return response.error ?? "";

  try {
    await beforeSession?.();
  } catch {
    return SESSION_FAILED;
  }
  if (response.signature && response.message) {
    const sessionRes = await fetch("/api/auth/keychain-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        message: response.message,
        signature: response.signature,
        challenge: response.challenge,
      }),
    }).catch((err) => {
      console.warn("[workspace-sync] Session request failed:", err);
      return null;
    });
    if (sessionRes && !sessionRes.ok) {
      console.warn(
        "[workspace-sync] Session establishment failed:",
        sessionRes.status
      );
    }
    if (strict && !sessionRes?.ok) return SESSION_FAILED;
  }
  return null;
};

// The user dismissed the Keychain prompt.
export const isKeychainSignInCancel = (error: string): boolean =>
  error.includes("User rejected") || /cancel/i.test(error);

// A translated message for Keychain's sign-in errors; unknown ones pass through.
export const keychainErrorText = (
  t: (key: string) => string,
  error: string
): string => {
  if (error === "EXTENSION_NOT_FOUND") return t("auth.errorNoKeychain");
  if (error === "KEYCHAIN_TIMEOUT") return t("auth.keyChainTimeout");
  if (error === "auth.errorTooManyAttempts")
    return t("auth.errorTooManyAttempts");
  if (error.includes("User rejected")) return t("auth.errorUserCancelled");
  return error;
};
