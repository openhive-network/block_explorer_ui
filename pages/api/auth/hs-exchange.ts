import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { loginLimiter } from "@/utils/RateLimit";
import { config, validateHivesignerEnv } from "@/Config";
import crypto from "crypto";
import { createSessionToken } from "@/lib/serverSession";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  validateHivesignerEnv();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  /**
   * Trusted Cloudflare IP Detection
   * We utilize 'cf-connecting-ip' which Cloudflare guarantees to be un-spoofable.
   * We fallback to the first entry of 'x-forwarded-for' only if the CF header is missing.
   */
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

  const { code } = req.body;
  if (typeof code !== "string" || !code)
    return res.status(400).json({ error: "Code required" });

  const clientId = process.env.HIVESIGNER_APP;
  const clientSecret = process.env.HIVESIGNER_SECRET;
  if (!clientId || !clientSecret) {
    console.error(
      "Hivesigner exchange aborted: HIVESIGNER_APP or HIVESIGNER_SECRET is not configured"
    );
    return res.status(503).json({ error: "auth.errorServiceUnavailable" });
  }

  try {
    const response = await fetch(config.hivesigner.endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const csrfToken = crypto.randomBytes(32).toString("hex");

      const authCookie = serialize("hivescan_auth", data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: config.security.sessionMaxAge,
      });

      const csrfCookie = serialize("hivescan_csrf", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: config.security.sessionMaxAge,
      });

      const cookies = [authCookie, csrfCookie];

      const sessionToken = createSessionToken(data.username);
      if (sessionToken) {
        cookies.push(
          serialize("hivescan_session", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: config.security.sessionMaxAge,
          })
        );
      }

      res.setHeader("Set-Cookie", cookies);
      return res.status(200).json({ username: data.username, success: true });
    }

    res.status(400).json({ error: "auth.errorLoginFailed" });
  } catch (error) {
    console.error("Hivesigner exchange error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
