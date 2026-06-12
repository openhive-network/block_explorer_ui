import crypto from "crypto";

// Session tokens are HMAC-SHA256 signed payloads.
// Format: base64url(JSON payload) + "." + base64url(HMAC signature)
// Signing and challenge keys are derived from WORKSPACE_ENCRYPTION_KEY via HKDF so they
// are cryptographically independent from the AES-256-GCM encryption key.

function deriveKey(keyHex: string, context: string): Uint8Array {
  const ikm = new Uint8Array(Buffer.from(keyHex, "hex"));
  const salt = new Uint8Array(0);
  const info = new Uint8Array(Buffer.from(context));
  return new Uint8Array(crypto.hkdfSync("sha256", ikm, salt, info, 32));
}

function getSigningKey(keyHex: string): Uint8Array {
  return deriveKey(keyHex, "hivescan_session_signing_v1");
}

function getChallengeKey(keyHex: string): Uint8Array {
  return deriveKey(keyHex, "hivescan_challenge_signing_v1");
}

export function createSessionToken(username: string): string | null {
  const keyHex = process.env.WORKSPACE_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) return null;

  const signingKey = getSigningKey(keyHex);
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = Buffer.from(JSON.stringify({ sub: username, exp })).toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", signingKey)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  const keyHex = process.env.WORKSPACE_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) return null;

  try {
    const signingKey = getSigningKey(keyHex);
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    const expected = crypto
      .createHmac("sha256", signingKey)
      .update(payload)
      .digest("base64url");
    const expectedBuf = new Uint8Array(Buffer.from(expected, "base64url"));
    const actualBuf = new Uint8Array(Buffer.from(sig, "base64url"));
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;

    const { sub, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );
    if (typeof sub !== "string" || typeof exp !== "number") return null;
    if (exp < Date.now()) return null;
    return sub;
  } catch {
    return null;
  }
}

// Returns the authenticated username from the request cookies, or null if not authenticated.
// Accepts hivescan_session (all methods) or hivescan_auth (Hivesigner legacy fallback).
export function getSessionUser(
  cookies: Partial<Record<string, string>>
): string | null {
  const sessionToken = cookies["hivescan_session"];
  if (sessionToken) {
    const username = verifySessionToken(sessionToken);
    if (username) return username;
  }
  // Legacy fallback: Hivesigner users who logged in before session cookies were introduced.
  // hivescan_auth is HttpOnly and set only by our server, so its presence is trustworthy.
  // Returns a sentinel — callers must only use this for auth gating, not as a real username.
  if (cookies["hivescan_auth"]) return "__hivesigner__";
  return null;
}

// Use this for pure auth-gating — avoids accidentally treating the sentinel as a username.
export function isAuthenticated(
  cookies: Partial<Record<string, string>>
): boolean {
  return getSessionUser(cookies) !== null;
}

// --- Keychain login challenge (stateless, HMAC-signed, 5-min expiry) ---
// The challenge embeds a one-time nonce that the client must include verbatim in the
// message signed by Keychain. The server verifies the challenge signature + nonce match
// before accepting the Keychain signature, preventing static-message replay.

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function createChallengeToken(): {
  token: string;
  nonce: string;
} | null {
  const keyHex = process.env.WORKSPACE_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) return null;

  const challengeKey = getChallengeKey(keyHex);
  const nonce = crypto.randomBytes(16).toString("hex");
  const exp = Date.now() + CHALLENGE_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ nonce, exp })).toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", challengeKey)
    .update(payload)
    .digest("base64url");
  return { token: `${payload}.${sig}`, nonce };
}

// Returns the nonce if the challenge token is valid and unexpired, otherwise null.
export function verifyChallengeToken(token: string): string | null {
  const keyHex = process.env.WORKSPACE_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) return null;

  try {
    const challengeKey = getChallengeKey(keyHex);
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    const expected = crypto
      .createHmac("sha256", challengeKey)
      .update(payload)
      .digest("base64url");
    const expectedBuf = new Uint8Array(Buffer.from(expected, "base64url"));
    const actualBuf = new Uint8Array(Buffer.from(sig, "base64url"));
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;

    const { nonce, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );
    if (typeof nonce !== "string" || typeof exp !== "number") return null;
    if (exp < Date.now()) return null;
    return nonce;
  } catch {
    return null;
  }
}
