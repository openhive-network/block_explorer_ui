import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Client } from '@hiveio/dhive';
import { config } from "@/Config";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

interface AuthContextType {
    username: string | null;
    avatar: string | null;
    method: 'keychain' | 'hivesigner' | null;
    accessToken: string | null; 
    login: (username: string, method: 'keychain' | 'hivesigner') => Promise<void>;
    logout: () => void;
    isLoggedIn: boolean;
    isInitializing: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [method, setMethod] = useState<'keychain' | 'hivesigner' | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const login = useCallback(async (user: string, authMethod: 'keychain' | 'hivesigner') => {
        const client = new Client([config.nodeAddress]);
        try {
            // Use config for node timeout, fallback to 8s if missing
            const nodeTimeout = config.security?.nodeTimeout || 8000;

            const account = await Promise.race([
                client.database.getAccounts([user]).then(res => res[0]),
                new Promise((_, reject) => setTimeout(() => reject(new Error("NODE_TIMEOUT")), nodeTimeout))
            ]) as any;

            if (account) {
                setUsername(user);
                setMethod(authMethod);
                setAvatar(getHiveAvatarUrl(user));
                
                if (typeof window !== 'undefined') {
                    // We only store the basic info. 
                    // HS tokens are in HttpOnly cookies (JS can't see them)
                    // Keychain doesn't use tokens.
                    localStorage.setItem('hivescan_user', JSON.stringify({ 
                        username: user, 
                        method: authMethod 
                    }));
                }
            } else {
                throw new Error("USER_NOT_FOUND");
            }
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        // 1. If Hivesigner, tell the server to wipe the HttpOnly cookie
        if (method === 'hivesigner') {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) {
                console.error("Failed to clear server session", e);
            }
        }

        // 2. Clear all local state
        setUsername(null);
        setAvatar(null);
        setMethod(null);
        setAccessToken(null);
        
        if (typeof window !== 'undefined') {
            localStorage.removeItem('hivescan_user');
            sessionStorage.removeItem('hs_auth_nonce');
        }
    }, [method]);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') return;
            
            const urlParams = new URLSearchParams(window.location.search);
            const codeFromUrl = urlParams.get('code');
            const stateFromUrl = urlParams.get('state');

            try {
                // CASE 1: HIVESIGNER REDIRECT (Authorization Code Flow)
                if (codeFromUrl && stateFromUrl) {
                    const state = JSON.parse(decodeURIComponent(stateFromUrl));
                    const savedNonce = sessionStorage.getItem('hs_auth_nonce');

                    // Security: CSRF Verification
                    if (state.nonce !== savedNonce) {
                        throw new Error("CSRF_SPOOF_DETECTED");
                    }

                    // Exchange code for token via our private API
                    const res = await fetch('/api/auth/hs-exchange', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: codeFromUrl }),
                    });

                    const data = await res.json();
                    
                    if (data.username) {
                        sessionStorage.removeItem('hs_auth_nonce');
                        // The token is now in an HttpOnly cookie set by the server
                        await login(data.username, 'hivesigner'); 
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } 
                // CASE 2: PAGE REFRESH (Persistent Session)
                else {
                    const saved = localStorage.getItem('hivescan_user');
                    if (saved) {
                        const { username, method } = JSON.parse(saved);
                        // If HS: Browser sends cookie automatically. If Keychain: No token needed.
                        await login(username, method);
                    }
                }
            } catch (e) {
                console.error("Auth initialization failed", e);
                if (codeFromUrl) logout();
            } finally {
                setIsInitializing(false);
            }
        };
        initializeAuth();
    }, [login, logout]);

    return (
        <AuthContext.Provider value={{ username, avatar, method, accessToken, login, logout, isLoggedIn: !!username, isInitializing }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthContextProvider");
    return context;
};