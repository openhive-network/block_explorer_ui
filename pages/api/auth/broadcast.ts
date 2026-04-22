import { config } from '@/Config';
import { parse } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.hivescan_auth;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { operations } = req.body;

  try {
    const response = await fetch(config.hivesigner.endpoints.broadcast, {
      method: 'POST',
      headers: { 
        'Authorization': token, // Server pulls token from cookie
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ operations }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Broadcast failed' });
  }
}