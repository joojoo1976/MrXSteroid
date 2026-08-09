'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import { usePreferences } from '../context/PreferencesContext';
import { getAvatarUrl } from '../shared/lib/avatar-service';

// Custom navigation helper — uses App Router navigation (replaces the old
// SPA pushState + custom-event mechanism that no longer applies in Next.js).
const navigateToPage = (router: ReturnType<typeof useRouter>, path: string) => {
    router.push(path);
};

const AuthCallbackPage: React.FC = () => {
    const { isRTL } = usePreferences();
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const hashFragment = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hashFragment);
                const queryParams = new URLSearchParams(window.location.search);

                // ── Error in URL ──────────────────────────────────────────
                const errorDescription =
                    hashParams.get('error_description') || queryParams.get('error_description');
                if (errorDescription) {
                    toast.error(
                        isRTL
                            ? `خطأ في التحقق: ${errorDescription}`
                            : `Verification error: ${errorDescription}`
                    );
                    navigateToPage(router, '/login');
                    return;
                }

                const type = hashParams.get('type') || queryParams.get('type');

                // ── PKCE flow: code in query params (Supabase v2 default) ─
                const code = queryParams.get('code');
                if (code) {
                    console.log('📧 PKCE code detected — exchanging for session...');
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        console.error('❌ exchangeCodeForSession error:', error);
                        toast.error(
                            isRTL
                                ? 'فشل تأكيد البريد الإلكتروني. الرابط منتهي أو مستخدم من قبل.'
                                : 'Email confirmation failed. Link expired or already used.'
                        );
                        navigateToPage(router, '/login');
                        return;
                    }

                    if (data.session) {
                        await syncProfileAfterVerification(data.session.user);
                        toast.success(
                            isRTL
                                ? '✅ تم التحقق من حسابك بنجاح! مرحباً بك.'
                                : '✅ Account verified successfully! Welcome.'
                        );
                        navigateToPage(router, '/dashboard');
                        return;
                    }
                }

                // ── Legacy implicit flow: tokens in hash (Supabase v1 style) ─
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('🔑 Implicit token flow detected...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        console.error('❌ setSession error:', error);
                        throw error;
                    }

                    if (data.user) {
                        await syncProfileAfterVerification(data.user);
                    }

                    toast.success(
                        isRTL
                            ? '✅ تم التحقق من حسابك بنجاح!'
                            : '✅ Account verified successfully!'
                    );
                    navigateToPage(router, '/dashboard');
                    return;
                }

                // ── Email confirmation without active session (email-only confirm) ─
                if (type === 'signup' || type === 'email' || type === 'email_change') {
                    console.log('📨 Email confirmation type detected, checking session...');
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) {
                        console.warn('Session error after email confirmation:', sessionError);
                    }

                    if (session && (session.user.email_confirmed_at || session.user.confirmed_at)) {
                        await syncProfileAfterVerification(session.user);
                        toast.success(
                            isRTL
                                ? '✅ تم تأكيد بريدك الإلكتروني! يمكنك الآن تسجيل الدخول.'
                                : '✅ Email confirmed! You can now log in.'
                        );
                        navigateToPage(router, '/login?verified=true');
                    } else {
                        toast.success(
                            isRTL
                                ? '✅ تم تأكيد بريدك الإلكتروني! يرجى تسجيل الدخول الآن.'
                                : '✅ Email confirmed! Please log in now.'
                        );
                        navigateToPage(router, '/login?verified=true');
                    }
                    return;
                }

                // ── Password reset flow ────────────────────────────────────
                if (type === 'recovery') {
                    console.log('🔄 Password recovery flow');
                    navigateToPage(router, '/reset-password');
                    return;
                }

                // ── Fallback: check if session already exists ──────────────
                const { data: { session }, error: fallbackError } = await supabase.auth.getSession();

                if (fallbackError) throw fallbackError;

                if (session) {
                    console.log('✅ Active session found — redirecting to dashboard');
                    navigateToPage(router, '/dashboard');
                } else {
                    console.warn('⚠️ No session found in callback — redirecting to login');
                    toast.info(
                        isRTL
                            ? 'يرجى تسجيل الدخول للمتابعة.'
                            : 'Please log in to continue.'
                    );
                    navigateToPage(router, '/login');
                }
            } catch (error: unknown) {
                console.error('❌ Auth callback error:', error);
                toast.error(
                    isRTL
                        ? 'فشل عملية التحقق. يرجى المحاولة مرة أخرى.'
                        : 'Verification failed. Please try again.'
                );
                navigateToPage(router, '/login');
            }
        };

        handleAuthCallback();

        // Clean URL after processing
        if (window.location.hash || window.location.search) {
            history.replaceState(null, '', window.location.pathname);
        }
    }, [isRTL]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-gold-500 mb-2"></div>
                <h2 className="text-xl font-bold text-foreground">
                    {isRTL ? 'جاري إتمام المصادقة...' : 'Completing authentication...'}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isRTL
                        ? 'يرجى الانتظار بينما نتحقق من بياناتك...'
                        : 'Please wait while we verify your credentials...'}
                </p>
            </div>
        </div>
    );
};

/**
 * Syncs profile data after email confirmation.
 * Called after exchangeCodeForSession or setSession succeeds.
 */
async function syncProfileAfterVerification(user: { id: string; email?: string | null; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
    try {
        const meta = user.user_metadata ?? {};
        const provider = typeof user.app_metadata?.provider === 'string' ? user.app_metadata.provider : undefined;
        const avatar = typeof meta.avatar_url === 'string' ? meta.avatar_url : (typeof meta.picture === 'string' ? meta.picture : undefined);
        const avatarUrl = getAvatarUrl({
            email: user.email || undefined,
            provider,
            providerAvatarUrl: avatar,
        });

        const { error } = await supabase.from('profiles').update({
            avatar_url: avatarUrl,
            full_name: typeof meta.full_name === 'string' ? meta.full_name : (typeof meta.name === 'string' ? meta.name : undefined),
            user_name: typeof meta.user_name === 'string' ? meta.user_name : (typeof meta.username === 'string' ? meta.username : undefined),
            phone_number: typeof meta.phone_number === 'string' ? meta.phone_number : null,
            updated_at: new Date().toISOString(),
        }).eq('id', user.id);

        if (error) {
            console.warn('⚠️ Profile sync warning:', error.message);
        } else {
            console.log('✅ Profile synced successfully after verification for user:', user.id);
        }
    } catch (err) {
        console.warn('⚠️ Profile sync error (non-fatal):', err);
    }
}

export default AuthCallbackPage;
