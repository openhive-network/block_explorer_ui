import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST to prevent accidental logouts via URL browsing
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', serialize('hivescan_auth', '', {
    maxAge: -1, // Expire immediately
    path: '/',
  }));
  
  res.status(200).json({ success: true });
}