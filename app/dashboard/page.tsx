'use client';

import AuthGuard from '../../features/auth/AuthGuard';
import UserDashboard from '../../components/dashboard/UserDashboard';

/**
 * Authenticated user dashboard.
 *
 * The legacy dashboard is kept in `legacy-pages/Dashboard.tsx` and remains
 * reachable from the repo history; this route now renders the redesigned,
 * data-backed surface. AuthGuard is unchanged and still owns access control.
 */
export default function DashboardPage() {
    return (
        <AuthGuard>
            <UserDashboard />
        </AuthGuard>
    );
}
