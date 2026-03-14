import { supabase } from './supabase';
/**
 * Enhanced Security Module for Mr. X Steroid Application
 */

export interface SecurityOptions {
    enableTwoFactor?: boolean;
    sessionTimeout?: number; // in minutes
    maxLoginAttempts?: number;
    lockoutDuration?: number; // in minutes
}

export class SecurityManager {
    private static readonly DEFAULT_OPTIONS: SecurityOptions = {
        enableTwoFactor: false,
        sessionTimeout: 60, // 1 hour
        maxLoginAttempts: 5,
        lockoutDuration: 30 // 30 minutes
    };

    private options: SecurityOptions;

    constructor(options: SecurityOptions = {}) {
        this.options = { ...SecurityManager.DEFAULT_OPTIONS, ...options };
    }

    /**
     * Enhanced user registration with security validations
     */
    async secureRegister(email: string, password: string, userData: any) {
        // Input validation
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!this.isSecurePassword(password)) {
            throw new Error('Password does not meet security requirements');
        }

        // Rate limiting check would go here
        const rateLimitCheck = await this.checkRateLimit(email, 'register');
        if (!rateLimitCheck.allowed) {
            throw new Error(`Too many registration attempts. Try again in ${rateLimitCheck.retryAfter} minutes.`);
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        ...userData,
                        registration_ip: await this.getClientIP(),
                        registration_timestamp: new Date().toISOString(),
                        registration_user_agent: navigator.userAgent
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            // Log the response for debugging
            console.log("SecurityManager secureRegister response:", { data, error });

            if (error) {
                console.error("SecurityManager secureRegister error:", error);
                throw error;
            }

            // Log registration event for security monitoring
            await this.logSecurityEvent('registration_attempt', {
                email,
                success: !!data.user,
                timestamp: new Date().toISOString(),
                ip: await this.getClientIP()
            });

            return data;
        } catch (error) {
            await this.logSecurityEvent('registration_failure', {
                email,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
                ip: await this.getClientIP()
            });
            throw error;
        }
    }

    /**
     * Enhanced login with security checks
     */
    async secureLogin(email: string, password: string) {
        // Check if account is locked
        const lockStatus = await this.getAccountLockStatus(email);
        if (lockStatus.isLocked) {
            throw new Error(`Account temporarily locked. Try again after ${lockStatus.unlockTime}.`);
        }

        // Rate limiting check
        const rateLimitCheck = await this.checkRateLimit(email, 'login');
        if (!rateLimitCheck.allowed) {
            throw new Error(`Too many login attempts. Try again in ${rateLimitCheck.retryAfter} minutes.`);
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Increment failed login attempt
                await this.incrementFailedLoginAttempt(email);

                await this.logSecurityEvent('login_failure', {
                    email,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    ip: await this.getClientIP()
                });

                throw error;
            }

            // Reset failed attempts on successful login
            await this.resetFailedLoginAttempts(email);

            // Log successful login
            await this.logSecurityEvent('login_success', {
                email,
                userId: data.user?.id,
                timestamp: new Date().toISOString(),
                ip: await this.getClientIP()
            });

            // Apply session timeout if configured
            if (this.options.sessionTimeout) {
                this.applySessionTimeout(this.options.sessionTimeout);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Two-factor authentication (placeholder implementation)
     */
    async enableTwoFactor(userId: string) {
        if (!this.options.enableTwoFactor) {
            throw new Error('Two-factor authentication is not enabled in configuration');
        }

        // In a real implementation, this would integrate with a 2FA service
        // like Twilio, Google Authenticator, etc.
        console.log(`Two-factor authentication enabled for user: ${userId}`);
        return { success: true, message: 'Two-factor authentication setup initiated' };
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check password security requirements
     */
    private isSecurePassword(password: string): boolean {
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

    /**
     * Get client IP address (would need backend implementation in practice)
     */
    private async getClientIP(): Promise<string> {
        // In a real implementation, this would come from a backend service
        // due to limitations of getting real IP from browser
        return '127.0.0.1'; // Placeholder
    }

    /**
     * Get account lock status (public-facing method)
     */
    private async getAccountLockStatus(email: string): Promise<{ isLocked: boolean; unlockTime?: string }> {
        return this.checkAccountLockStatus(email);
    }

    /**
     * Check account lock status
     */
    private async checkAccountLockStatus(email: string): Promise<{ isLocked: boolean; unlockTime?: string }> {
        // In a real implementation, this would check a cache/database for lock status
        return { isLocked: false }; // Placeholder
    }

    /**
     * Check rate limits
     */
    private async checkRateLimit(identifier: string, action: string): Promise<{ allowed: boolean; retryAfter?: number }> {
        // In a real implementation, this would check against a rate limiting service
        return { allowed: true }; // Placeholder
    }

    /**
     * Increment failed login attempts
     */
    private async incrementFailedLoginAttempt(email: string) {
        // In a real implementation, this would update a counter in cache/database
        console.log(`Incremented failed login attempt for: ${email}`);
    }

    /**
     * Reset failed login attempts
     */
    private async resetFailedLoginAttempts(email: string) {
        // In a real implementation, this would reset the counter
        console.log(`Reset failed login attempts for: ${email}`);
    }

    /**
     * Log security events
     */
    private async logSecurityEvent(eventType: string, details: any) {
        // In a real implementation, this would securely log to a security monitoring system
        console.log(`Security Event: ${eventType}`, details);
    }

    /**
     * Apply session timeout
     */
    private applySessionTimeout(timeoutMinutes: number) {
        // Set a timer to log out the user after the specified time
        setTimeout(async () => {
            await supabase.auth.signOut();
            alert('Session expired. Please log in again.');
        }, timeoutMinutes * 60 * 1000);
    }
}

// Export a singleton instance with default options
export const securityManager = new SecurityManager();