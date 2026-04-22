import { ISmartSignerProvider, SmartSignerResponse } from '../types';
import { config } from "@/Config";

const getDynamicCallbackUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/`;
  }
  return config.hivesigner.defaultCallBack;
};

export const HivesignerProvider: ISmartSignerProvider = {
  async login(): Promise<SmartSignerResponse> {
    const callbackURL = getDynamicCallbackUrl();
    const nonce = Math.random().toString(36).substring(2, 15);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hs_auth_nonce', nonce);
    }

    const stateData = { 
      method: 'hivesigner',
      nonce: nonce,
      origin: typeof window !== 'undefined' ? window.location.pathname : '/'
    };
    
    const state = encodeURIComponent(JSON.stringify(stateData));
    const baseUrl = config.hivesigner.endpoints.authorize;
    
    const params = new URLSearchParams({
        client_id: (config.hivesigner.app || 'hivescan.info') as string,
        redirect_uri: callbackURL as string,
        response_type: 'code', 
        scope: (config.hivesigner.scope.join(',')) as string,
        state: state as string
    });

    window.location.href = `${baseUrl}?${params.toString()}`;
    return { username: '', method: 'hivesigner', success: true };
  },

  async broadcast(username, operations) {
    // PROXY BROADCAST: We call our own API which has the HttpOnly cookie
    const response = await fetch('/api/auth/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error_description || result.error);
    return result;
  }
};