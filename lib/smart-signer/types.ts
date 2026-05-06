export type LoginMethod = 'keychain' | 'hivesigner';

export interface SmartSignerResponse {
  username: string;
  method: LoginMethod;
  accessToken?: string; // For Hivesigner
  success: boolean;
  error?: string;
}

export type KeyAuthorityType = 'Posting' | 'Active';

export interface ISmartSignerProvider {
 login(username?: string, message?: string): Promise<SmartSignerResponse>;
 broadcast(username: string, operations: any[], keyType?: KeyAuthorityType): Promise<any>;
}