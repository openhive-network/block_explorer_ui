import { ISmartSignerProvider, SmartSignerResponse } from '../types';
import { config } from "@/Config";

export function buildProposalVoteSignUrl(
  username: string,
  proposalId: number,
  approve: boolean,
  redirectUri: string
): string {
  // PeakD format: proposal_ids=["350"] (JSON array of string IDs)
  const proposalIds = encodeURIComponent(JSON.stringify([String(proposalId)]));
  return (
    `${config.hivesigner.endpoints.baseUrl}/sign/update_proposal_votes` +
    `?voter=${encodeURIComponent(username)}` +
    `&proposal_ids=${proposalIds}` +
    `&approve=${approve}` +
    `&extensions=` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

export const HivesignerProvider: ISmartSignerProvider = {
  async login(): Promise<SmartSignerResponse> {
    const callbackURL = config.hivesigner.defaultCallBack;
    
    // CRYPTOGRAPHICALLY SECURE NONCE GENERATION
    const array = new Uint32Array(2);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for SSR
      throw new Error("Security Error: Cryptographic environment not available");
    }
    
    const nonce = Array.from(array, (num) => num.toString(36)).join('');

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
        client_id: (config.hivesigner.app) as string,
        redirect_uri: callbackURL as string,
        response_type: 'code', 
        scope: (config.hivesigner.scope.join(',')) as string,
        state: state as string
    });

    window.location.href = `${baseUrl}?${params.toString()}`;
    return { username: '', method: 'hivesigner', success: true };
  },

  async broadcast(_username, operations, _keyType) {
    // Helper to read the CSRF cookie value
    const getCsrfTokenFromCookie = () => {
        if (typeof document === 'undefined') return '';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; hivescan_csrf=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
        return '';
    };

    // PROXY BROADCAST with Double-Submit CSRF header
    const response = await fetch('/api/auth/broadcast', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfTokenFromCookie() 
      },
      body: JSON.stringify({ operations }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error_description || result.error);
    return result;
  }
};