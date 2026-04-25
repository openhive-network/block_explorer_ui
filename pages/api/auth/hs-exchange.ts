import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginLimiter } from '@/utils/RateLimit';
import { config } from '@/Config';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // SAFE IP DETECTION: 
  // We take the first IP in the list (the real client) 
  // and fallback to remoteAddress if the header is missing.
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : req.socket.remoteAddress || 'anonymous';

  try {
    await loginLimiter.check(res, config.security.rateLimits.loginLimit, ip);
  } catch {
    return res.status(429).json({ error: 'auth.errorTooManyAttempts' });
  }

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  
  try {
    const response = await fetch(config.hivesigner.endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.HIVESIGNER_APP,
        client_secret: process.env.HIVESIGNER_SECRET,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const csrfToken = crypto.randomBytes(32).toString('hex');

      const authCookie = serialize('hivescan_auth', data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: config.security.sessionMaxAge,
      });

      const csrfCookie = serialize('hivescan_csrf', csrfToken, {
        httpOnly: false, 
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: config.security.sessionMaxAge,
      });

      res.setHeader('Set-Cookie', [authCookie, csrfCookie]);
      return res.status(200).json({ username: data.username, success: true });
    }
    
    res.status(400).json({ error: 'auth.errorLoginFailed' });
  } catch (error) {
    console.error("Hivesigner exchange error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}