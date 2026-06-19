import {
  ISmartSignerProvider,
  KeyAuthorityType,
  SmartSignerResponse,
} from "../types";
import { config } from "@/Config";

declare global {
  interface Window {
    hive_keychain: any;
  }
}

export const KeychainProvider: ISmartSignerProvider = {
  async login(
    username: string,
    message: string = "Login to Hivescan"
  ): Promise<SmartSignerResponse> {
    if (typeof window === "undefined" || !window.hive_keychain) {
      return {
        username: "",
        method: "keychain",
        success: false,
        error: "EXTENSION_NOT_FOUND",
      };
    }

    // Fetch a server-issued challenge to embed in the signed message.
    // This makes every login message unique, preventing static-message replay.
    // Falls back to plain message if the server doesn't support challenges.
    let signedMessage = message;
    let challengeToken: string | undefined;
    try {
      const res = await fetch("/api/auth/keychain-challenge");
      if (res.ok) {
        const { token, nonce } = await res.json();
        signedMessage = `${message} [${nonce}]`;
        challengeToken = token;
      }
    } catch {
      // challenge endpoint unreachable — proceed without nonce (degraded security)
    }

    return new Promise((resolve) => {
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve({
            username: "",
            method: "keychain",
            success: false,
            error: "KEYCHAIN_TIMEOUT",
          });
        }
      }, config.security.keychainTimeout);

      window.hive_keychain.requestSignBuffer(
        username,
        signedMessage,
        "Posting",
        (response: any) => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timeout);

          if (response.success) {
            resolve({
              username,
              method: "keychain",
              success: true,
              signature: response.result,
              message: signedMessage,
              challenge: challengeToken,
            });
          } else {
            resolve({
              username: "",
              method: "keychain",
              success: false,
              error: response.message,
            });
          }
        }
      );
    });
  },

  async broadcast(username, operations, keyType: KeyAuthorityType = "Posting") {
    return new Promise((resolve, reject) => {
      if (!window.hive_keychain) return reject("Extension not found");

      const timeout = setTimeout(() => {
        reject("KEYCHAIN_TIMEOUT");
      }, config.security.keychainTimeout);

      window.hive_keychain.requestBroadcast(
        username,
        operations,
        keyType,
        (response: any) => {
          clearTimeout(timeout);
          response.success ? resolve(response) : reject(response.message);
        }
      );
    });
  },
};
