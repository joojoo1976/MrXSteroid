// @vitest-environment jsdom
/**
 * Unit tests for usePasswordReset — locks the reset security contract:
 *   - The server-side leaked-password check runs BEFORE updateUser.
 *   - Only 'safe' proceeds to supabase.auth.updateUser.
 *   - 'leaked' / 'temporarily_unavailable' (fail-closed) / 'rate_limited'
 *     all block the password change.
 *   - The password is never echoed in state or returned values.
 * Supabase + password-safety-client + error-handler are mocked; no network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const updateUser = vi.hoisted(() => vi.fn(async () => ({ error: null })));
vi.mock('../../../shared/lib/supabase', () => ({
    supabase: { auth: { updateUser } },
}));

const pwCheck = vi.hoisted(() => ({
    result: { status: 'safe' as const },
    fn: vi.fn(async () => pwCheck.result),
}));
vi.mock('../../../shared/lib/password-safety-client', () => ({
    checkPasswordServerSide: pwCheck.fn,
}));

const handle = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/lib/error-handler', () => ({
    errorHandler: { handle },
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() },
}));

import { usePasswordReset } from './usePasswordReset';

const VALID = { password: 'Str0ng!Pass', confirmPassword: 'Str0ng!Pass' };

describe('usePasswordReset — server-side leaked-password gate', () => {
    beforeEach(() => {
        pwCheck.result = { status: 'safe' };
        updateUser.mockClear();
        handle.mockClear();
    });
    afterEach(() => vi.clearAllMocks());

    it('proceeds to updateUser only when the server check is safe', async () => {
        const { result } = renderHook(() =>
            usePasswordReset({ isRTL: false, successMessage: 'Password updated successfully!' })
        );

        let ok = false;
        await act(async () => { ok = await result.current.runReset(VALID); });

        expect(ok).toBe(true);
        expect(updateUser).toHaveBeenCalledTimes(1);
        expect(updateUser).toHaveBeenCalledWith({ password: VALID.password });
        expect(result.current.success).toBe(true);
    });

    it('leaked → does NOT call updateUser (returns false)', async () => {
        pwCheck.result = { status: 'leaked' };
        const { result } = renderHook(() =>
            usePasswordReset({ isRTL: false, successMessage: 'ok' })
        );

        let ok = true;
        await act(async () => { ok = await result.current.runReset(VALID); });

        expect(ok).toBe(false);
        expect(updateUser).not.toHaveBeenCalled();
        expect(result.current.success).toBe(false);
    });

    it('temporarily_unavailable (fail-closed) → does NOT call updateUser', async () => {
        pwCheck.result = { status: 'temporarily_unavailable' };
        const { result } = renderHook(() =>
            usePasswordReset({ isRTL: false, successMessage: 'ok' })
        );

        let ok = true;
        await act(async () => { ok = await result.current.runReset(VALID); });

        expect(ok).toBe(false);
        expect(updateUser).not.toHaveBeenCalled();
    });

    it('rate_limited → does NOT call updateUser', async () => {
        pwCheck.result = { status: 'rate_limited' };
        const { result } = renderHook(() =>
            usePasswordReset({ isRTL: false, successMessage: 'ok' })
        );

        let ok = true;
        await act(async () => { ok = await result.current.runReset(VALID); });

        expect(ok).toBe(false);
        expect(updateUser).not.toHaveBeenCalled();
    });

    it('sends an updateUser error to the error handler and returns false', async () => {
        updateUser.mockResolvedValueOnce({ error: new Error('AuthApiError') });
        const { result } = renderHook(() =>
            usePasswordReset({ isRTL: false, successMessage: 'ok' })
        );

        let ok = true;
        await act(async () => { ok = await result.current.runReset(VALID); });

        expect(ok).toBe(false);
        expect(handle).toHaveBeenCalled();
        expect(result.current.success).toBe(false);
    });
});