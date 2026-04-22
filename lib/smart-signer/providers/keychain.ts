import { ISmartSignerProvider, SmartSignerResponse } from '../types';
import { config } from "@/Config";

declare global {
  interface Window {
    hive_keychain: any;
  }
}

export const KeychainProvider: ISmartSignerProvider = {
  async login(username: string, message: string = "Login to Hivescan"): Promise<SmartSignerResponse> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.hive_keychain) {
        return resolve({ username: '', method: 'keychain', success: false, error: "EXTENSION_NOT_FOUND" });
      }

      let isResolved = false;

      // Use timeout from central config
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve({ username: '', method: 'keychain', success: false, error: "KEYCHAIN_TIMEOUT" });
        }
      }, config.security.keychainTimeout);

      window.hive_keychain.requestSignBuffer(username, message, "Posting", (response: any) => {
        if (isResolved) return; // Ignore if timeout already triggered
        
        isResolved = true;
        clearTimeout(timeout);

        if (response.success) {
          resolve({ username, method: 'keychain', success: true });
        } else {
          resolve({ username: '', method: 'keychain', success: false, error: response.message });
        }
      });
    });
  },

  async broadcast(username, operations) {
    return new Promise((resolve, reject) => {
      if (!window.hive_keychain) return reject("Extension not found");

      const timeout = setTimeout(() => {
        reject("KEYCHAIN_TIMEOUT");
      }, config.security.keychainTimeout);

      window.hive_keychain.requestBroadcast(username, operations, 'Posting', (response: any) => {
        clearTimeout(timeout);
        response.success ? resolve(response) : reject(response.message);
      });
    });
  }
};