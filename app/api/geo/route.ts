/**
 * Route Handler — /api/geo
 * Determines the user's country from the hosting platform's IP header
 * (Vercel Load Balancer), with a query-param / fallback for local dev.
 */
export async function GET(req: Request) {
    const countryCode =
        req.headers.get('x-vercel-ip-country') ||
        new URL(req.url).searchParams.get('country') ||
        'EG';

    return Response.json({ countryCode });
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    });
}
