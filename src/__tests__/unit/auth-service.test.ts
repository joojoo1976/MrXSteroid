import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../../shared/lib/auth-service';
import { supabase } from '../../../shared/lib/supabase';

// Mock the supabase client
vi.mock('../../../shared/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn()
        }
    }
}));

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

            const mockResponse = {
                data: { 
                    user: { id: 'test-user-id', email: 'test@example.com' }, 
                    session: { access_token: 'test-token' } 
                },
                error: null
            };

            vi.spyOn(supabase.auth, 'signUp').mockResolvedValue(mockResponse);

            const result = await authService.signUp(mockUserData);

            expect(result).toEqual({
                user: mockResponse.data.user,
                session: mockResponse.data.session,
                error: null
            });

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

            const mockError = { message: 'User already registered', status: 400 };
            vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({ data: { user: null, session: null }, error: mockError });

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

            const mockResponse = {
                data: { 
                    user: { id: 'test-user-id', email: 'test@example.com' }, 
                    session: { access_token: 'test-token' } 
                },
                error: null
            };

            vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue(mockResponse);

            const result = await authService.signIn(email, password);

            expect(result).toEqual({
                user: mockResponse.data.user,
                session: mockResponse.data.session,
                error: null
            });

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email,
                password
            });
        });

        it('should handle sign in errors', async () => {
            const email = 'test@example.com';
            const password = 'wrong-password';

            const mockError = { message: 'Invalid login credentials', status: 400 };
            vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({ data: { user: null, session: null }, error: mockError });

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
            const mockResponse = { error: null };
            vi.spyOn(supabase.auth, 'signOut').mockResolvedValue(mockResponse);

            await authService.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
        });

        it('should handle sign out errors', async () => {
            const mockError = new Error('Sign out failed');
            vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: mockError });

            // Capture console.error calls
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await authService.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Sign out error:', mockError);

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
            expect(authService.isValidUsername('ab')).toBe(false); // Too short
            expect(authService.isValidUsername('')).toBe(false);
            expect(authService.isValidUsername('user@name')).toBe(false); // Invalid chars
        });
    });
});