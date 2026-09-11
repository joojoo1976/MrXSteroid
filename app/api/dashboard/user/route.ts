import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../server/affiliate/apiHelpers';
import { getUserDashboardData, updateUserDashboardData } from '../../../../server/dashboard/dashboardService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getUserDashboardData(auth.userId);
    if (!data) {
        return NextResponse.json({ error: 'Failed to load user dashboard' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, dashboard: data });
}

export async function POST(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const success = await updateUserDashboardData(auth.userId, body);
        if (!success) {
            return NextResponse.json({ error: 'Failed to update dashboard data' }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid request payload';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
