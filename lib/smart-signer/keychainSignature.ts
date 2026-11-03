import { createHash } from "crypto";

import { getWaxChain } from "@/utils/waxClient";

// Keychain's signBuffer signs the SHA-256 of the UTF-8 message. Returns the
// public key that made the signature; throws on a malformed signature.
export const recoverSigningKey = async (
  message: string,
  signature: string
): Promise<string> => {
  const digest = createHash("sha256").update(message, "utf8").digest("hex");
  return (await getWaxChain()).getPublicKeyFromSignature(digest, signature);
};
