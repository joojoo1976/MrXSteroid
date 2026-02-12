/**
 * Two-Factor Authentication Service for Mr. X Steroid Application
 * Implements OTP-based two-factor authentication
 */

import { createClient } from '@supabase/supabase-js';

export interface OTPConfig {
    digits: number;
    expiration: number; // in minutes
    resendCooldown: number; // in seconds
    maxAttempts: number;
}

const DEFAULT_OTP_CONFIG: OTPConfig = {
    digits: 6,
    expiration: 10, // 10 minutes
    resendCooldown: 60, // 1 minute
    maxAttempts: 3
};

export class OTPService {
    private config: OTPConfig;
    private otpStore: Map<string, { code: string; expiry: number; attempts: number; lastSent: number }>;
    private cooldownStore: Map<string, number>;

    constructor(config?: Partial<OTPConfig>) {
        this.config = { ...DEFAULT_OTP_CONFIG, ...config };
        this.otpStore = new Map();
        this.cooldownStore = new Map();
    }

    /**
     * Generate a secure OTP code
     */
    private generateOTP(): string {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < this.config.digits; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    /**
     * Send OTP to user's phone or email
     */
    async sendOTP(userId: string, destination: string, destinationType: 'phone' | 'email' = 'email'): Promise<boolean> {
        // Check if user is in cooldown period
        const cooldownExpiry = this.cooldownStore.get(userId);
        if (cooldownExpiry && Date.now() < cooldownExpiry) {
            const remaining = Math.ceil((cooldownExpiry - Date.now()) / 1000);
            throw new Error(`Please wait ${remaining} seconds before requesting another OTP`);
        }

        // Generate OTP
        const otp = this.generateOTP();
        const expiry = Date.now() + (this.config.expiration * 60 * 1000); // Convert to milliseconds

        // Store OTP with expiry and attempt tracking
        this.otpStore.set(userId, {
            code: otp,
            expiry,
            attempts: 0,
            lastSent: Date.now()
        });

        // Set cooldown
        this.cooldownStore.set(userId, Date.now() + (this.config.resendCooldown * 1000));

        try {
            // Send OTP via appropriate channel
            if (destinationType === 'phone') {
                await this.sendSMSOTP(destination, otp);
            } else {
                await this.sendEmailOTP(destination, otp);
            }

            // Log OTP sending event
            this.logSecurityEvent('otp_sent', {
                userId,
                destination,
                destinationType,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Failed to send OTP:', error);
            // Remove OTP from store if sending failed
            this.otpStore.delete(userId);
            throw new Error('Failed to send OTP. Please try again later.');
        }
    }

    /**
     * Verify OTP code
     */
    async verifyOTP(userId: string, otp: string): Promise<boolean> {
        const storedData = this.otpStore.get(userId);

        if (!storedData) {
            throw new Error('No OTP sent to this user');
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiry) {
            this.otpStore.delete(userId);
            throw new Error('OTP has expired. Please request a new one.');
        }

        // Check if max attempts reached
        if (storedData.attempts >= this.config.maxAttempts) {
            this.otpStore.delete(userId);
            throw new Error('Maximum verification attempts reached. Please request a new OTP.');
        }

        // Verify OTP
        if (storedData.code !== otp) {
            // Increment attempts
            this.otpStore.set(userId, {
                ...storedData,
                attempts: storedData.attempts + 1
            });

            // Log failed attempt
            this.logSecurityEvent('otp_verification_failed', {
                userId,
                attempts: storedData.attempts + 1,
                timestamp: new Date().toISOString()
            });

            const remainingAttempts = this.config.maxAttempts - (storedData.attempts + 1);
            if (remainingAttempts > 0) {
                throw new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
            } else {
                throw new Error('Maximum verification attempts reached. Please request a new OTP.');
            }
        }

        // OTP is valid, remove from store
        this.otpStore.delete(userId);

        // Log successful verification
        this.logSecurityEvent('otp_verified', {
            userId,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    /**
     * Send OTP via SMS
     */
    private async sendSMSOTP(phoneNumber: string, otp: string): Promise<void> {
        // In a real implementation, this would integrate with an SMS service like Twilio
        console.log(`Sending OTP ${otp} to phone: ${phoneNumber}`);
        
        // Example integration with a service (pseudo-code):
        /*
        await twilio.messages.create({
            body: `Your Mr. X Steroid verification code is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        */
    }

    /**
     * Send OTP via Email
     */
    private async sendEmailOTP(email: string, otp: string): Promise<void> {
        // In a real implementation, this would integrate with an email service
        console.log(`Sending OTP ${otp} to email: ${email}`);
        
        // Example integration with a service (pseudo-code):
        /*
        await sendgrid.send({
            to: email,
            from: process.env.EMAIL_FROM_ADDRESS,
            subject: 'Mr. X Steroid - Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `<p>Your verification code is: <strong>${otp}</strong></p>`
        });
        */
    }

    /**
     * Enable 2FA for a user
     */
    async enable2FA(userId: string, phoneNumber?: string, email?: string): Promise<boolean> {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        // Update user metadata to enable 2FA
        const { error } = await supabase.auth.updateUser({
            data: {
                two_factor_enabled: true,
                phone_number: phoneNumber,
                email_2fa: email
            }
        });

        if (error) {
            console.error('Failed to enable 2FA:', error);
            throw error;
        }

        // Log 2FA enablement
        this.logSecurityEvent('2fa_enabled', {
            userId,
            phoneNumber: phoneNumber ? true : false,
            email: email ? true : false,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    /**
     * Disable 2FA for a user
     */
    async disable2FA(userId: string): Promise<boolean> {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.updateUser({
            data: {
                two_factor_enabled: false
            }
        });

        if (error) {
            console.error('Failed to disable 2FA:', error);
            throw error;
        }

        // Log 2FA disablement
        this.logSecurityEvent('2fa_disabled', {
            userId,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    /**
     * Log security events
     */
    private logSecurityEvent(eventType: string, details: any) {
        // In a real implementation, this would securely log to a security monitoring system
        console.log(`Security Event: ${eventType}`, details);
    }

    /**
     * Check if 2FA is enabled for a user
     */
    async is2FAEnabled(userId: string): Promise<boolean> {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Failed to get user for 2FA check:', error);
            return false;
        }

        return user?.user_metadata?.two_factor_enabled || false;
    }
}

// Export a singleton instance
export const otpService = new OTPService();