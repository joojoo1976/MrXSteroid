// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const preferences = vi.hoisted(() => ({ unitSystem: 'metric' as 'metric' | 'imperial' }));

vi.mock('../../../context/PreferencesContext', () => ({
    usePreferences: () => ({ language: 'en', currency: 'USD', unitSystem: preferences.unitSystem }),
}));
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../../../shared/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

import { useMasterCalculator } from './useMasterCalculator';

afterEach(() => {
    cleanup();
    preferences.unitSystem = 'metric';
    vi.clearAllMocks();
});

describe('useMasterCalculator shared unit preference', () => {
    it('follows header unit changes while preserving the entered weight', async () => {
        const { result, rerender } = renderHook(() => useMasterCalculator());
        expect(result.current.state).toMatchObject({ unitSystem: 'metric', weight: 85 });

        act(() => {
            preferences.unitSystem = 'imperial';
            rerender();
        });
        await waitFor(() => expect(result.current.state).toMatchObject({ unitSystem: 'imperial', weight: 187.4 }));

        act(() => {
            preferences.unitSystem = 'metric';
            rerender();
        });
        await waitFor(() => expect(result.current.state).toMatchObject({ unitSystem: 'metric', weight: 85 }));
    });
});
