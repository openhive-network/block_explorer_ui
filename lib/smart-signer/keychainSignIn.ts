import { SmartSigner } from "./index";

// Signs the login message with Keychain, then opens the server session. Shared
// by the login dialog and the account switcher. Returns null on success, or
// Keychain's error ("" when it gave none; see keychainErrorText). `beforeSession` runs only once the
// signature is in, so a cancelled prompt leaves the current session untouched.
export const keychainSignIn = async (
  username: string,
  message: string,
  beforeSession?: () => Promise<void>
): Promise<string | null> => {
  const response = await SmartSigner.login("keychain", username, message);
  if (!response.success) return response.error ?? "";

  await beforeSession?.();
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
