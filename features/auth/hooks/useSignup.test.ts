// @vitest-environment jsdom
/**
 * Unit tests for useSignup:
 *  - createSignupSchema: relaxed password rule (>=6 chars, no complexity).
 *  - emailTaken: debounced profiles lookup drives the amber "already
 *    registered" flag, clearing on email change.
 * Supabase + env-reader are mocked; no network.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ContentStrings } from '@/shared/types/types';

// Set env before any module-level config parsing runs.
vi.hoisted(() => {
    process.env.MODE = 'test';
    process.env.NODE_ENV = 'test';
});

const lookup = vi.hoisted(() => ({ result: { data: null as unknown } }));

vi.mock('../../../shared/lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                ilike: () => ({
                    maybeSingle: async () => lookup.result,
                }),
            }),
        }),
    },
}));

vi.mock('../../../shared/lib/env-reader', () => ({
    readEnv: (k: string) => {
        if (k === 'MODE') return 'test';
        if (k.includes('URL')) return 'https://test.supabase.co';
        return 'test-anon-key';
    },
}));

// Avoid the real mock-auth-service module (it touches localStorage at import).
vi.mock('../../../shared/lib/mock-auth-service', () => ({
    mockAuthService: { signUp: vi.fn(), signIn: vi.fn() },
}));

import { useSignup, createSignupSchema } from './useSignup';

const baseForm = {
    fullName: 'Test User',
    username: 'testuser',
    email: 'user@example.com',
    phoneNumber: '',
};

describe('createSignupSchema — relaxed password rule', () => {
    const schema = createSignupSchema(false);

    it('accepts a 6-char simple password (no complexity required)', () => {
        const r = schema.safeParse({ ...baseForm, password: 'abc123', confirmPassword: 'abc123' });
        expect(r.success).toBe(true);
    });

    it('accepts an all-uppercase 8-char password (previously rejected)', () => {
        const r = schema.safeParse({ ...baseForm, password: 'PASSWORD', confirmPassword: 'PASSWORD' });
        expect(r.success).toBe(true);
    });

    it('rejects a password shorter than 6', () => {
        const r = schema.safeParse({ ...baseForm, password: 'abc12', confirmPassword: 'abc12' });
        expect(r.success).toBe(false);
    });

    it('rejects mismatched confirmation', () => {
        const r = schema.safeParse({ ...baseForm, password: 'abc123', confirmPassword: 'abc124' });
        expect(r.success).toBe(false);
    });
});

describe('useSignup — emailTaken amber flag', () => {
    beforeEach(() => { lookup.result = { data: null }; });

    it('sets emailTaken when the email exists in profiles, clears on change', async () => {
        const { result } = renderHook(() => useSignup({ content: {} as unknown as ContentStrings, isRTL: false }));

        expect(result.current.emailTaken).toBe(false);

        lookup.result = { data: { id: 'existing' } };
        act(() => { result.current.form.setValue('email', 'taken@example.com'); });
        await waitFor(() => expect(result.current.emailTaken).toBe(true), { timeout: 2000 });

        lookup.result = { data: null };
        act(() => { result.current.form.setValue('email', 'free@example.com'); });
        await waitFor(() => expect(result.current.emailTaken).toBe(false), { timeout: 2000 });
    });

    it('does not flag an invalid/incomplete email', async () => {
        lookup.result = { data: { id: 'x' } };
        const { result } = renderHook(() => useSignup({ content: {} as unknown as ContentStrings, isRTL: false }));
        act(() => { result.current.form.setValue('email', 'not-an-email'); });
        // give the debounce window time to (not) fire
        await new Promise((r) => setTimeout(r, 700));
        expect(result.current.emailTaken).toBe(false);
    });
});
