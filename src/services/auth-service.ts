
import { supabase } from '../lib/supabase';
import { errorHandler } from '../lib/error-handler';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignUpOptions {
    email: string;
    password: string;
    full_name: string;
    user_name: string;
}

export interface AuthResponse {
    user: User | null;
    session: Session | null;
    error: AuthError | string | null;
}

/**
 * Enterprise Auth Service for Mr. X Steroid
 * Handles User Registration with Metadata and Error Safety
 */
export const authService = {
    /**
     * Registers a new user with metadata and localized redirects.
     */
    async signUp({ email, password, full_name, user_name }: SignUpOptions): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name,
                        user_name,
                    },
                    emailRedirectTo: 'https://mrxsteroid.vercel.app/dashboard',
                },
            });

            if (error) {
                // Check for common network/SMTP errors often masked as generic fetch failures
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    throw new Error('Network error: Unable to reach authentication server. Please check your connection.');
                }

                // Specific Brevo/SMTP related hints (Supabase sometimes returns cryptic 500s for SMTP failures)
                if (error.status === 500) {
                    console.warn('Potential SMTP Handshake Failure. Check Brevo settings.');
                }

                throw error;
            }

            return { user: data.user, session: data.session, error: null };

        } catch (error: any) {
            // Use the centralized error handler but allow UI to receive the formatted message
            errorHandler.handle(error, 'AuthService.signUp');

            return {
                user: null,
                session: null,
                error: error.message || 'An unexpected error occurred during sign up.'
            };
        }
    },

    /**
     * Signs out the current user.
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) errorHandler.handle(error, 'AuthService.signOut');
    }
};
