import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from './AdminDashboard';

const mocks = vi.hoisted(() => {
    const authState = {
        user: { id: 'admin-1', email: 'admin@example.com' },
        profileData: {
            full_name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            subscription_status: 'active',
            created_at: '2026-01-01T00:00:00.000Z',
        },
        loading: false,
        signOut: async () => undefined,
    };
    const prefsState = {
        language: 'en' as 'en' | 'ar',
        isRTL: false,
        unitSystem: 'metric' as 'metric' | 'imperial',
        theme: 'dark' as 'dark' | 'light' | 'system',
        setLanguage: () => undefined,
        setUnitSystem: () => undefined,
        setTheme: () => undefined,
    };
    const from = vi.fn();
    return { authState, prefsState, from };
});

vi.mock('@/context/AuthContext', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/context/PreferencesContext', () => ({ usePreferences: () => mocks.prefsState }));
vi.mock('@/shared/lib/supabase', () => ({ supabase: { from: mocks.from } }));

describe('AdminDashboard', () => {
    afterEach(() => cleanup());

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.authState.profileData = {
            full_name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            subscription_status: 'active',
            created_at: '2026-01-01T00:00:00.000Z',
        };
        mocks.prefsState.language = 'en';
        mocks.prefsState.isRTL = false;

        mocks.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: () => ({
                        order: () => ({
                            limit: async () => ({
                                data: [
                                    { id: 'u1', full_name: 'George Mourice', user_name: 'george', email: 'owner@example.com', role: 'user', subscription_status: 'active', subscription_tier: 'pro', created_at: '2026-01-15T10:00:00.000Z' },
                                ],
                                error: null,
                                count: 1,
                            }),
                        }),
                    }),
                };
            }
            if (table === 'calculator_history') {
                return {
                    select: () => ({
                        order: () => ({
                            limit: async () => ({
                                data: [{ id: 'h1', tool: 'macro', title: 'Adaptive Macro Calculator', created_at: new Date().toISOString() }],
                                error: null,
                                count: 1,
                            }),
                        }),
                    }),
                };
            }
            if (table === 'payment_intents') {
                return {
                    select: () => ({
                        order: () => ({
                            limit: async () => ({ data: [], error: null, count: 0 }),
                        }),
                    }),
                };
            }
            if (table === 'tool_registry') {
                return {
                    select: () => ({
                        order: () => ({
                            limit: async () => ({ data: [{ sequence_number: 1, slug: 'macro-calculator', name_en: 'Macro', name_ar: 'ماكرو', is_active: true }], error: null }),
                        }),
                    }),
                };
            }
            if (table === 'admin_dashboard_metrics') {
                return {
                    select: () => ({
                        limit: () => ({
                            maybeSingle: async () => ({ data: null, error: null }),
                        }),
                    }),
                };
            }
            return { select: () => ({ order: () => ({ limit: async () => ({ data: [], error: null, count: 0 }) }), limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) };
        });
    });

    it('renders admin overview with real counts', async () => {
        render(<AdminDashboard />);

        expect(screen.getByTestId('admin-dashboard-root')).toHaveAttribute('dir', 'ltr');
        await waitFor(() => {
            expect(screen.getByTestId('admin-kpi-users')).toHaveTextContent('1');
        });
        expect(screen.getByTestId('admin-kpi-results')).toHaveTextContent('1');
        expect(screen.getAllByText(/Admin User/).length).toBeGreaterThan(0);
    });

    it('renders right-to-left when Arabic is active', async () => {
        mocks.prefsState.language = 'ar';
        mocks.prefsState.isRTL = true;

        render(<AdminDashboard />);

        expect(screen.getByTestId('admin-dashboard-root')).toHaveAttribute('dir', 'rtl');
    });

    it('shows read-only users and reports empty states', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await user.click(screen.getByTestId('admin-nav-users'));
        expect(await screen.findByText(/George Mourice/)).toBeInTheDocument();

        await user.click(screen.getByTestId('admin-nav-reports'));
        expect(screen.getByTestId('admin-reports-empty')).toBeInTheDocument();
    });

    it('opens the mobile navigation drawer', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await user.click(screen.getByLabelText('Open navigation'));
        expect(screen.getAllByLabelText('Close navigation').length).toBeGreaterThan(0);
    });
});
