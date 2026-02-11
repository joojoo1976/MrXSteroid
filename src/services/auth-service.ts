
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

import { env } from '../config/env';

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
                        currency: 'USD',
                        role: 'user'
                    },
                    emailRedirectTo: `${env.SITE_URL}/auth/callback`,
                },
            });

            if (error) {
                // Map cryptic Supabase errors to user-friendly messages
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    throw new Error('NETWORK_UNREACHABLE');
                }

                if (error.status === 429) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }

                if (error.message.includes('User already registered') || error.status === 400) {
                    throw new Error('EMAIL_EXISTS');
                }

                throw error;
            }

            if (data.user) {
                return { user: data.user, session: data.session, error: null };
            } else {
                throw new Error('REGISTRATION_FAILED');
            }

        } catch (error: unknown) {
            errorHandler.handle(error, 'AuthService.signUp');

            let message = 'UNKNOWN_ERROR';
            if (error.message === 'NETWORK_UNREACHABLE') message = 'NETWORK_ERROR';
            else if (error.message === 'RATE_LIMIT_EXCEEDED') message = 'TOO_MANY_REQUESTS';
            else if (error.message === 'EMAIL_EXISTS') message = 'USER_ALREADY_EXISTS';
            else if (error.message === 'REGISTRATION_FAILED') message = 'FAILED_TO_CREATE_ACCOUNT';
            else message = error.message || 'SIGNUP_ERROR';

            return {
                user: null,
                session: null,
                error: message
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
