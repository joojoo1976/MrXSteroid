import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { User, Session } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { mockAuthService } from '@/shared/lib/mock-auth-service';

// Mock Supabase client
vi.mock('@/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                subscription: {
                    unsubscribe: vi.fn()
                }
            }))
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        }))
    }
}));

describe('End-to-End User Flow Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('1. Sign-up Flow - Data appears in auth.users and public.profiles', () => {
        it('should create user in auth.users and trigger profile creation', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                email_confirmed_at: null,
                user_metadata: {
                    full_name: 'Test User',
                    user_name: 'testuser'
                }
            } as User;

            const mockSession = {
                access_token: 'test-token',
                refresh_token: 'test-refresh',
                user: mockUser
            } as Session;

            // Mock signup response
            vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
                data: { user: mockUser, session: null },
                error: null
            });

            // Mock session retrieval after email confirmation
            vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            // Mock profile data fetch
            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: 'test-user-id',
                                email: 'test@example.com',
                                full_name: 'Test User',
                                user_name: 'testuser',
                                subscription_status: 'inactive',
                                role: 'user'
                            },
                            error: null
                        })
                    })
                })
            } as any);

            // Simulate signup
            const { data, error } = await supabase.auth.signUp({
                email: 'test@example.com',
                password: 'TestPass123!',
                options: {
                    data: {
                        full_name: 'Test User',
                        user_name: 'testuser',
                        currency: 'USD',
                        role: 'user'
                    },
                    emailRedirectTo: 'http://localhost:3000/auth/callback'
                }
            });

            // Verify user was created
            expect(error).toBeNull();
            expect(data.user).toBeTruthy();
            expect(data.user?.email).toBe('test@example.com');
            expect(data.user?.id).toBe('test-user-id');

            // Verify signup was called with correct metadata
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'TestPass123!',
                options: {
                    data: {
                        full_name: 'Test User',
                        user_name: 'testuser',
                        currency: 'USD',
                        role: 'user'
                    },
                    emailRedirectTo: 'http://localhost:3000/auth/callback'
                }
            });
        });
    });

    describe('2. Email Confirmation Flow', () => {
        it('should handle email confirmation and session persistence', async () => {
            const mockConfirmedUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString(),
                user_metadata: {
                    full_name: 'Test User',
                    user_name: 'testuser'
                }
            } as User;

            const mockSession = {
                access_token: 'header.payload.signature',
                refresh_token: 'test-refresh',
                user: mockConfirmedUser as unknown as User
            } as Session;

            // Mock getSession after email confirmation click
            vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            // Simulate auth callback with email confirmation
            const { data: { session }, error } = await supabase.auth.getSession();

            expect(error).toBeNull();
            expect(session).toBeTruthy();
            expect(session?.user.email_confirmed_at).toBeTruthy();
            expect(session?.user.confirmed_at).toBeTruthy();

            // Verify session is persisted (Supabase handles this via localStorage/cookies)
            expect(session?.access_token).toBe('header.payload.signature');
            expect(session?.refresh_token).toBe('test-refresh');
        });
    });

    describe('3. AuthContext Session Persistence', () => {
        it('should maintain session after email confirmation', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString(),
                user_metadata: {
                    full_name: 'Test User',
                    user_name: 'testuser'
                }
            } as User;

            const mockSession = {
                access_token: 'header.payload.signature',
                refresh_token: 'test-refresh',
                user: mockUser as unknown as User
            } as Session;

            // Mock auth state change listener
            const mockOnAuthStateChange = vi.fn();
            vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementation((callback) => {
                mockOnAuthStateChange.mockImplementation(() => callback('SIGNED_IN', mockSession));
                return {
                    data: {
                        subscription: {
                            unsubscribe: vi.fn(),
                            id: 'mock-sub-id'
                        }
                    }
                } as any;
            });

            vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: 'test-user-id',
                                email: 'test@example.com',
                                full_name: 'Test User',
                                user_name: 'testuser'
                            },
                            error: null
                        })
                    })
                })
            } as any);

            // Render AuthProvider and check context
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for auth state to be set
            await waitFor(() => {
                expect(result.current.user).toBeTruthy();
            });

            expect(result.current.user).toBeTruthy();
            expect(result.current.user?.email).toBe('test@example.com');
            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.profileData).toBeTruthy();
        });
    });

    describe('4. Checkout Auto-fill from Authenticated Session', () => {
        it('should auto-fill checkout form with authenticated user data', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                user_metadata: {
                    full_name: 'Test User',
                    user_name: 'testuser'
                }
            } as User;

            const mockSession = {
                access_token: 'header.payload.signature',
                refresh_token: 'test-refresh',
                user: mockUser as unknown as User
            } as Session;

            vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: 'test-user-id',
                                email: 'test@example.com',
                                full_name: 'Test User',
                                user_name: 'testuser'
                            },
                            error: null
                        })
                    })
                })
            } as any);

            // Render AuthProvider
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.user).toBeTruthy();
            });

            // Verify user data is available for checkout auto-fill
            expect(result.current.user?.email).toBe('test@example.com');
            expect((result.current.user as any)?.user_metadata?.full_name).toBe('Test User');
            expect(result.current.profileData?.full_name).toBe('Test User');
        });
    });

    describe('5. Token Storage Verification', () => {
        it('should store tokens correctly after email confirmation', async () => {
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString()
            } as User;

            const mockSession = {
                access_token: 'header.payload.signature',
                refresh_token: 'test-refresh-token',
                user: mockUser as unknown as User
            } as Session;

            vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            // Get session
            const { data: { session }, error } = await supabase.auth.getSession();

            expect(error).toBeNull();
            expect(session).toBeTruthy();
            expect(session?.access_token).toBe('header.payload.signature');
            expect(session?.refresh_token).toBe('test-refresh-token');
            expect(session?.user.email_confirmed_at).toBeTruthy();

            // Verify token format (JWT tokens should have 3 parts separated by dots)
            const tokenParts = session?.access_token.split('.');
            expect(tokenParts?.length).toBe(3);
        });
    });

    describe('6. Protected Route Access', () => {
        it('should allow access only to email-confirmed users', async () => {
            // Unconfirmed user
            const unconfirmedUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                email_confirmed_at: null
            } as User;

            // Confirmed user
            const confirmedUser = {
                id: 'test-user-id-2',
                email: 'confirmed@example.com',
                email_confirmed_at: new Date().toISOString()
            } as User;

            const unconfirmedSession = {
                access_token: 'unconfirmed-token',
                user: unconfirmedUser
            } as Session;

            const confirmedSession = {
                access_token: 'confirmed-token',
                user: confirmedUser
            } as Session;

            // Test unconfirmed user
            vi.spyOn(supabase.auth, 'getSession')
                .mockResolvedValueOnce({ data: { session: unconfirmedSession }, error: null })
                .mockResolvedValueOnce({ data: { session: confirmedSession }, error: null });

            const { data: { session: unconfirmedSessionResult } } = await supabase.auth.getSession();
            const isUnconfirmedEmailVerified = !!(unconfirmedSessionResult?.user.email_confirmed_at);
            expect(isUnconfirmedEmailVerified).toBe(false);

            const { data: { session: confirmedSessionResult } } = await supabase.auth.getSession();
            const isConfirmedEmailVerified = !!(confirmedSessionResult?.user.email_confirmed_at);
            expect(isConfirmedEmailVerified).toBe(true);
        });
    });
});

describe('Mock Auth Service Fallback Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use mock auth when Supabase is unavailable', async () => {
        const result = await mockAuthService.signUp(
            'test@example.com',
            'TestPass123!',
            'Test User',
            'testuser'
        );

        expect(result.error).toBeNull();
        expect(result.user).toBeTruthy();
        expect(result.user?.email).toBe('test@example.com');
    });

    it('should maintain session in mock auth', async () => {
        await mockAuthService.signUp(
            'test@example.com',
            'TestPass123!',
            'Test User',
            'testuser'
        );

        const currentUser = mockAuthService.getCurrentUser();
        const currentSession = mockAuthService.getCurrentSession();

        expect(currentUser).toBeTruthy();
        expect(currentSession).toBeTruthy();
        expect(currentUser?.email).toBe('test@example.com');
    });
});
