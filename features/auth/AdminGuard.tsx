'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../shared/types/types';
import { ShieldX, Home } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
    navigateTo?: (page: Page) => void;
}

/**
 * Enterprise-Grade Admin Guard (RBAC) — UI Layer
 *
 * Protects admin-only UI by verifying the user's `role` claim from the
 * `profiles` table (profiles.role === 'admin') fetched via Supabase.
 *
 * Security contract:
 * - Only trusts `profileData.role` sourced from the database via AuthContext.
 * - Does NOT use `user_metadata.role` — that field is client-controlled and
 *   MUST NOT be used as an authorization signal.
 * - This is a UI-only guard; real authorization is enforced server-side by
 *   `server/auth/require-admin.ts` on every admin API route.
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children, navigateTo }) => {
    const { user, loading, profileData } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Defer the check to a microtask so profileData has a chance to resolve
        // and to keep setState outside the synchronous effect body.
        const timer = setTimeout(() => {
            if (!user) {
                if (navigateTo) navigateTo(Page.LOGIN);
                else window.location.href = '/login';
                return;
            }

            // profileData === null means the DB fetch has not completed yet.
            // Do NOT fall back to user_metadata.role — that field is client-controlled
            // and MUST NOT be used as an authorization signal.
            if (profileData === null) {
                // Still waiting for profile from DB — keep spinner running.
                return;
            }

            // profileData is available: authorize only if DB role is 'admin'.
            setIsAuthorized(profileData.role === 'admin');
            setIsChecking(false);
        }, 0);

        // Hard deadline: if the profile fetch never resolves (DB/network outage),
        // deny access after a bounded delay rather than hanging forever or granting
        // access based on untrustworthy client-side metadata.
        const fallbackTimer = setTimeout(() => {
            if (profileData?.role === 'admin') {
                setIsAuthorized(true);
            } else {
                // Deny — do NOT use user_metadata.role as a fallback.
                setIsAuthorized(false);
            }
            setIsChecking(false);
        }, 4000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
        };
    }, [user, loading, profileData, navigateTo]);


    if (loading || isChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
                    <span className="text-gold-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                        Verifying Admin Clearance...
                    </span>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-10 text-center space-y-6 shadow-2xl">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <ShieldX className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Access Denied</h1>
                        <p className="text-sm text-zinc-400">This area is restricted to administrators only.</p>
                    </div>
                    {navigateTo && (
                        <button
                            onClick={() => navigateTo(Page.HOME)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-black text-sm rounded-xl shadow-lg transition-all"
                        >
                            <Home className="w-4 h-4" /> Back to Home
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminGuard;
