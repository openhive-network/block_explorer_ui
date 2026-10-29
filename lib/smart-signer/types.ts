export const LOGIN_METHODS = ["keychain", "hivesigner"] as const;

export type LoginMethod = (typeof LOGIN_METHODS)[number];

export interface SmartSignerResponse {
  username: string;
  method: LoginMethod;
  accessToken?: string; // For Hivesigner
  success: boolean;
  error?: string;
  // Keychain login only — signature + message + challenge for server-side session issuance
  signature?: string;
  message?: string;
  challenge?: string;
}

export type KeyAuthorityType = "Posting" | "Active";

export interface ISmartSignerProvider {
  login(username?: string, message?: string): Promise<SmartSignerResponse>;
  broadcast(
    username: string,
    operations: any[],
    keyType?: KeyAuthorityType
  ): Promise<any>;
}
