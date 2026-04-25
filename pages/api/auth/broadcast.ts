// pages/api/auth/broadcast.ts
import { config } from '@/Config';
import { parse } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';
import { broadcastLimiter } from '@/utils/RateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // 1. IP Detection
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim() 
      : req.socket.remoteAddress || 'anonymous';

    // 2. Rate Limiting
    try {
      const limit = config.security?.rateLimits?.broadcastLimit || 30;
      await broadcastLimiter.check(res, limit, ip);
    } catch {
      return res.status(429).json({ error: 'auth.errorTooManyTransactions' });
    }

    // 3. Auth & CSRF Check
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.hivescan_auth;
    const csrfCookie = cookies.hivescan_csrf;
    const csrfHeader = req.headers['x-csrf-token'];

    if (!token || !csrfCookie || csrfHeader !== csrfCookie) {
      return res.status(403).json({ error: 'Unauthorized: CSRF validation failed' });
    }

    const { operations } = req.body;
    
    // Valid Operations Only
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ error: 'Invalid operations format' });
    }

    const allowed = config.security?.allowedOperations || [];

    const isAllowed = operations.every((op: any) => {
      if (!Array.isArray(op) || op.length < 1) return false;
      const opType = op[0];
      return allowed.includes(opType);
    });

    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Forbidden: Unauthorized operation type detected.' 
      });
    }

    // Proxy to Hivesigner
    const response = await fetch(config.hivesigner.endpoints.broadcast, {
      method: 'POST',
      headers: { 
        'Authorization': token,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ operations }),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("CRITICAL API ERROR:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}