import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import { useI18n } from "@/i18n/i18n";
import { LogInIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { cn } from "@/lib/utils";
import LoggedUserNav from "./LoggedUserNav";
import LoginDialog from "./LoginDialog";

interface LoginControlProps {
  isMobile?: boolean;
}

const AuthLoadingSkeleton = ({ isMobile }: { isMobile?: boolean }) => (
  <div
    className={cn(
      "animate-pulse bg-secondary/20 border-navbar-border border-[1px] rounded-[6px] flex items-center justify-center",
      isMobile ? "w-[35px] h-[35px]" : "w-[110px] h-[35px]"
    )}
  >
    <Loader2 className="w-4 h-4 text-muted-foreground/30 animate-spin" />
  </div>
);

const LoginControl: React.FC<LoginControlProps> = ({ isMobile }) => {
  const { isLoggedIn, login, isInitializing } = useAuth();
  const { t } = useI18n();

  const [inputUsername, setInputUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginRequest = async (method: "keychain" | "hivesigner") => {
    if (method === "keychain" && !inputUsername) {
      setError(t("auth.errorInvalidUser"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loginMessage = t("auth.connectSecurely");
      const response = await SmartSigner.login(
        method,
        inputUsername,
        loginMessage
      );

      if (response.success) {
        if (method === "keychain") {
          if (response.signature && response.message) {
            const sessionRes = await fetch("/api/auth/keychain-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: inputUsername,
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
          const loginErr = await login(inputUsername, "keychain");
          if (loginErr) {
            if (loginErr.message === "NODE_TIMEOUT")
              setError(t("auth.nodeTimeout"));
            else if (loginErr.message === "auth.errorTooManyAttempts")
              setError(t("auth.errorTooManyAttempts"));
            else setError(loginErr.toString());
          } else {
            setModalOpen(false);
          }
        }
      } else if (response.error) {
        const errorMsg = response.error;
        // Check if the error is a translation token or a raw string
        if (errorMsg === "EXTENSION_NOT_FOUND")
          setError(t("auth.errorNoKeychain"));
        else if (errorMsg === "KEYCHAIN_TIMEOUT")
          setError(t("auth.keyChainTimeout"));
        else if (errorMsg === "auth.errorTooManyAttempts")
          setError(t("auth.errorTooManyAttempts"));
        else if (errorMsg.includes("User rejected"))
          setError(t("auth.errorUserCancelled"));
        else setError(errorMsg);
      }
    } catch (e: any) {
      // SmartSigner.login() errors (extension not found, network, etc.)
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  // --- INITIALIZING VIEW (SKELETON) ---
  if (isInitializing) {
    return <AuthLoadingSkeleton isMobile={isMobile} />;
  }

  // --- LOGGED IN VIEW ---
  if (isLoggedIn) {
    return <LoggedUserNav isMobile={isMobile} />;
  }

  // --- LOGGED OUT VIEW ---
  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(val) => {
        setModalOpen(val);
        if (!val) setError(null); // Reset error state on close
      }}
    >
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center h-[35px] rounded-[6px] border-navbar-border border-[1px] overflow-hidden bg-navbar hover:bg-secondary/50 transition-colors shadow-sm active:scale-95",
            isMobile ? "w-[35px] justify-center px-0" : "px-4"
          )}
        >
          <LogInIcon
            className={cn("w-5 h-5 text-primary", !isMobile && "mr-2")}
          />
          {!isMobile && (
            <span className="relative font-medium text-text">
              {t("auth.login")}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] p-0 border-none bg-transparent">
        <LoginDialog
          inputUsername={inputUsername}
          setInputUsername={setInputUsername}
          loading={loading}
          error={error}
          setError={setError}
          onKeychainLogin={() => handleLoginRequest("keychain")}
          onHivesignerLogin={() => handleLoginRequest("hivesigner")}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LoginControl;
