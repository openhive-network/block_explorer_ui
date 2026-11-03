import crypto from "crypto";
import { loadWithSettings, restoreEnv } from "./support/deployEnv";

type SessionModule = typeof import("@/lib/smart-signer/serverSession");

const load = (settings: Record<string, string> = {}) =>
  loadWithSettings<SessionModule>("@/lib/smart-signer/serverSession", settings);

// A token signed the way sessions were before the login method was recorded.
const legacyToken = (username: string) => {
  const key = new Uint8Array(
    crypto.hkdfSync(
      "sha256",
      Buffer.from(process.env.WORKSPACE_ENCRYPTION_KEY!, "hex"),
      new Uint8Array(0),
      Buffer.from("hivescan_session_signing_v1"),
      32
    )
  );
  const payload = Buffer.from(
    JSON.stringify({ sub: username, exp: Date.now() + 60_000 })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
};

describe("session login method", () => {
  afterEach(restoreEnv);

  it("accepts a session whose method is still allowed", () => {
    const { createSessionToken, getSessionUser } = load();
    const token = createSessionToken("alice", "keychain")!;
    expect(getSessionUser({ hivescan_session: token })).toBe("alice");
  });

  it("refuses a session whose method was excluded later", () => {
    const token = load().createSessionToken("alice", "keychain")!;
    const { getSessionUser } = load({ LOGIN_EXCLUDE: "keychain" });
    expect(getSessionUser({ hivescan_session: token })).toBeNull();
  });

  it("accepts a session without a method only while every method is allowed", () => {
    load();
    const token = legacyToken("alice");
    expect(load().getSessionUser({ hivescan_session: token })).toBe("alice");
    expect(
      load({ LOGIN_EXCLUDE: "hivesigner" }).getSessionUser({
        hivescan_session: token,
      })
    ).toBeNull();
  });

  it("refuses a token whose method was edited", () => {
    const { createSessionToken, getSessionUser } = load({
      LOGIN_EXCLUDE: "keychain",
    });
    const [payload, sig] = load()
      .createSessionToken("alice", "keychain")!
      .split(".");
    const edited = Buffer.from(
      Buffer.from(payload, "base64url")
        .toString()
        .replace("keychain", "hivesigner")
    ).toString("base64url");
    expect(createSessionToken).toBeDefined();
    expect(getSessionUser({ hivescan_session: `${edited}.${sig}` })).toBeNull();
  });
});
