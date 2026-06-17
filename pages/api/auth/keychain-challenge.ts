import type { NextApiRequest, NextApiResponse } from "next";
import { challengeLimiter } from "@/utils/RateLimit";
import { createChallengeToken } from "@/lib/smart-signer/serverSession";
import { config } from "@/Config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const ip =
    (req.headers["cf-connecting-ip"] as string) ||
    (typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.socket.remoteAddress) ||
    "anonymous";

  try {
    await challengeLimiter.check(
      res,
      config.security.rateLimits.challengeLimit,
      ip
    );
  } catch {
    return res.status(429).json({ error: "auth.errorTooManyAttempts" });
  }

  const result = createChallengeToken();
  if (!result) {
    // Encryption key not configured — challenges disabled; client falls back to plain login
    return res.status(503).json({ error: "challenges_unavailable" });
  }

  // Cache-Control: no-store so the challenge is never cached and always fresh
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token: result.token, nonce: result.nonce });
}
