
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Database } from '../../types/db_types';

/**
 * Enterprise-Grade Auth Guard (Client-Side)
 * 
 * Protects routes by checking:
 * 1. User Session existence via Supabase Auth.
 * 2. Subscription Status ('active') for 'steroid_book' product.
 * 
 * If check fails, redirects to Login or Pricing page, preserving returnUrl.
 */
interface AuthGuardProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireSubscription = false }) => {
    const { user, loading } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (loading) return; // Wait for AuthContext

            if (!user) {
                // User is not logged in
                window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
                return;
            }

            if (requireSubscription) {
                // Check subscription status in Supabase Database with Strict Typing
                const { data: sub, error } = await supabase
                    .from('subscriptions')
                    .select('status, product_id')
                    .eq('user_id', user.id)
                    .eq('product_id', 'steroid_book')
                    .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

                if (error || !sub || sub.status !== 'active') {
                    toast.error("Active subscription required for this content.");
                    window.location.href = `/pricing?returnUrl=${encodeURIComponent(window.location.pathname)}`;
                    return;
                }
            }

            // All checks passed
            setIsAuthorized(true);
            setIsChecking(false);
        };

        checkAccess();
    }, [user, loading, requireSubscription]);

    if (loading || isChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
                    <span className="text-gold-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                        Verifying Clearance...
                    </span>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Should have redirected by now
    }

    return <>{children}</>;
};

export default AuthGuard;
