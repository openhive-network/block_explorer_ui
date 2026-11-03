import { execFileSync } from "child_process";
import path from "path";

// Signed with dhive (PrivateKey.fromSeed("seed-one")) over SHA-256 of the
// message, the digest Keychain's signBuffer signs. Recovering it with wax
// shows the switch from dhive keeps Keychain logins working (#838).
const MESSAGE = "hivescan.info login nonce 1234 ünïcode";
const DIGEST =
  "8d832625079d5855ea050de1005013b3a4f9ef19124f182faf337a14c89be682";
const SIGNATURE =
  "1f49408a840194c90456adcca1df3c18180832a73d8932833bbbe8c42155d3265274425060082688ee10fc1ea952bebaa6af9d86667752824144f6912c24c62395";
const PUBLIC_KEY = "STM6bZvVuSCPqnVcyTHpyN3zeohSxJbr2XDm4ijU1gZ1e1u91SUjy";

const mockRecover = jest.fn();
jest.mock("@/utils/waxClient", () => ({
  getWaxChain: async () => ({
    getPublicKeyFromSignature: (...args: unknown[]) => mockRecover(...args),
  }),
}));

import { recoverSigningKey } from "@/lib/smart-signer/keychainSignature";

const waxRecover = (digest: string, signature: string) =>
  execFileSync(
    process.execPath,
    [path.join(__dirname, "support", "waxRecover.mjs"), digest, signature],
    { encoding: "utf8", stdio: "pipe" }
  );

describe("recoverSigningKey", () => {
  it("asks wax to recover from the SHA-256 of the UTF-8 message", async () => {
    mockRecover.mockReturnValue(PUBLIC_KEY);
    await expect(recoverSigningKey(MESSAGE, SIGNATURE)).resolves.toBe(
      PUBLIC_KEY
    );
    expect(mockRecover).toHaveBeenCalledWith(DIGEST, SIGNATURE);
  });
});

describe("wax signature recovery", () => {
  it("recovers the key a Keychain signature was made with", () => {
    expect(waxRecover(DIGEST, SIGNATURE)).toBe(PUBLIC_KEY);
  });

  it("recovers a different key when the message changed", () => {
    const otherDigest = "00".repeat(32);
    expect(waxRecover(otherDigest, SIGNATURE)).not.toBe(PUBLIC_KEY);
  });

  it("rejects a malformed signature", () => {
    expect(() => waxRecover(DIGEST, "not-a-signature")).toThrow();
  });
});
