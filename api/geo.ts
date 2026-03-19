import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Determine user country directly from Vercel Load Balancer. Fallback for Local Dev.
    const countryCode = req.headers['x-vercel-ip-country'] || req.query.country || 'EG';

    // Enable CORS for local Vite access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return res.status(200).json({ countryCode });
}
