/**
 * Mock Auth Service for Mr. X Steroid Application
 * Provides authentication functionality when Supabase is not available
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Mock user data interface
export interface MockUser {
    id: string;
    email: string;
    full_name: string;
    user_name: string;
    subscription_status: string;
    created_at: string;
    role: 'user' | 'delegate' | 'admin';
}

// Mock session interface
export interface MockSession {
    access_token: string;
    refresh_token: string;
    expires_at: string;
    user: MockUser;
}

// Mock auth response
export interface MockAuthResponse {
    user: MockUser | null;
    session: MockSession | null;
    error: string | null;
}

// Mock auth service class
class MockAuthService {
    private currentUser: MockUser | null = null;
    private currentSession: MockSession | null = null;
    private users: MockUser[] = [];
    private storageKey = 'mrx_mock_auth';

    constructor() {
        // Load user from localStorage if exists
        this.loadStoredAuth();
    }

    /**
     * Load stored authentication from localStorage
     */
    private loadStoredAuth() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.currentUser = data.user;
                this.currentSession = data.session;
            }
        } catch (error) {
            console.error('Failed to load stored auth:', error);
        }
    }

    /**
     * Store authentication in localStorage
     */
    private storeAuth() {
        try {
            if (this.currentUser && this.currentSession) {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    user: this.currentUser,
                    session: this.currentSession
                }));
            } else {
                localStorage.removeItem(this.storageKey);
            }
        } catch (error) {
            console.error('Failed to store auth:', error);
        }
    }

    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, fullName: string, userName: string): Promise<MockAuthResponse> {
        // Input validation
        if (!this.isValidEmail(email)) {
            return { user: null, session: null, error: 'Invalid email format' };
        }

        if (!this.isSecurePassword(password)) {
            return { user: null, session: null, error: 'Password does not meet security requirements' };
        }

        if (!fullName || fullName.trim().length < 2) {
            return { user: null, session: null, error: 'Full name is too short' };
        }

        if (!userName || userName.trim().length < 3) {
            return { user: null, session: null, error: 'Username is too short' };
        }

        // Check if user already exists
        const existingUser = this.users.find(u => u.email === email);
        if (existingUser) {
            return { user: null, session: null, error: 'Email already exists' };
        }

        // Create new user
        const newUser: MockUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            full_name: fullName,
            user_name: userName,
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            role: 'user'
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        
        // Create mock session
        this.currentSession = {
            access_token: `mock_token_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
            user: newUser
        };

        this.storeAuth();

        // Show success message
        toast.success('Account created successfully!');

        return { user: newUser, session: this.currentSession, error: null };
    }

    /**
     * Sign in a user
     */
    async signIn(email: string, password: string): Promise<MockAuthResponse> {
        // Input validation
        if (!this.isValidEmail(email)) {
            return { user: null, session: null, error: 'Invalid email format' };
        }

        if (!password) {
            return { user: null, session: null, error: 'Password is required' };
        }

        // Find user
        const user = this.users.find(u => u.email === email);
        if (!user) {
            return { user: null, session: null, error: 'User not found' };
        }

        // In a real implementation, we would verify the password
        // For mock implementation, we'll assume password is valid if user exists
        this.currentUser = user;
        
        // Create mock session
        this.currentSession = {
            access_token: `mock_token_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
            user
        };

        this.storeAuth();

        // Show success message
        toast.success('Login successful!');

        return { user, session: this.currentSession, error: null };
    }

    /**
     * Sign out the current user
     */
    async signOut(): Promise<void> {
        this.currentUser = null;
        this.currentSession = null;
        this.storeAuth();
        
        // Show success message
        toast.success('Logged out successfully!');
    }

    /**
     * Get current user
     */
    getCurrentUser(): MockUser | null {
        return this.currentUser;
    }

    /**
     * Get current session
     */
    getCurrentSession(): MockSession | null {
        return this.currentSession;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.currentUser !== null && this.currentSession !== null;
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
     * Update user profile
     */
    async updateUserProfile(updates: Partial<MockUser>): Promise<MockAuthResponse> {
        if (!this.currentUser) {
            return { user: null, session: null, error: 'No user is logged in' };
        }

        // Update user data
        this.currentUser = { ...this.currentUser, ...updates };
        
        // Update session user data
        if (this.currentSession) {
            this.currentSession.user = this.currentUser;
        }

        this.storeAuth();

        return { user: this.currentUser, session: this.currentSession, error: null };
    }
}

// Create and export a singleton instance
export const mockAuthService = new MockAuthService();

// React hook for authentication
export const useMockAuth = () => {
    const [user, setUser] = useState<MockUser | null>(mockAuthService.getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check auth status on component mount
        setLoading(false);
        
        // Update user state when auth changes
        const updateUser = () => {
            setUser(mockAuthService.getCurrentUser());
        };

        // For mock implementation, we'll just update on mount
        updateUser();
    }, []);

    return {
        user,
        loading,
        isAuthenticated: mockAuthService.isAuthenticated(),
        signUp: mockAuthService.signUp.bind(mockAuthService),
        signIn: mockAuthService.signIn.bind(mockAuthService),
        signOut: mockAuthService.signOut.bind(mockAuthService),
        updateUserProfile: mockAuthService.updateUserProfile.bind(mockAuthService)
    };
};