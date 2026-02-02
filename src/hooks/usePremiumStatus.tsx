/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔒 MR. X STEROID - PREMIUM SUBSCRIPTION GUARD                           ║
 * ║  Route Protection & Premium Status Check Logic                           ║
 * ║  منطق التحقق من الاشتراك المميز                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type SubscriptionStatus = 'inactive' | 'active' | 'expired' | 'cancelled' | 'past_due';

export interface PremiumStatus {
    isPremium: boolean;
    status: SubscriptionStatus;
    expiresAt?: string;
    loading: boolean;
    error?: string;
}

export interface SubscriptionDetails {
    userId: string;
    status: SubscriptionStatus;
    productId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    features: PremiumFeature[];
}

export type PremiumFeature =
    | 'cycle_architect'
    | 'training_plans'
    | 'nutrition_plans'
    | 'lab_analyzer'
    | 'genetic_calculator'
    | 'coaching_access'
    | 'export_features'
    | 'priority_support';

// Premium features by product tier
const FEATURE_ACCESS: Record<string, PremiumFeature[]> = {
    digital: ['training_plans', 'nutrition_plans'],
    paperback: ['training_plans', 'nutrition_plans', 'cycle_architect'],
    hardcover: ['training_plans', 'nutrition_plans', 'cycle_architect', 'lab_analyzer', 'genetic_calculator', 'export_features'],
    coaching: ['training_plans', 'nutrition_plans', 'cycle_architect', 'lab_analyzer', 'genetic_calculator', 'export_features', 'coaching_access'],
    coaching_plus: ['training_plans', 'nutrition_plans', 'cycle_architect', 'lab_analyzer', 'genetic_calculator', 'export_features', 'coaching_access', 'priority_support'],
    premium: ['training_plans', 'nutrition_plans', 'cycle_architect', 'lab_analyzer', 'genetic_calculator', 'export_features'] // Default premium
};

// ═══════════════════════════════════════════════════════════════════════════
//                         PREMIUM STATUS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * React Hook to check user's premium subscription status
 * Hook للتحقق من حالة اشتراك المستخدم المميز
 */
export function usePremiumStatus(): PremiumStatus {
    const [status, setStatus] = useState<PremiumStatus>({
        isPremium: false,
        status: 'inactive',
        loading: true
    });

    useEffect(() => {
        let isMounted = true;

        const checkPremiumStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    if (isMounted) {
                        setStatus({ isPremium: false, status: 'inactive', loading: false });
                    }
                    return;
                }

                // Check profile subscription_status
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                const subscriptionStatus = (profile?.subscription_status || 'inactive') as SubscriptionStatus;
                const isPremium = subscriptionStatus === 'active';

                // Get subscription details for expiry
                let expiresAt: string | undefined;
                if (isPremium) {
                    const { data: subscription } = await supabase
                        .from('subscriptions')
                        .select('current_period_end')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .single();

                    expiresAt = subscription?.current_period_end;
                }

                if (isMounted) {
                    setStatus({
                        isPremium,
                        status: subscriptionStatus,
                        expiresAt,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error checking premium status:', error);
                if (isMounted) {
                    setStatus({
                        isPremium: false,
                        status: 'inactive',
                        loading: false,
                        error: 'Failed to check subscription status'
                    });
                }
            }
        };

        // Initial check
        checkPremiumStatus();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkPremiumStatus();
        });

        // Listen for payment status changes (from PaymentService)
        const handlePaymentChange = () => {
            checkPremiumStatus();
        };
        window.addEventListener('paymentStatusChanged', handlePaymentChange);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            window.removeEventListener('paymentStatusChanged', handlePaymentChange);
        };
    }, []);

    return status;
}

// ═══════════════════════════════════════════════════════════════════════════
//                       FEATURE ACCESS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to check if user has access to a specific premium feature
 * Hook للتحقق من صلاحية المستخدم لميزة معينة
 */
export function useFeatureAccess(feature: PremiumFeature): {
    hasAccess: boolean;
    loading: boolean;
} {
    const { isPremium, loading } = usePremiumStatus();
    const [productId, setProductId] = useState<string>('');

    useEffect(() => {
        const getProductId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('product_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            if (subscription?.product_id) {
                setProductId(subscription.product_id);
            }
        };

        if (isPremium) {
            getProductId();
        }
    }, [isPremium]);

    const hasAccess = isPremium && (
        FEATURE_ACCESS[productId]?.includes(feature) ||
        FEATURE_ACCESS['premium']?.includes(feature) // Fallback to default premium features
    );

    return { hasAccess, loading };
}

// ═══════════════════════════════════════════════════════════════════════════
//                       SERVER-SIDE CHECK FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check premium status (can be used in server components or loaders)
 * التحقق من حالة الاشتراك المميز (للاستخدام في server components)
 */
export async function checkPremiumAccess(userId: string): Promise<{
    isPremium: boolean;
    subscriptionDetails?: SubscriptionDetails;
}> {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return { isPremium: false };
        }

        const isPremium = profile.subscription_status === 'active';

        if (!isPremium) {
            return { isPremium: false };
        }

        // Get full subscription details
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            return { isPremium: true };
        }

        return {
            isPremium: true,
            subscriptionDetails: {
                userId,
                status: subscription.status as SubscriptionStatus,
                productId: subscription.product_id,
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                features: FEATURE_ACCESS[subscription.product_id] || FEATURE_ACCESS['premium']
            }
        };
    } catch (error) {
        console.error('Premium check error:', error);
        return { isPremium: false };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         PREMIUM GUARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    feature?: PremiumFeature;
    onAccessDenied?: () => void;
}

/**
 * Component wrapper to protect premium content
 * مكون لحماية المحتوى المميز
 */
export function PremiumGuard({
    children,
    fallback,
    feature,
    onAccessDenied
}: PremiumGuardProps): JSX.Element {
    const { isPremium, loading } = usePremiumStatus();
    const featureAccess = useFeatureAccess(feature || 'training_plans');

    useEffect(() => {
        if (!loading && !isPremium && onAccessDenied) {
            onAccessDenied();
        }
    }, [loading, isPremium, onAccessDenied]);

    // Show loading state
    if (loading || featureAccess.loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Check feature-specific access if specified
    if (feature && !featureAccess.hasAccess) {
        return (fallback as JSX.Element) || <PremiumUpgradePrompt feature={feature} />;
    }

    // Check general premium access
    if (!isPremium) {
        return (fallback as JSX.Element) || <PremiumUpgradePrompt />;
    }

    return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════════════
//                       UPGRADE PROMPT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PremiumUpgradePromptProps {
    feature?: PremiumFeature;
    locale?: 'ar' | 'en';
}

const FEATURE_NAMES: Record<PremiumFeature, { en: string; ar: string }> = {
    cycle_architect: { en: 'Cycle Architect', ar: 'مهندس الدورات' },
    training_plans: { en: 'Training Plans', ar: 'خطط التدريب' },
    nutrition_plans: { en: 'Nutrition Plans', ar: 'خطط التغذية' },
    lab_analyzer: { en: 'Lab Analyzer', ar: 'محلل التحاليل' },
    genetic_calculator: { en: 'Genetic Calculator', ar: 'حاسبة الجينات' },
    coaching_access: { en: 'Personal Coaching', ar: 'التدريب الشخصي' },
    export_features: { en: 'Export Features', ar: 'ميزات التصدير' },
    priority_support: { en: 'Priority Support', ar: 'الدعم الأولوي' }
};

function PremiumUpgradePrompt({ feature, locale = 'en' }: PremiumUpgradePromptProps): JSX.Element {
    const isAr = locale === 'ar';
    const featureName = feature ? FEATURE_NAMES[feature][locale] : null;

    return (
        <div
            className="relative overflow-hidden rounded-2xl border-2 border-gold-500/20 bg-gradient-to-br from-zinc-900 to-black p-8 text-center"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent pointer-events-none" />

            {/* Lock Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
                <svg
                    className="w-10 h-10 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white mb-2">
                {isAr ? '🔐 محتوى حصري للمشتركين' : '🔐 Premium Content'}
            </h3>

            {/* Description */}
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                {isAr
                    ? featureName
                        ? `ميزة "${featureName}" متاحة فقط للمشتركين المميزين. احصل على الوصول الكامل الآن!`
                        : 'هذا المحتوى متاح فقط للمشتركين المميزين. اشترك الآن للوصول الكامل!'
                    : featureName
                        ? `The "${featureName}" feature is only available to premium subscribers. Get full access now!`
                        : 'This content is only available to premium subscribers. Subscribe now for full access!'
                }
            </p>

            {/* CTA Button */}
            <a
                href="/#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-gold-500/25"
            >
                <span>{isAr ? 'اشترك الآن' : 'Subscribe Now'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </a>

            {/* Features List */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                    {isAr ? 'ما ستحصل عليه:' : 'What you get:'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(FEATURE_NAMES).slice(0, 4).map(([key, name]) => (
                        <span
                            key={key}
                            className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold text-zinc-400"
                        >
                            {name[locale]}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { PremiumUpgradePrompt };
export default PremiumGuard;
