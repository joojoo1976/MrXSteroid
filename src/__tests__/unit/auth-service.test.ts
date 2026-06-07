import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/shared/lib/auth-service';
import { supabase } from '@/shared/lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

// Mock the supabase client
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn()
        }
    }
}));

// Helper to create a mock AuthError
function mockAuthError(message: string, status = 400): AuthError {
    return {
        message,
        status,
        code: 'auth_error',
        name: 'AuthError',
        __isAuthError: true
    } as unknown as AuthError;
}

describe('Authentication Service Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('signUp', () => {
        it('should register a new user successfully', async () => {
            const mockUserData = {
                email: 'test@example.com',
                password: 'TestPass123!',
                full_name: 'Test User',
                user_name: 'testuser'
            };

            const mockResponse: { data: { user: any; session: any }; error: any } = {
                data: {
                    user: { id: 'test-user-id', email: 'test@example.com', app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() },
                    session: null
                },
                error: null
            };

            vi.spyOn(supabase.auth, 'signUp').mockResolvedValue(mockResponse as any);

            const result = await authService.signUp(mockUserData);

            expect(result.user).toBeTruthy();
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: mockUserData.email,
                password: mockUserData.password,
                options: {
                    data: {
                        full_name: mockUserData.full_name,
                        user_name: mockUserData.user_name,
                        currency: 'USD',
                        role: 'user'
                    },
                    emailRedirectTo: expect.any(String)
                }
            });
        });

        it('should handle registration errors', async () => {
            const mockUserData = {
                email: 'test@example.com',
                password: 'TestPass123!',
                full_name: 'Test User',
                user_name: 'testuser'
            };

            vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
                data: { user: null, session: null },
                error: mockAuthError('User already registered', 400)
            } as any);

            const result = await authService.signUp(mockUserData);

            expect(result.error).toContain('already registered');
        });

        it('should validate email format', async () => {
            const invalidUserData = {
                email: 'invalid-email',
                password: 'TestPass123!',
                full_name: 'Test User',
                user_name: 'testuser'
            };

            const result = await authService.signUp(invalidUserData);

            expect(result.error).toContain('Email format is invalid');
        });

        it('should validate password strength', async () => {
            const weakPasswordData = {
                email: 'test@example.com',
                password: 'weak',
                full_name: 'Test User',
                user_name: 'testuser'
            };

            const result = await authService.signUp(weakPasswordData);

            expect(result.error).toContain('Password does not meet security requirements');
        });

        it('should validate required fields', async () => {
            const incompleteData = {
                email: '',
                password: '',
                full_name: '',
                user_name: ''
            };

            const result = await authService.signUp(incompleteData);

            expect(result.error).toContain('Email is required');
        });
    });

    describe('signIn', () => {
        it('should sign in user successfully', async () => {
            const email = 'test@example.com';
            const password = 'TestPass123!';

            const mockResponse: { data: { user: any; session: any }; error: any } = {
                data: {
                    user: { id: 'test-user-id', email: 'test@example.com', app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() },
                    session: { access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', user: {} }
                },
                error: null
            };

            vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue(mockResponse as any);

            const result = await authService.signIn(email, password);

            expect(result.user).toBeTruthy();
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
        });

        it('should handle sign in errors', async () => {
            const email = 'test@example.com';
            const password = 'wrong-password';

            vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
                data: { user: null, session: null },
                error: mockAuthError('Invalid login credentials', 400)
            } as any);

            const result = await authService.signIn(email, password);

            expect(result).toEqual({
                user: null,
                session: null,
                error: 'Invalid login credentials'
            });
        });

        it('should validate email format on sign in', async () => {
            const result = await authService.signIn('invalid-email', 'password');

            expect(result.error).toContain('Email format is invalid');
        });

        it('should require password on sign in', async () => {
            const result = await authService.signIn('test@example.com', '');

            expect(result.error).toContain('Password is required');
        });
    });

    describe('signOut', () => {
        it('should sign out user successfully', async () => {
            vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });

            await authService.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
        });

        it('should handle sign out errors gracefully', async () => {
            vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({
                error: mockAuthError('Sign out failed')
            } as any);

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await authService.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('validation functions', () => {
        it('should validate email correctly', () => {
            expect(authService.isValidEmail('test@example.com')).toBe(true);
            expect(authService.isValidEmail('invalid-email')).toBe(false);
            expect(authService.isValidEmail('')).toBe(false);
        });

        it('should validate password strength correctly', () => {
            expect(authService.isSecurePassword('StrongPass123!')).toBe(true);
            expect(authService.isSecurePassword('weak')).toBe(false);
            expect(authService.isSecurePassword('')).toBe(false);
        });

        it('should validate username correctly', () => {
            expect(authService.isValidUsername('validuser')).toBe(true);
            expect(authService.isValidUsername('ab')).toBe(false);
            expect(authService.isValidUsername('')).toBe(false);
            expect(authService.isValidUsername('user@name')).toBe(false);
        });
    });
});