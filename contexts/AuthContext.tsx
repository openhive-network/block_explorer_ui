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
import { config } from "@/Config";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

const hiveClient = new Client([config.nodeAddress]);

interface AuthContextType {
  username: string | null;
  avatar: string | null;
  method: "keychain" | "hivesigner" | null;
  accessToken: string | null;
  login: (username: string, method: "keychain" | "hivesigner") => Promise<void>;
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
    async (user: string, authMethod: "keychain" | "hivesigner") => {
      try {
        const nodeTimeout = config.security?.nodeTimeout || 8000;

        const account = (await Promise.race([
          hiveClient.database.getAccounts([user]).then((res) => res[0]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("NODE_TIMEOUT")), nodeTimeout)
          ),
        ])) as any;

        if (account) {
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
        } else {
          throw new Error("USER_NOT_FOUND");
        }
      } catch (error) {
        console.error("Login Context Error:", error);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    // 1. If Hivesigner, tell the server to wipe the HttpOnly cookie
    if (method === "hivesigner") {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        console.error("Failed to clear server session", e);
      }
    }

    // 2. Clear all local state
    setUsername(null);
    setAvatar(null);
    setMethod(null);
    setAccessToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("hivescan_user");
      sessionStorage.removeItem("hs_auth_nonce");
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

      try {
        // 1. Handle secure Authorization Code redirect
        if (codeFromUrl && stateFromUrl) {
          const state = JSON.parse(decodeURIComponent(stateFromUrl));
          const savedNonce = sessionStorage.getItem("hs_auth_nonce");

          // Security: CSRF Verification
          if (state.nonce !== savedNonce) {
            throw new Error("CSRF_SPOOF_DETECTED");
          }

          // Exchange code for HttpOnly cookie via private API
          const res = await fetch("/api/auth/hs-exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeFromUrl }),
          });

          const data = await res.json();

          if (data.username) {
            sessionStorage.removeItem("hs_auth_nonce");
            await login(data.username, "hivesigner");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
        // 2. Handle page refresh/returning session
        else {
          const saved = localStorage.getItem("hivescan_user");
          if (saved) {
            const { username, method } = JSON.parse(saved);
            await login(username, method);
          }
        }
      } catch (e) {
        console.error("Auth initialization failure");
        if (codeFromUrl) logout();
      } finally {
        setIsInitializing(false);
      }
    };
    initializeAuth();
  }, [login, logout]);

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
