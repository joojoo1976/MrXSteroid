import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../shared/types/types';
import { ShieldX, Home } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
    navigateTo?: (page: Page) => void;
}

/**
 * Enterprise-Grade Admin Guard (RBAC)
 *
 * Protects admin-only routes by verifying the user's `role` claim
 * (profiles.role === 'admin') from the authenticated Supabase session.
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

            const role = profileData?.role || (user as unknown as { user_metadata?: { role?: string } })?.user_metadata?.role || 'user';

            setIsAuthorized(role === 'admin');
            setIsChecking(false);
        }, 0);

        return () => clearTimeout(timer);
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
