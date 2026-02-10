import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth() as any;
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

                // Check for access token and refresh token
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) throw error;

                    setUser(data.user);
                    toast.success(isRTL ? 'تم التحقق من الحساب بنجاح!' : 'Account verified successfully!');
                    navigate(Page.DASHBOARD);
                } else {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    if (session) {
                        setUser(session.user);
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
            } catch (error: any) {
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
    }, [navigate, setUser, isRTL]);

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