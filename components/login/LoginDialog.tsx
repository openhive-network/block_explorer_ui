import React from "react";
import { useI18n } from "@/i18n/i18n";
import { 
    User, ChevronRight, Loader2, 
    ShieldCheck, 
} from "lucide-react";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import ErrorMessage from "../ErrorMessage";
import Image from "next/image";
import keychainLogo from "@/lib/smart-signer/logo/keychain.png";
import Hslogo from "@/lib/smart-signer/logo/hivesigner.svg";

interface LoginDialogProps {
    inputUsername: string;
    setInputUsername: (val: string) => void;
    loading: boolean;
    error: string | null;
    setError: (val: string | null) => void;
    onKeychainLogin: () => void;
    onHivesignerLogin: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
    inputUsername,
    setInputUsername,
    loading,
    error,
    setError,
    onKeychainLogin,
    onHivesignerLogin
}) => {
    const { t } = useI18n();

    return (
        <div className="overflow-hidden border-none bg-theme shadow-2xl rounded-3xl">
            {/* Decorative Top Bar */}
            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 w-full" />

            <div className="p-8">
                <DialogHeader className="mb-6 text-text text-left">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-extrabold tracking-tight">
                        {t("auth.signIn")}
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                        {t("auth.connectSecurely")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <ErrorMessage 
                        message={error} 
                        onClose={() => setError(null)} 
                        isWarning={true} 
                    />

                    {/* Username Input Section */}
                    <div className="space-y-2">
                        <label className="text-xs text-explorer-dark-gray dark:text-white font-bold uppercase tracking-widest ml-1">
                            {t("auth.usernameLabel")}
                        </label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value.toLowerCase())}
                                placeholder={t("auth.usernamePlaceholder")}
                                className="w-full h-14 pl-12 pr-4 bg-secondary/20 rounded-2xl border border-border text-text placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg font-medium shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {/* Keychain Method Card */}
                        <button
                            onClick={onKeychainLogin}
                            disabled={loading || !inputUsername}
                            className={cn(
                                "relative flex items-center justify-between p-5 rounded-2xl border border-border bg-secondary/30 transition-all duration-300 shadow-sm",
                                "hover:bg-secondary/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 group active:scale-[0.98]",
                                "disabled:opacity-40 disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-110 transition-transform text-primary">
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Image alt="logo" width={40} height={40} src={keychainLogo} style={{ height: 'auto' }}
                                    />}
                                </div>
                                <div className="text-left text-text">
                                    <p className="text-md font-bold">{t("auth.keychain")}</p>
                                    <p className="text-xs text-muted-foreground">{t("auth.keychainDescription")}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </button>

                        {/* Hivesigner Method Card */}
                        <button
                            onClick={onHivesignerLogin}
                            disabled={loading}
                            className={cn(
                                "w-full relative flex items-center justify-between p-5 rounded-2xl border border-border bg-secondary/30 transition-all duration-300 shadow-sm",
                                "hover:bg-secondary/50 hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1 group active:scale-[0.98]",
                                "disabled:opacity-40"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20 shadow-sm group-hover:scale-110 transition-transform">
                                    <Image alt="logo" width={30} height={30} src={Hslogo} style={{ height: 'auto' }} />
                                </div>
                                <div className="text-left text-text">
                                    <p className="text-md font-bold">Hivesigner</p>
                                    <p className="text-xs text-explorer-dark-gray dark:text-text">
                                        {t("auth.hivesignermessage")}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-explorer-dark-gray group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="pt-2 text-center text-muted-foreground">
                        <p className="text-xs">
                            {t("auth.newToHive")}{" "}
                            <a href="https://signup.hive.io" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-4 decoration-primary/30 text-primary transition-all">
                                {t("auth.createAccount")}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginDialog;