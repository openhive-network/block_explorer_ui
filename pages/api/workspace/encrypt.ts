import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { loginLimiter } from "@/utils/RateLimit";
import { isAuthenticated } from "@/lib/serverSession";

// Max base64 payload size: 512 KB (deflate bundle should never exceed this)
const MAX_INPUT_BYTES = 512 * 1024;

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
    await loginLimiter.check(res, 20, ip);
  } catch {
    return res.status(429).json({ error: "too_many_requests" });
  }

  if (!isAuthenticated(req.cookies)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { data } = req.body;
  if (typeof data !== "string" || !data) {
    return res.status(400).json({ error: "invalid_input" });
  }
  if (Buffer.byteLength(data, "utf8") > MAX_INPUT_BYTES) {
    return res.status(413).json({ error: "payload_too_large" });
  }

  const keyHex = process.env.WORKSPACE_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    // No key configured — pass data through unencrypted
    return res.status(200).json({ result: data });
  }

  try {
    // data is base64 of raw compressed bytes — decrypt path reverses this
    const key = new Uint8Array(Buffer.from(keyHex, "hex"));
    const iv = crypto.randomBytes(12);
    const rawBytes = new Uint8Array(Buffer.from(data, "base64"));
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      new Uint8Array(cipher.update(rawBytes)),
      new Uint8Array(cipher.final()),
    ]);
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return res.status(200).json({ result: combined.toString("base64") });
  } catch {
    return res.status(500).json({ error: "encryption_failed" });
  }
}
