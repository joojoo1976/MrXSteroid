
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Page } from '../../shared/types/types';

/**
 * Enterprise-Grade Auth Guard (Client-Side)
 * 
 * Protects routes by checking:
 * 1. User Session existence via Supabase Auth.
 * 2. Subscription Status ('active') for 'steroid_book' product.
 * 
 * If check fails, uses SPA navigation (not window.location.href) to redirect.
 */
interface AuthGuardProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
    navigateTo?: (page: Page) => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireSubscription = false, navigateTo }) => {
    const { user, loading } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    // Guards against re-running the redirect/deny logic on every App re-render
    // (navigateTo changes identity on each render), which previously caused
    // repeated navigation and stacked toasts.
    const decidedForRef = useRef<string | null>(null);

    // The pricing section lives on the Home page. Authenticated users without an
    // active subscription are sent there (never to the login page) and scrolled
    // to the pricing block.
    const redirectToPricing = (returnUrl: string) => {
        if (navigateTo) {
            navigateTo(Page.HOME);
            setTimeout(() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', '#pricing');
            }, 150);
        } else {
            window.location.href = `/#pricing?returnUrl=${encodeURIComponent(returnUrl)}`;
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            if (loading) return; // Wait for AuthContext

            const decisionKey = `${user?.id ?? 'anon'}-${requireSubscription ? 'sub' : 'none'}`;
            if (decidedForRef.current === decisionKey) return; // Already handled this session state
            decidedForRef.current = decisionKey;

            if (!user) {
                // User is not logged in - use SPA navigation if available
                if (navigateTo) {
                    navigateTo(Page.LOGIN);
                } else {
                    window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
                }
                return;
            }

            if (requireSubscription) {
                // Check subscription status on profiles (source of truth written by payment webhook)
                const { data: sub, error } = await supabase
                    .from('profiles')
                    .select('subscription_status, has_paid')
                    .eq('id', user.id)
                    .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

                if (error || !sub || sub.subscription_status !== 'active' || sub.has_paid !== true) {
                    toast.error("Active subscription required for this content.");
                    redirectToPricing(window.location.pathname);
                    return;
                }
            }

            // All checks passed
            setIsAuthorized(true);
            setIsChecking(false);
        };

        checkAccess();
        // navigateTo is intentionally excluded: its identity changes on every App
        // render and it is captured via closure. Deps are the actual guard inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
