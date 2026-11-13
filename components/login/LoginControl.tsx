import React, { useEffect, useState } from "react";
import { useAuth, LAST_USERNAME_KEY } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import {
  keychainErrorText,
  keychainSignIn,
} from "@/lib/smart-signer/keychainSignIn";
import { useI18n } from "@/i18n/i18n";
import { LogInIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { cn } from "@/lib/utils";
import LoggedUserNav from "./LoggedUserNav";
import LoginDialog from "./LoginDialog";
import { REQUEST_LOGIN_EVENT } from "@/utils/loginPrompt";
import { deploySettings } from "@/utils/deploySettings";

interface LoginControlProps {
  isMobile?: boolean;
}

const AuthLoadingSkeleton = ({ isMobile }: { isMobile?: boolean }) => (
  <div
    className={cn(
      "animate-pulse bg-secondary/20 border-navbar-border border rounded-[6px] flex items-center justify-center",
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

  // Pre-fill whoever last signed in on this device.
  useEffect(() => {
    if (!modalOpen) return;
    try {
      const last = localStorage.getItem(LAST_USERNAME_KEY);
      if (last) setInputUsername((prev) => prev || last);
    } catch {
      // Storage blocked: leave the field empty.
    }
  }, [modalOpen]);

  // Gated controls elsewhere in the app ask for the dialog rather than owning it.
  useEffect(() => {
    const openDialog = () => setModalOpen(true);
    window.addEventListener(REQUEST_LOGIN_EVENT, openDialog);
    return () => window.removeEventListener(REQUEST_LOGIN_EVENT, openDialog);
  }, []);

  const handleLoginRequest = async (method: "keychain" | "hivesigner") => {
    if (method === "keychain" && !inputUsername) {
      setError(t("auth.errorInvalidUser"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Hivesigner leaves the page; the callback finishes the sign-in.
      if (method === "hivesigner") {
        await SmartSigner.login("hivesigner");
        return;
      }

      const signInError = await keychainSignIn(
        inputUsername,
        t("auth.connectSecurely")
      );
      if (signInError !== null) {
        if (signInError) setError(keychainErrorText(t, signInError));
        return;
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
    } catch (e: any) {
      // SmartSigner.login() errors (extension not found, network, etc.)
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  };

  if (!deploySettings.login) return null;

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
            "flex items-center h-[35px] rounded-[6px] border-navbar-border border overflow-hidden bg-navbar hover:bg-secondary/50 transition-colors shadow-xs active:scale-95",
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
