import React, { useEffect } from 'react';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import { usePreferences } from '../context/PreferencesContext';
import { getAvatarUrl } from '../shared/lib/avatar-service';

// Custom navigation helper (matches App.tsx Page enum routing)
const navigateToPage = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('mrx_navigate', { detail: path.replace(/^\//, '').replace(/\//g, '_') }));
    // Fallback: force re-render by popstate
    window.dispatchEvent(new PopStateEvent('popstate'));
};

const AuthCallbackPage: React.FC = () => {
    const { isRTL } = usePreferences();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the current URL and extract hash fragment
                const hashFragment = window.location.hash.substring(1);
                const params = new URLSearchParams(hashFragment);

                // Also check query params (for some OAuth flows)
                const queryParams = new URLSearchParams(window.location.search);

                // Check for error in URL
                const errorDescription = params.get('error_description') || queryParams.get('error_description');
                if (errorDescription) {
                    toast.error(errorDescription);
                    navigateToPage('/login');
                    return;
                }

                // Check for email confirmation type
                const type = params.get('type') || queryParams.get('type');

                // Handle email confirmation (Supabase redirects here after clicking email link)
                if (type === 'signup' || type === 'email') {
                    console.log('Email confirmation callback detected');

                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) {
                        console.warn('Session error after email confirmation:', sessionError);
                        toast.success(
                            isRTL
                                ? 'تم تأكيد بريدك الإلكتروني! يرجى تسجيل الدخول.'
                                : 'Email confirmed! Please log in.'
                        );
                        navigateToPage('/login');
                        return;
                    }

                    if (session) {
                        const isEmailConfirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
                        console.log('Email confirmed:', isEmailConfirmed, 'User ID:', session.user.id);

                        if (isEmailConfirmed) {
                            // Sync profile data after email confirmation (now we have an active session)
                            try {
                                const avatarUrl = getAvatarUrl({
                                    email: session.user.email || undefined,
                                    provider: session.user.app_metadata?.provider,
                                    providerAvatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                                });

                                const { error: updateError } = await supabase.from('profiles').update({
                                    avatar_url: avatarUrl,
                                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                                    user_name: session.user.user_metadata?.user_name || session.user.user_metadata?.username,
                                    updated_at: new Date().toISOString()
                                }).eq('id', session.user.id);

                                if (updateError) {
                                    console.warn('Profile update error:', updateError);
                                } else {
                                    console.log('Profile synced successfully after email confirmation');
                                }
                            } catch (syncErr) {
                                console.warn('Profile sync after verification:', syncErr);
                            }

                            toast.success(isRTL ? 'تم التحقق من الحساب بنجاح!' : 'Account verified successfully!');
                            navigateToPage('/dashboard');
                        } else {
                            toast.warning(
                                isRTL
                                    ? 'يرجى تأكيد بريدك الإلكتروني أولاً'
                                    : 'Please confirm your email first'
                            );
                            navigateToPage('/profile');
                        }
                    } else {
                        console.log('Email confirmed but no session found');
                        toast.success(
                            isRTL
                                ? 'تم تأكيد بريدك الإلكتروني! يرجى تسجيل الدخول.'
                                : 'Email confirmed! Please log in.'
                        );
                        navigateToPage('/login');
                    }
                    return;
                }

                // Check for recovery type (password reset)
                if (type === 'recovery') {
                    navigateToPage('/reset-password');
                    return;
                }

                // Check for access token and refresh token (OAuth flow)
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    console.log('Setting OAuth session...');
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) throw error;

                    // Sync OAuth profile
                    if (data.user) {
                        try {
                            const avatarUrl = getAvatarUrl({
                                email: data.user.email || undefined,
                                provider: data.user.app_metadata?.provider,
                                providerAvatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                            });
                            await supabase.from('profiles').update({
                                avatar_url: avatarUrl,
                                full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
                                updated_at: new Date().toISOString()
                            }).eq('id', data.user.id);
                        } catch (syncErr) {
                            console.warn('OAuth profile sync:', syncErr);
                        }
                    }

                    toast.success(isRTL ? 'تم التحقق من الحساب بنجاح!' : 'Account verified successfully!');
                    navigateToPage('/dashboard');
                } else {
                    // No tokens in URL — check if session exists from cookie/localStorage
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    if (session) {
                        console.log('Session found, redirecting to dashboard');
                        toast.success(isRTL ? 'مرحباً بك مجدداً!' : 'Welcome back!');
                        navigateToPage('/dashboard');
                    } else {
                        console.warn('No session found in callback');
                        toast.info(isRTL ? 'يرجى تسجيل الدخول.' : 'Please log in to continue.');
                        navigateToPage('/login');
                    }
                }
            } catch (error: unknown) {
                console.error('Auth callback error:', error);
                toast.error(isRTL ? 'فشل التحقق. يرجى المحاولة مرة أخرى.' : 'Verification failed. Please try again.');
                navigateToPage('/login');
            }
        };

        handleAuthCallback();

        // Clean up URL hash after processing
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    }, [isRTL]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-foreground">
                    {isRTL ? 'جاري إتمام المصادقة...' : 'Completing authentication...'}
                </h2>
                <p className="text-muted-foreground">
                    {isRTL ? 'يرجى الانتظار whilst نتحقق من بياناتك...' : 'Please wait while we verify your credentials'}
                </p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
