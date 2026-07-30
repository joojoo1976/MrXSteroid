
import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignUpOptions {
    email: string;
    password: string;
    full_name: string;
    user_name: string;
    phone_number?: string;
}

export interface AuthResponse {
    user: User | null;
    session: Session | null;
    error: AuthError | string | null;
}

/**
 * Enterprise Auth Service for Mr. X Steroid
 * Handles User Registration with Metadata, Phone Number, Dual Login and Error Safety
 */
export const authService = {
    /**
     * Validates email format
     */
    isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validates phone number format
     */
    isValidPhone(phone: string): boolean {
        if (!phone) return false;
        // Strip spaces, dashes, parentheses
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        // Must contain 7-15 digits, optional leading +
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        return phoneRegex.test(cleanPhone);
    },

    /**
     * Detects if an identifier string is an email or phone number
     */
    getIdentifierType(identifier: string): 'email' | 'phone' | 'invalid' {
        if (!identifier || !identifier.trim()) return 'invalid';
        const trimmed = identifier.trim();
        if (this.isValidEmail(trimmed)) return 'email';
        if (this.isValidPhone(trimmed)) return 'phone';
        return 'invalid';
    },

    /**
     * Validates password strength
     */
    isSecurePassword(password: string): boolean {
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
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        return usernameRegex.test(username);
    },

    /**
     * Registers a new user with metadata, phone number and localized redirects.
     */
    async signUp({ email, password, full_name, user_name, phone_number }: SignUpOptions): Promise<AuthResponse> {
        try {
            if (!email || email.trim() === '') {
                return { user: null, session: null, error: 'Email is required' };
            }

            if (!this.isValidEmail(email)) {
                return { user: null, session: null, error: 'Email format is invalid' };
            }

            if (phone_number && phone_number.trim() && !this.isValidPhone(phone_number)) {
                return { user: null, session: null, error: 'Phone number format is invalid' };
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

            const cleanPhone = phone_number ? phone_number.replace(/[\s\-\(\)]/g, '') : null;

            // Check if phone number is already registered in profiles
            if (cleanPhone) {
                const { data: existingPhone } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('phone_number', cleanPhone)
                    .maybeSingle();

                if (existingPhone) {
                    return { user: null, session: null, error: 'Phone number is already registered' };
                }
            }

            const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                phone: cleanPhone || undefined,
                options: {
                    data: {
                        full_name: full_name.trim(),
                        user_name: user_name.trim(),
                        phone_number: cleanPhone,
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
     * Signs in a user with dual identifier support (Email OR Phone Number).
     */
    async signIn(identifier: string, password: string): Promise<AuthResponse> {
        try {
            if (!identifier || !identifier.trim()) {
                return { user: null, session: null, error: 'Email or phone number is required' };
            }

            if (!password || password.length < 1) {
                return { user: null, session: null, error: 'Password is required' };
            }

            const cleanInput = identifier.trim();
            const idType = this.getIdentifierType(cleanInput);

            let targetEmail = cleanInput;

            if (idType === 'phone') {
                const cleanPhone = cleanInput.replace(/[\s\-\(\)]/g, '');
                const phoneVariants = Array.from(new Set([
                    cleanPhone,
                    cleanPhone.startsWith('+') ? cleanPhone.slice(1) : '+' + cleanPhone,
                    cleanPhone.startsWith('00') ? '+' + cleanPhone.slice(2) : cleanPhone,
                ]));

                let foundEmail: string | null = null;

                // 1. Try to find profile by phone number variants
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('email, phone_number')
                    .in('phone_number', phoneVariants)
                    .limit(1);

                if (profiles && profiles.length > 0 && profiles[0].email) {
                    foundEmail = profiles[0].email;
                } else {
                    // 2. Try RPC function get_email_by_phone
                    try {
                        const { data: rpcEmail } = await supabase.rpc('get_email_by_phone', { p_phone: cleanPhone });
                        if (rpcEmail) foundEmail = rpcEmail;
                    } catch (_) { /* ignore if RPC not present */ }
                }

                if (foundEmail) {
                    targetEmail = foundEmail;
                } else {
                    // 3. Try direct phone auth via Supabase Native Phone Auth (E.164)
                    const e164Phone = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
                    const { data: phoneAuthData, error: phoneAuthError } = await supabase.auth.signInWithPassword({
                        phone: e164Phone,
                        password
                    });

                    if (!phoneAuthError && phoneAuthData.user) {
                        return {
                            user: phoneAuthData.user,
                            session: phoneAuthData.session,
                            error: null
                        };
                    }

                    return { user: null, session: null, error: 'No account found with this phone number' };
                }
            } else if (idType === 'invalid') {
                return { user: null, session: null, error: 'Please enter a valid email address or phone number' };
            }

            // Perform sign in with resolved email
            const { data, error } = await supabase.auth.signInWithPassword({
                email: targetEmail,
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
