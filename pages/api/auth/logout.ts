import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { config } from "@/Config";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Only allow POST to prevent accidental logouts via URL browsing
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Define standard security flags for deletion
  const securityFlags = {
    path: "/",
    maxAge: -1, // Expire immediately
    secure: true,
    sameSite: "strict" as const, // Prevents the logout from being triggered by 3rd parties
  };

  // 3. Clear the AUTH cookie (HttpOnly)
  const authCookie = serialize("hivescan_auth", "", {
    ...securityFlags,
    httpOnly: true,
  });

  // 4. Clear the CSRF cookie
  const csrfCookie = serialize("hivescan_csrf", "", {
    ...securityFlags,
    httpOnly: false, // CSRF cookie was accessible to JS
  });

  // 5. Clear the workspace session cookie (shared by Keychain and Hivesigner)
  const sessionCookie = serialize("hivescan_session", "", {
    ...securityFlags,
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", [authCookie, csrfCookie, sessionCookie]);

  res.status(200).json({ success: true });
}
