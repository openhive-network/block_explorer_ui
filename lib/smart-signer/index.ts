// lib/smart-signer/index.ts
import { KeyAuthorityType, LoginMethod, SmartSignerResponse } from './types';
import { KeychainProvider } from './providers/keychain';
import { HivesignerProvider } from './providers/hivesigner';

export class SmartSigner {
  static async login(method: LoginMethod, username?: string, message?: string): Promise<SmartSignerResponse> {
    switch (method) {
      case 'keychain':
        return await KeychainProvider.login(username, message);
      case 'hivesigner':
        return await HivesignerProvider.login();
      default:
        throw new Error(`Method ${method} not implemented in SmartSigner`);
    }
  }

  static async broadcast(
    username: string,
    method: LoginMethod,
    operations: any[],
    keyType: KeyAuthorityType = 'Posting'
  ) {
    switch (method) {
      case 'keychain':
        return await KeychainProvider.broadcast(username, operations, keyType);
      case 'hivesigner':
        return await HivesignerProvider.broadcast(username, operations, keyType);
      default:
        throw new Error("Broadcasting method not supported");
    }
  }
}