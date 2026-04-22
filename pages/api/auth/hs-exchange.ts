import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginLimiter } from '@/utils/RateLimit';
import { config } from '@/Config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';

  try {
    await loginLimiter.check(res, config.security.rateLimits.loginLimit, ip as string);
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
      const cookie = serialize('hivescan_auth', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only over HTTPS
        path: '/',
        maxAge: config.security.sessionMaxAge,
      });

      res.setHeader('Set-Cookie', cookie);
      return res.status(200).json({ username: data.username, success: true });
    }
    
    // Use a token for the failure
    res.status(400).json({ error: 'auth.errorLoginFailed' });
  } catch (error) {
    console.error("Hivesigner exchange error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}