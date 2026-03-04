
import { supabase } from './supabase';
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
     * Validates email format
     */
    isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates password strength
     */
    isSecurePassword(password: string): boolean {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const minLength = /.{8,}/;
        const hasUpper = /[A-Z]/;
        const hasLower = /[a-z]/;
        const hasNumber = /[0-9]/;
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

        return (
            minLength.test(password) &&
            hasUpper.test(password) &&
            hasLower.test(password) &&
            hasNumber.test(password) &&
            hasSpecial.test(password)
        );
    },

    /**
     * Validates username format
     */
    isValidUsername(username: string): boolean {
        if (!username || username.trim().length < 3) {
            return false;
        }
        // Only allow alphanumeric characters and underscores
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(username);
    },

    /**
     * Registers a new user with metadata and localized redirects.
     */
    async signUp({ email, password, full_name, user_name }: SignUpOptions): Promise<AuthResponse> {
        try {
            // Input validation - check for empty first, then format
            if (!email || email.trim() === '') {
                return { user: null, session: null, error: 'Email is required' };
            }

            if (!this.isValidEmail(email)) {
                return { user: null, session: null, error: 'Email format is invalid' };
            }

            if (!password || !this.isSecurePassword(password)) {
                return { user: null, session: null, error: 'Password does not meet security requirements' };
            }

            if (!full_name || full_name.trim().length < 2) {
                return { user: null, session: null, error: 'Full name is too short' };
            }

            if (!user_name || user_name.trim().length < 3) {
                return { user: null, session: null, error: 'Username is too short' };
            }

            const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

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
                    emailRedirectTo: `${siteUrl}/auth/callback`
                }
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user,
                session: data.session,
                error: null
            };

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'SIGNUP_ERROR';
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
            // Input validation
            if (!email || !this.isValidEmail(email)) {
                return { user: null, session: null, error: 'Email format is invalid' };
            }

            if (!password || password.length < 1) {
                return { user: null, session: null, error: 'Password is required' };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user,
                session: data.session,
                error: null
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'SIGNIN_ERROR';
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
        if (error) console.error('Sign out error:', error);
    },
};
