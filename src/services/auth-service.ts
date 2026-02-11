
import { supabase } from '../lib/supabase';
import { errorHandler } from '../lib/error-handler';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { securityManager } from '../security/security-enhancements';

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
            // Use enhanced security manager for registration
            const data = await securityManager.secureRegister(email, password, {
                full_name,
                user_name,
                currency: 'USD',
                role: 'user'
            });

            if (data.user) {
                return { user: data.user, session: data.session, error: null };
            } else {
                throw new Error('REGISTRATION_FAILED');
            }

        } catch (error: unknown) {
            errorHandler.handle(error, 'AuthService.signUp');

            let message = 'UNKNOWN_ERROR';
            if (error instanceof Error) {
                if (error.message.includes('NETWORK_UNREACHABLE')) message = 'NETWORK_ERROR';
                else if (error.message.includes('RATE_LIMIT_EXCEEDED')) message = 'TOO_MANY_REQUESTS';
                else if (error.message.includes('EMAIL_EXISTS')) message = 'USER_ALREADY_EXISTS';
                else if (error.message.includes('REGISTRATION_FAILED')) message = 'FAILED_TO_CREATE_ACCOUNT';
                else message = error.message;
            } else {
                message = 'SIGNUP_ERROR';
            }

            return {
                user: null,
                session: null,
                error: message
            };
        }
    },

    /**
     * Signs in a user with enhanced security.
     */
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const data = await securityManager.secureLogin(email, password);

            return { user: data.user, session: data.session, error: null };
        } catch (error: unknown) {
            errorHandler.handle(error, 'AuthService.signIn');

            let message = 'UNKNOWN_ERROR';
            if (error instanceof Error) {
                message = error.message;
            }

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
