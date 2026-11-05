import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserDashboard from './UserDashboard';

const mocks = vi.hoisted(() => {
    const authState: {
        user: { id: string; email: string } | null;
        profileData: Record<string, unknown> | null;
        loading: boolean;
        signOut: () => Promise<void>;
    } = {
        user: { id: 'user-1', email: 'owner@example.com' },
        profileData: {
            full_name: 'George Mourice',
            email: 'owner@example.com',
            subscription_status: 'active',
            created_at: '2026-01-15T10:00:00.000Z',
        },
        loading: false,
        signOut: async () => undefined,
    };
    const prefsState: {
        language: 'en' | 'ar';
        isRTL: boolean;
        unitSystem: 'metric' | 'imperial';
        theme: 'dark' | 'light' | 'system';
        setLanguage: (value: string) => void;
        setUnitSystem: (value: string) => void;
        setTheme: (value: string) => void;
    } = {
        language: 'en',
        isRTL: false,
        unitSystem: 'metric',
        theme: 'dark',
        setLanguage: () => undefined,
        setUnitSystem: () => undefined,
        setTheme: () => undefined,
    };
    return {
        authState,
        prefsState,
        getCalculatorHistory: vi.fn(),
        deleteCalculatorHistory: vi.fn(),
        from: vi.fn(),
        maybeSingle: vi.fn(),
        upsert: vi.fn(),
        toastSuccess: vi.fn(),
        toastError: vi.fn(),
    };
});

vi.mock('@/context/AuthContext', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/context/PreferencesContext', () => ({ usePreferences: () => mocks.prefsState }));
vi.mock('@/shared/lib/calculator-history', () => ({
    getCalculatorHistory: mocks.getCalculatorHistory,
    deleteCalculatorHistory: mocks.deleteCalculatorHistory,
}));
vi.mock('@/shared/lib/supabase', () => ({
    supabase: { from: mocks.from },
}));
vi.mock('sonner', () => ({
    toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

const historyRows = [
    {
        id: 'h1',
        tool: 'macro',
        title: 'Adaptive Macro Calculator',
        inputs: { weightKg: 82 },
        result: { calories: 2600 },
        created_at: new Date().toISOString(),
    },
    {
        id: 'h2',
        tool: 'bodyfat',
        title: 'Body Fat Analyzer',
        inputs: { waist: 84 },
        result: { bodyFat: 14.2 },
        created_at: new Date(Date.now() - 86_400_000).toISOString(),
    },
];

describe('UserDashboard', () => {
    afterEach(() => cleanup());

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.authState.user = { id: 'user-1', email: 'owner@example.com' };
        mocks.authState.profileData = {
            full_name: 'George Mourice',
            email: 'owner@example.com',
            subscription_status: 'active',
            created_at: '2026-01-15T10:00:00.000Z',
        };
        mocks.authState.loading = false;
        mocks.prefsState.language = 'en';
        mocks.prefsState.isRTL = false;
        mocks.prefsState.unitSystem = 'metric';
        mocks.prefsState.theme = 'dark';

        mocks.getCalculatorHistory.mockResolvedValue(historyRows);
        mocks.maybeSingle.mockResolvedValue({
            data: {
                saved_notes: 'Stay consistent this cycle',
                custom_goals: { currentPhase: 'cutting' },
                updated_at: '2026-11-01T08:00:00.000Z',
            },
            error: null,
        });
        mocks.upsert.mockResolvedValue({ error: null });
        mocks.from.mockImplementation(() => ({
            select: () => ({
                eq: () => ({ maybeSingle: mocks.maybeSingle }),
            }),
            upsert: mocks.upsert,
        }));
    });

    it('renders the overview from real history and profile data', async () => {
        render(<UserDashboard />);

        expect(screen.getByTestId('dashboard-root')).toHaveAttribute('dir', 'ltr');
        await waitFor(() => {
            expect(screen.getByTestId('kpi-saved-results')).toHaveTextContent('2');
        });
        expect(screen.getByTestId('kpi-tools-used')).toHaveTextContent('2');
        expect(screen.getByTestId('kpi-current-phase')).toHaveTextContent('Cutting');
        expect(screen.getAllByText(/George Mourice/).length).toBeGreaterThan(0);
    });

    it('navigates to history and lists saved results', async () => {
        const user = userEvent.setup();
        render(<UserDashboard />);

        await user.click(screen.getByTestId('nav-history'));

        expect(await screen.findByTestId('history-list')).toHaveTextContent('Adaptive Macro Calculator');
        expect(screen.getByTestId('history-list')).toHaveTextContent('Body Fat Analyzer');
    });

    it('shows a professional empty state when no results exist', async () => {
        mocks.getCalculatorHistory.mockResolvedValue([]);
        mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
        const user = userEvent.setup();
        render(<UserDashboard />);

        await user.click(screen.getByTestId('nav-history'));

        expect(await screen.findByTestId('empty-history')).toHaveTextContent(/no saved results/i);
        await user.click(screen.getByTestId('nav-overview'));
        expect(screen.getByTestId('kpi-saved-results')).toHaveTextContent('0');
    });

    it('renders right-to-left when Arabic is active', async () => {
        mocks.prefsState.language = 'ar';
        mocks.prefsState.isRTL = true;

        render(<UserDashboard />);

        expect(screen.getByTestId('dashboard-root')).toHaveAttribute('dir', 'rtl');
        await waitFor(() => {
            expect(screen.getByTestId('dashboard-root')).toHaveTextContent(/لوحة التحكم/);
        });
    });

    it('saves goals and notes to the existing user_dashboard_data row', async () => {
        const user = userEvent.setup();
        render(<UserDashboard />);

        await user.click(screen.getByTestId('nav-goals'));
        const notes = await screen.findByTestId('goal-notes');
        await user.clear(notes);
        await user.type(notes, 'New protocol note');
        await user.click(screen.getByTestId('save-goals'));

        await waitFor(() => {
            expect(mocks.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: 'user-1',
                    saved_notes: 'New protocol note',
                    custom_goals: { currentPhase: 'cutting' },
                }),
                { onConflict: 'user_id' },
            );
        });
    });

    it('only shows the signed-in profile and never invents report data', async () => {
        const user = userEvent.setup();
        render(<UserDashboard />);

        await user.click(screen.getByTestId('nav-profile'));
        expect(await screen.findByTestId('profile-email')).toHaveTextContent('owner@example.com');

        await user.click(screen.getByTestId('nav-reports'));
        expect(screen.getByTestId('reports-empty')).toHaveTextContent(/no reports/i);
    });
});
