import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import { Page } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { getAvatarUrl } from '../shared/lib/avatar-service';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { isRTL } = usePreferences();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the current URL and extract hash fragment
                const hashFragment = window.location.hash.substring(1); // Remove the '#'
                const params = new URLSearchParams(hashFragment);

                // Check for error in URL
                const errorDescription = params.get('error_description');
                if (errorDescription) {
                    toast.error(errorDescription);
                    navigate(Page.LOGIN);
                    return;
                }

                // Check for email confirmation type
                const type = params.get('type');

                // Handle email confirmation (Supabase redirects here after clicking email link)
                if (type === 'signup' || type === 'email') {
                    // Supabase should have already confirmed the email via cookie/session
                    // Just need to check if user is confirmed and redirect appropriately
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) {
                        console.warn('Session error after email confirmation:', sessionError);
                        // Even without session, email might be confirmed
                        toast.success(
                            isRTL
                                ? 'تم تأكيد بريدك الإلكتروني! يرجى تسجيل الدخول.'
                                : 'Email confirmed! Please log in.'
                        );
                        navigate(Page.LOGIN);
                        return;
                    }

                    if (session) {
                        const isEmailConfirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);

                        if (isEmailConfirmed) {
                            // Sync verification status and avatar with profiles table
                            try {
                                const avatarUrl = getAvatarUrl({
                                    email: session.user.email || undefined,
                                    provider: session.user.app_metadata?.provider,
                                    providerAvatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                                });
                                await supabase.from('profiles').update({
                                    avatar_url: avatarUrl,
                                    updated_at: new Date().toISOString()
                                }).eq('id', session.user.id);
                            } catch (syncErr) {
                                console.warn('Profile sync after verification:', syncErr);
                            }

                            toast.success(isRTL ? 'تم التحقق من الحساب بنجاح!' : 'Account verified successfully!');
                            navigate(Page.DASHBOARD);
                        } else {
                            toast.warning(
                                isRTL
                                    ? 'يرجى تأكيد بريدك الإلكتروني أولاً'
                                    : 'Please confirm your email first'
                            );
                            navigate(Page.PROFILE);
                        }
                    } else {
                        // Email confirmed but no session - ask user to login
                        toast.success(
                            isRTL
                                ? 'تم تأكيد بريدك الإلكتروني! يرجى تسجيل الدخول.'
                                : 'Email confirmed! Please log in.'
                        );
                        navigate(Page.LOGIN);
                    }
                    return;
                }

                // Check for recovery type
                if (type === 'recovery') {
                    navigate(Page.RESET_PASSWORD, {
                        state: { recoveryToken: params.get('token') }
                    });
                    return;
                }

                // Check for access token and refresh token (OAuth flow)
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) throw error;

                    // Sync OAuth avatar to profiles table
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
                    navigate(Page.DASHBOARD);
                } else {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    if (session) {
                        toast.success(isRTL ? 'مرحباً بك مجدداً!' : 'Welcome back!');
                        navigate(Page.DASHBOARD);
                    } else {
                        // If no session, it might be an email confirmation link that didn't provide tokens in fragment
                        // but Supabase might have handled it via cookies if same origin.
                        // Or it's an invalid access.
                        console.warn('No session found in callback');
                        toast.info(isRTL ? 'يرجى تسجيل الدخول.' : 'Please log in to continue.');
                        navigate(Page.LOGIN);
                    }
                }
            } catch (error: unknown) {
                console.error('Auth callback error:', error);
                toast.error(isRTL ? 'فشل التحقق. يرجى المحاولة مرة أخرى.' : 'Verification failed. Please try again.');
                navigate(Page.LOGIN);
            }
        };

        handleAuthCallback();

        // Clean up URL hash after processing
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    }, [navigate, isRTL]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-foreground">Completing authentication...</h2>
                <p className="text-muted-foreground">Please wait while we verify your credentials</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;