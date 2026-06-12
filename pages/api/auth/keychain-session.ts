import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { Client, Signature, cryptoUtils } from "@hiveio/dhive";
import { config } from "@/Config";
import { loginLimiter } from "@/utils/RateLimit";
import { createSessionToken, verifyChallengeToken } from "@/lib/serverSession";

const hiveClient = new Client([config.nodeAddress]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const ip =
    (req.headers["cf-connecting-ip"] as string) ||
    (typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.socket.remoteAddress) ||
    "anonymous";

  try {
    await loginLimiter.check(res, config.security.rateLimits.loginLimit, ip);
  } catch {
    return res.status(429).json({ error: "auth.errorTooManyAttempts" });
  }

  const { username, message, signature, challenge } = req.body;
  if (
    typeof username !== "string" ||
    !username ||
    typeof message !== "string" ||
    !message ||
    message.length > 2048 ||
    typeof signature !== "string" ||
    !signature
  ) {
    return res.status(400).json({ error: "invalid_input" });
  }

  // If a challenge token was supplied, verify it and confirm the nonce appears in the message.
  // This prevents static-message replay. When challenges are unavailable (no key configured),
  // the client sends no challenge and we skip this check (graceful degradation).
  if (challenge !== undefined) {
    if (typeof challenge !== "string") {
      return res.status(400).json({ error: "invalid_input" });
    }
    const nonce = verifyChallengeToken(challenge);
    if (!nonce) {
      return res.status(401).json({ error: "invalid_or_expired_challenge" });
    }
    if (!message.includes(nonce)) {
      return res.status(401).json({ error: "nonce_not_in_message" });
    }
  }

  try {
    const [account] = await hiveClient.database.getAccounts([username]);
    if (!account) return res.status(400).json({ error: "account_not_found" });

    const postingKeys = account.posting.key_auths.map(([key]) => key as string);

    const msgHash = cryptoUtils.sha256(message);
    const sig = Signature.fromString(signature);
    const recoveredKey = sig.recover(msgHash);
    const recoveredKeyStr = recoveredKey.toString();

    if (!postingKeys.includes(recoveredKeyStr)) {
      return res.status(401).json({ error: "invalid_signature" });
    }

    const token = createSessionToken(username);
    if (!token) {
      // Encryption not configured — no session needed
      return res.status(200).json({ success: true });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("hivescan_session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: config.security.sessionMaxAge,
      })
    );
    return res.status(200).json({ success: true });
  } catch {
    return res.status(400).json({ error: "verification_failed" });
  }
}
