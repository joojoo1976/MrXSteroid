
import { supabase } from './supabase';
import { errorHandler } from './error-handler';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { securityManager } from './security-enhancements';

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
            // Input validation
            if (!this.isValidEmail(email)) {
                throw new Error('INVALID_EMAIL_FORMAT');
            }

            if (!this.isSecurePassword(password)) {
                throw new Error('WEAK_PASSWORD_REQUIREMENTS');
            }

            if (!full_name || full_name.trim().length < 2) {
                throw new Error('FULL_NAME_TOO_SHORT');
            }

            if (!user_name || user_name.trim().length < 3) {
                throw new Error('USERNAME_TOO_SHORT');
            }

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
                if (error.message.includes('INVALID_EMAIL_FORMAT')) message = 'Email format is invalid';
                else if (error.message.includes('WEAK_PASSWORD_REQUIREMENTS')) message = 'Password does not meet security requirements';
                else if (error.message.includes('FULL_NAME_TOO_SHORT')) message = 'Full name is too short';
                else if (error.message.includes('USERNAME_TOO_SHORT')) message = 'Username is too short';
                else if (error.message.includes('NETWORK_UNREACHABLE')) message = 'NETWORK_ERROR';
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
            // Input validation
            if (!this.isValidEmail(email)) {
                throw new Error('INVALID_EMAIL_FORMAT');
            }

            if (password.length < 1) {
                throw new Error('PASSWORD_REQUIRED');
            }

            const data = await securityManager.secureLogin(email, password);

            return { user: data.user, session: data.session, error: null };
        } catch (error: unknown) {
            errorHandler.handle(error, 'AuthService.signIn');

            let message = 'UNKNOWN_ERROR';
            if (error instanceof Error) {
                if (error.message.includes('INVALID_EMAIL_FORMAT')) message = 'Email format is invalid';
                else if (error.message.includes('PASSWORD_REQUIRED')) message = 'Password is required';
                else message = error.message;
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
    },

    /**
     * Validates email format
     */
    isValidEmail(email: string): boolean {
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
    }
};
