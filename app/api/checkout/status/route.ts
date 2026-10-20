/**
 * Route Handler — /api/checkout/status
 *
 * Authoritative Server-Side Multi-Leg Settlement Status Endpoint.
 * Delegates to handleCheckoutStatus service in server/payments/checkoutStatusService.
 */

import { handleCheckoutStatus } from '@/server/payments/checkoutStatusService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return handleCheckoutStatus(req);
}
