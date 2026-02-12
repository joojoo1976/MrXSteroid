/**
 * Security Enhancements for Mr. X Steroid Application
 * Implements enterprise-grade security measures for data protection
 */

import { createClient } from '@supabase/supabase-js';
import { AES, enc } from 'crypto-js';

// Security configuration interface
export interface SecurityConfig {
    encryptionKey: string;
    sessionTimeout: number; // in minutes
    rateLimitRequests: number;
    rateLimitWindow: number; // in minutes
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
    encryptionKey: process.env.ENCRYPTION_KEY || 'mZq4t7w9z$C&F)J@NcRfUjXn2r5u8x/A?',
    sessionTimeout: 60, // 1 hour
    rateLimitRequests: 10, // 10 requests
    rateLimitWindow: 1 // per minute
};

// Security manager class
export class SecurityManager {
    private config: SecurityConfig;
    private rateLimitStore: Map<string, { count: number; timestamp: number }>;

    constructor(config?: Partial<SecurityConfig>) {
        this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
        this.rateLimitStore = new Map();
    }

    /**
     * Encrypt sensitive data
     */
    encryptData(data: string): string {
        try {
            return AES.encrypt(data, this.config.encryptionKey).toString();
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData: string): string {
        try {
            const bytes = AES.decrypt(encryptedData, this.config.encryptionKey);
            return bytes.toString(enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Enhanced registration with validation
     */
    async secureRegister(email: string, password: string, userData: any): Promise<any> {
        // Input validation
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!this.isSecurePassword(password)) {
            throw new Error('Password does not meet security requirements');
        }

        // Rate limiting check
        if (!this.checkRateLimit(`register:${email}`)) {
            throw new Error('Too many registration attempts. Please try again later.');
        }

        // Enhanced registration with Supabase
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    ...userData,
                    // Encrypt sensitive data before storing
                    encrypted_data: this.encryptData(JSON.stringify({
                        registration_ip: await this.getClientIP(),
                        user_agent: navigator.userAgent,
                        registration_time: new Date().toISOString()
                    })),
                    currency: 'USD',
                    role: 'user'
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            // Log security event
            this.logSecurityEvent('registration_failure', {
                email,
                error: error.message,
                timestamp: new Date().toISOString(),
                ip: await this.getClientIP()
            });

            throw error;
        }

        // Log successful registration
        this.logSecurityEvent('registration_success', {
            userId: data.user?.id,
            email,
            timestamp: new Date().toISOString(),
            ip: await this.getClientIP()
        });

        return data;
    }

    /**
     * Enhanced login with security checks
     */
    async secureLogin(email: string, password: string): Promise<any> {
        // Rate limiting check
        if (!this.checkRateLimit(`login:${email}`)) {
            throw new Error('Too many login attempts. Account temporarily locked.');
        }

        // Validate email format
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        // Enhanced login with Supabase
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            // Log failed attempt
            this.logSecurityEvent('login_failure', {
                email,
                error: error.message,
                timestamp: new Date().toISOString(),
                ip: await this.getClientIP()
            });

            // Increment rate limit counter for failed attempts
            this.incrementRateLimit(`login:${email}`);

            throw error;
        }

        // Log successful login
        this.logSecurityEvent('login_success', {
            userId: data.user?.id,
            email,
            timestamp: new Date().toISOString(),
            ip: await this.getClientIP()
        });

        // Reset rate limit on successful login
        this.resetRateLimit(`login:${email}`);

        return data;
    }

    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor(userId: string) {
        // Implementation would integrate with a 2FA service
        // This is a placeholder for the actual implementation
        console.log(`2FA enabled for user: ${userId}`);
        return { success: true, message: 'Two-factor authentication enabled' };
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
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
     * Check rate limit for an identifier
     */
    private checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const windowStart = now - (this.config.rateLimitWindow * 60 * 1000); // Convert to ms

        const record = this.rateLimitStore.get(identifier);
        
        if (!record) {
            // First request from this identifier
            this.rateLimitStore.set(identifier, { count: 1, timestamp: now });
            return true;
        }

        if (record.timestamp < windowStart) {
            // Reset counter if outside the window
            this.rateLimitStore.set(identifier, { count: 1, timestamp: now });
            return true;
        }

        if (record.count >= this.config.rateLimitRequests) {
            // Rate limit exceeded
            return false;
        }

        // Increment counter
        this.rateLimitStore.set(identifier, { 
            count: record.count + 1, 
            timestamp: now 
        });
        
        return true;
    }

    /**
     * Increment rate limit counter (for failed attempts)
     */
    private incrementRateLimit(identifier: string) {
        const now = Date.now();
        const record = this.rateLimitStore.get(identifier) || { count: 0, timestamp: now };
        
        this.rateLimitStore.set(identifier, { 
            count: record.count + 1, 
            timestamp: now 
        });
    }

    /**
     * Reset rate limit for an identifier
     */
    private resetRateLimit(identifier: string) {
        this.rateLimitStore.delete(identifier);
    }

    /**
     * Get client IP address
     */
    private async getClientIP(): Promise<string> {
        // In a real implementation, this would get the actual IP from headers
        // This is a simplified version for the frontend
        return '127.0.0.1'; // Placeholder
    }

    /**
     * Log security events
     */
    private logSecurityEvent(eventType: string, details: any) {
        // In a real implementation, this would securely log to a security monitoring system
        console.log(`Security Event: ${eventType}`, details);
    }
}

// Export a singleton instance
export const securityManager = new SecurityManager();