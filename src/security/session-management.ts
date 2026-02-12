/**
 * Session Management for Mr. X Steroid Application
 * Implements secure session management with timeout and validation
 */

import { createClient } from '@supabase/supabase-js';

export interface SessionConfig {
    timeout: number; // in minutes
    refreshThreshold: number; // in minutes before expiry to refresh
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
}

const DEFAULT_SESSION_CONFIG: SessionConfig = {
    timeout: 60, // 1 hour
    refreshThreshold: 10, // Refresh if session expires in 10 mins
    secure: true,
    sameSite: 'strict'
};

export class SessionManager {
    private config: SessionConfig;
    private sessionStartTime: number | null = null;
    private sessionTimeoutId: NodeJS.Timeout | null = null;

    constructor(config?: Partial<SessionConfig>) {
        this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    }

    /**
     * Initialize session with timeout
     */
    async initializeSession() {
        this.sessionStartTime = Date.now();
        
        // Set up session timeout
        this.setupSessionTimeout();
        
        // Set up periodic session validation
        this.startSessionValidation();
        
        // Log session start
        this.logSessionEvent('session_start', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: await this.getClientIP()
        });
    }

    /**
     * Set up session timeout
     */
    private setupSessionTimeout() {
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
        }

        const timeoutMs = this.config.timeout * 60 * 1000; // Convert to milliseconds
        
        this.sessionTimeoutId = setTimeout(() => {
            this.handleSessionTimeout();
        }, timeoutMs);
    }

    /**
     * Handle session timeout
     */
    private async handleSessionTimeout() {
        // Log timeout event
        this.logSessionEvent('session_timeout', {
            duration: this.getSessionDuration(),
            timestamp: new Date().toISOString()
        });

        // Sign out user
        await this.signOut();
    }

    /**
     * Start periodic session validation
     */
    private startSessionValidation() {
        // Check session validity periodically
        setInterval(async () => {
            await this.validateSession();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Validate current session
     */
    async validateSession(): Promise<boolean> {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            // Session is invalid, sign out
            await this.signOut();
            return false;
        }

        // Check if session is close to expiry
        const expiryTime = new Date(session.expires_at!).getTime();
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        const thresholdMs = this.config.refreshThreshold * 60 * 1000;

        if (timeUntilExpiry < thresholdMs) {
            // Refresh session
            await this.refreshSession();
        }

        return true;
    }

    /**
     * Refresh session
     */
    async refreshSession() {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
            console.error('Session refresh failed:', error);
            // Log security event
            this.logSessionEvent('session_refresh_failed', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return false;
        }

        // Log successful refresh
        this.logSessionEvent('session_refreshed', {
            timestamp: new Date().toISOString()
        });

        // Reset timeout
        this.setupSessionTimeout();
        
        return true;
    }

    /**
     * Sign out user and clear session
     */
    async signOut() {
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL!,
            process.env.VITE_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Sign out failed:', error);
        }

        // Clear session timeout
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
            this.sessionTimeoutId = null;
        }

        // Log sign out event
        this.logSessionEvent('session_signed_out', {
            duration: this.getSessionDuration(),
            timestamp: new Date().toISOString()
        });

        // Redirect to login
        window.location.href = '/login';
    }

    /**
     * Get session duration in minutes
     */
    private getSessionDuration(): number {
        if (!this.sessionStartTime) return 0;
        return Math.floor((Date.now() - this.sessionStartTime) / (1000 * 60));
    }

    /**
     * Get client IP address (would be implemented server-side in practice)
     */
    private async getClientIP(): Promise<string> {
        try {
            // In a real implementation, this would call a server endpoint
            // to get the client's IP address securely
            const response = await fetch('/api/client-ip');
            const data = await response.json();
            return data.ip || 'unknown';
        } catch (error) {
            console.error('Failed to get client IP:', error);
            return 'unknown';
        }
    }

    /**
     * Log session events
     */
    private logSessionEvent(eventType: string, details: any) {
        // In a real implementation, this would securely log to a server
        console.log(`Session Event: ${eventType}`, details);
    }

    /**
     * Check if session is active
     */
    isActive(): boolean {
        return this.sessionStartTime !== null;
    }

    /**
     * Get session duration
     */
    getDuration(): number {
        return this.getSessionDuration();
    }
}

// Export a singleton instance
export const sessionManager = new SessionManager();