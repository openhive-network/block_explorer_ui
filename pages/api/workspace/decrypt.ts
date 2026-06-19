import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { config } from "@/Config";
import { workspaceLimiter } from "@/utils/RateLimit";
import {
  getSessionUser,
  deriveUserEncryptionKey,
} from "@/lib/smart-signer/serverSession";

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
    await workspaceLimiter.check(
      res,
      config.security.rateLimits.workspaceLimit,
      ip
    );
  } catch {
    return res.status(429).json({ error: "too_many_requests" });
  }

  const username = getSessionUser(req.cookies);
  // Reject the legacy Hivesigner sentinel — it has no real username to derive a key from
  if (!username || username === "__hivesigner__") {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { data } = req.body;
  if (typeof data !== "string" || !data) {
    return res.status(400).json({ error: "invalid_input" });
  }
  if (Buffer.byteLength(data, "utf8") > MAX_INPUT_BYTES) {
    return res.status(413).json({ error: "payload_too_large" });
  }

  const key = deriveUserEncryptionKey(username);
  if (!key) {
    return res.status(400).json({ error: "no_key_configured" });
  }

  try {
    const combined = new Uint8Array(Buffer.from(data, "base64"));

    const IV_BYTES = 12;
    const TAG_BYTES = 16;
    const iv = combined.subarray(0, IV_BYTES);
    const authTag = combined.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
    const ciphertext = combined.subarray(IV_BYTES + TAG_BYTES);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      new Uint8Array(decipher.update(ciphertext)),
      new Uint8Array(decipher.final()),
    ]);
    // Return raw bytes as base64 — client reconstructs the original D:/LZ prefix
    return res.status(200).json({ result: decrypted.toString("base64") });
  } catch {
    return res.status(400).json({ error: "decryption_failed" });
  }
}
