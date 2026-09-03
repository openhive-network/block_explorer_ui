import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { Client } from "@hiveio/dhive";
import Router from "next/router";
import { isInAppPath } from "@/utils/SafeUrl";
import { config } from "@/Config";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import {
  decompressBundle,
  decryptBundle,
  consumePendingHivesignerSync,
  applyBundle,
  cloudMatchesLastSync,
  saveLastSync,
  getInstanceMetadataKey,
  WORKSPACE_CLOUD_DIFFERS_EVENT,
} from "@/utils/workspaceSync";
import { getLayoutStorageKey } from "@/components/dashboard/lib/dashboard.config";

const hiveClient = new Client([config.nodeAddress]);

interface AuthContextType {
  username: string | null;
  avatar: string | null;
  method: "keychain" | "hivesigner" | null;
  accessToken: string | null;
  login: (
    username: string,
    method: "keychain" | "hivesigner"
  ) => Promise<Error | null>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [method, setMethod] = useState<"keychain" | "hivesigner" | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const methodRef = useRef(method);
  useEffect(() => {
    methodRef.current = method;
  }, [method]);

  const hasInitialized = useRef(false);

  const login = useCallback(
    async (
      user: string,
      authMethod: "keychain" | "hivesigner"
    ): Promise<Error | null> => {
      try {
        const nodeTimeout = config.security?.nodeTimeout || 8000;

        const account = (await Promise.race([
          hiveClient.database.getAccounts([user]).then((res) => res[0]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("NODE_TIMEOUT")), nodeTimeout)
          ),
        ])) as any;

        if (account) {
          // Run unconditionally: signals sync completion regardless of metadata propagation delay
          consumePendingHivesignerSync(user);

          try {
            const rawMeta = account.posting_json_metadata;
            if (rawMeta) {
              const meta = JSON.parse(rawMeta);
              const cloudCompressed = meta[getInstanceMetadataKey()];
              if (cloudCompressed) {
                const bundle = await decompressBundle(
                  await decryptBundle(cloudCompressed)
                );
                if (bundle) {
                  const hasLocalDashboard = !!localStorage.getItem(
                    getLayoutStorageKey(user)
                  );
                  if (!hasLocalDashboard) {
                    // Fresh device — restore silently and record baseline.
                    if (applyBundle(user, bundle)) saveLastSync(user, bundle);
                  } else if (!cloudMatchesLastSync(user, bundle)) {
                    // Same device but cloud differs from last known sync — notify user
                    window.dispatchEvent(
                      new CustomEvent(WORKSPACE_CLOUD_DIFFERS_EVENT, {
                        detail: {
                          bundle,
                          username: user,
                          compressed: cloudCompressed,
                        },
                      })
                    );
                  }
                }
              }
            }
          } catch {
            // Corrupt or missing metadata — proceed without restoring
          }

          setUsername(user);
          setMethod(authMethod);
          setAvatar(getHiveAvatarUrl(user));

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "hivescan_user",
              JSON.stringify({
                username: user,
                method: authMethod,
              })
            );
          }
          return null;
        } else {
          return new Error("USER_NOT_FOUND");
        }
      } catch (error) {
        console.error("Login Context Error:", error);
        return error instanceof Error ? error : new Error(String(error));
      }
    },
    []
  );

  const logout = useCallback(async () => {
    // Clear server-side session cookies (hivescan_auth, hivescan_session, hivescan_csrf)
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Failed to clear server session", e);
    }

    // 2. Clear all local state
    setUsername(null);
    setAvatar(null);
    setMethod(null);
    setAccessToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("hivescan_user");
      sessionStorage.removeItem("hs_auth_nonce");
      // Clean any pending sync nonce from the URL (in case logout happens before init completes)
      if (window.location.search.includes("sync_nonce")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuth = async () => {
      if (typeof window === "undefined") return;
      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_MOCK_USER
      ) {
        const mockUser = process.env.NEXT_PUBLIC_MOCK_USER;
        setUsername(mockUser);
        setMethod("keychain");
        setAvatar(getHiveAvatarUrl(mockUser));
        setIsInitializing(false);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("code");
      const stateFromUrl = urlParams.get("state");

      let handledByHivesigner = false;

      // 1. Handle Hivesigner Authorization Code redirect
      if (codeFromUrl && stateFromUrl) {
        try {
          const state = JSON.parse(decodeURIComponent(stateFromUrl));
          const savedNonce = sessionStorage.getItem("hs_auth_nonce");

          if (state.nonce !== savedNonce) {
            // Stale or replayed callback URL — clean it and fall through to session restore.
            // Never log out the current user over a nonce mismatch.
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } else {
            // Valid callback — exchange the code for a session cookie
            const res = await fetch("/api/auth/hs-exchange", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: codeFromUrl }),
            });

            const data = await res.json();

            if (data.username) {
              sessionStorage.removeItem("hs_auth_nonce");
              const loginErr = await login(data.username, "hivesigner");
              // Only ever an in-app path: it comes back through the redirect.
              const returnTo = isInAppPath(state.origin) ? state.origin : "/";
              try {
                await Router.replace(returnTo);
              } catch {
                window.history.replaceState({}, document.title, returnTo);
              }
              if (!loginErr) handledByHivesigner = true;
            }
          }
        } catch (e) {
          console.error("Hivesigner callback error", e);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }

      // 2. Restore saved session (runs whenever Hivesigner didn't complete a fresh login)
      if (!handledByHivesigner) {
        try {
          const saved = localStorage.getItem("hivescan_user");
          if (saved) {
            const { username, method } = JSON.parse(saved);
            await login(username, method);
          }
        } catch (e) {
          console.error("Auth initialization failure", e);
        }
      }

      setIsInitializing(false);
    };
    initializeAuth();
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        username,
        avatar,
        method,
        accessToken,
        login,
        logout,
        isLoggedIn: !!username,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return context;
};
