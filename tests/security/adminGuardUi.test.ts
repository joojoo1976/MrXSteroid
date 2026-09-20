// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import AdminGuard from '../../features/auth/AdminGuard';
import * as AuthContextModule from '../../context/AuthContext';

// Avoid touching localStorage during import
vi.mock('../../shared/lib/mock-auth-service', () => ({
    mockAuthService: { getCurrentUser: vi.fn(), getCurrentSession: vi.fn() },
}));

describe('AdminGuard UI Security (RBAC)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('DENIES access when user has user_metadata.role = "admin" but DB profile has role = "user"', async () => {
        // Attacker manipulated their client-side JWT metadata to claim admin
        const mockUser = {
            id: 'user-attacker',
            email: 'attacker@example.com',
            user_metadata: { role: 'admin' },
        };

        // Real profile in the database is regular user
        const mockProfileData = {
            role: 'user',
        };

        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: mockUser as any,
            session: {} as any,
            loading: false,
            signOut: vi.fn(),
            isAuthenticated: true,
            profileData: mockProfileData as any,
            refreshUser: vi.fn(),
        });

        render(
            React.createElement(
                AdminGuard,
                null,
                React.createElement('div', { 'data-testid': 'admin-secret-content' }, 'SECRET_ADMIN_DASHBOARD')
            )
        );

        // Advance timers to trigger the microtask / effect timer
        act(() => {
            vi.advanceTimersByTime(10);
        });

        // The secret content must NOT be rendered
        expect(screen.queryByTestId('admin-secret-content')).toBeNull();
        // Access Denied screen must be shown
        expect(screen.getByText(/Access Denied/i)).toBeDefined();
    });

    it('DENIES access on fallback timeout if user has user_metadata.role = "admin" but profile is not verified admin', async () => {
        const mockUser = {
            id: 'user-attacker',
            email: 'attacker@example.com',
            user_metadata: { role: 'admin' },
        };

        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: mockUser as any,
            session: {} as any,
            loading: false,
            signOut: vi.fn(),
            isAuthenticated: true,
            profileData: null, // Profile never resolved
            refreshUser: vi.fn(),
        });

        render(
            React.createElement(
                AdminGuard,
                null,
                React.createElement('div', { 'data-testid': 'admin-secret-content' }, 'SECRET_ADMIN_DASHBOARD')
            )
        );

        // Advance timers past the 4000ms fallback deadline
        act(() => {
            vi.advanceTimersByTime(4500);
        });

        expect(screen.queryByTestId('admin-secret-content')).toBeNull();
        expect(screen.getByText(/Access Denied/i)).toBeDefined();
    });

    it('GRANTS access when profiles.role is "admin" from the database', async () => {
        const mockUser = {
            id: 'user-admin',
            email: 'admin@mrxsteroid.com',
            user_metadata: { role: 'user' }, // Even if metadata says user
        };

        const mockProfileData = {
            role: 'admin', // Trusted DB profile says admin
        };

        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: mockUser as any,
            session: {} as any,
            loading: false,
            signOut: vi.fn(),
            isAuthenticated: true,
            profileData: mockProfileData as any,
            refreshUser: vi.fn(),
        });

        render(
            React.createElement(
                AdminGuard,
                null,
                React.createElement('div', { 'data-testid': 'admin-secret-content' }, 'SECRET_ADMIN_DASHBOARD')
            )
        );

        act(() => {
            vi.advanceTimersByTime(10);
        });

        expect(screen.getByTestId('admin-secret-content')).toBeDefined();
        expect(screen.getByText('SECRET_ADMIN_DASHBOARD')).toBeDefined();
    });
});
