import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Page } from '../types';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

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
                    // Use Supabase to set session
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        console.error('Error setting session:', error);
                        toast.error('Failed to complete authentication. Please try logging in again.');
                        navigate(Page.LOGIN);
                    } else {
                        // Successfully authenticated
                        setUser(data.user);
                        toast.success('Authentication successful!');
                        
                        // Redirect to dashboard or home
                        navigate(Page.DASHBOARD);
                    }
                } else {
                    // Fallback: try to get session from Supabase
                    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                    
                    if (sessionError || !sessionData.session) {
                        console.error('No session found:', sessionError);
                        toast.error('Authentication failed. Please try again.');
                        navigate(Page.LOGIN);
                    } else {
                        setUser(sessionData.user);
                        toast.success('Authentication successful!');
                        navigate(Page.DASHBOARD);
                    }
                }
            } catch (error: any) {
                console.error('Unexpected error during auth callback:', error);
                toast.error('An unexpected error occurred. Please try again.');
                navigate(Page.LOGIN);
            }
        };

        handleAuthCallback();
        
        // Clean up URL hash after processing
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    }, [navigate, setUser]);

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