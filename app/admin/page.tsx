'use client';

import AdminGuard from '../../features/auth/AdminGuard';
import AdminDashboard from '../../components/admin/AdminDashboard';

/**
 * Admin surface.
 *
 * Access control remains owned by AdminGuard (role from profiles.role, never
 * client metadata). The visual layer is the redesigned admin console.
 */
export default function AdminRoute() {
    return (
        <AdminGuard>
            <AdminDashboard />
        </AdminGuard>
    );
}
