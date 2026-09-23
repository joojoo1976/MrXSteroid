/**
 * Unit tests for server/auth/passwordSafety.ts — HIBP k-anonymity check.
 * The HIBP network leaf is mocked (vi.stubGlobal fetch); no real calls.
 * Locks the security contract:
 *   - Only the 5-char SHA-1 prefix is ever requested from HIBP.
 *   - Statuses are limited to leaked | safe | temporarily_unavailable.
 *   - Fail-CLOSED is the default; open is an explicit env override.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { checkPasswordLeaked, passwordLeakFailMode } from './passwordSafety';

const sha1Hex = (password: string): string =>
    createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();

const mockFetch = (impl: (url: string, init?: RequestInit) => Promise<Response>) => {
    vi.stubGlobal('fetch', vi.fn(impl));
};

const rangeResponse = (suffixes: string[]): Response =>
    new Response(suffixes.map((s) => `${s}:4`).join('\n'), { status: 200 });

const PASSWORD = 'SuperSecretP@ssw0rd!2026';
const FULL_HASH = sha1Hex(PASSWORD);
const PREFIX = FULL_HASH.slice(0, 5);
const SUFFIX = FULL_HASH.slice(5);

describe('checkPasswordLeaked', () => {
    beforeEach(() => {
        delete process.env.PASSWORD_LEAK_CHECK_FAIL_MODE;
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        delete process.env.PASSWORD_LEAK_CHECK_FAIL_MODE;
    });

    it('returns safe when the suffix is absent from the HIBP range', async () => {
        const fetchMock = vi.fn(async () => rangeResponse(['FFFFFFFFFFA', '000000000B']));
        vi.stubGlobal('fetch', fetchMock);

        const result = await checkPasswordLeaked(PASSWORD, 'closed');
        expect(result).toBe('safe');
    });

    it('returns leaked when the suffix is present in the range', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => rangeResponse([SUFFIX])));
        const result = await checkPasswordLeaked(PASSWORD, 'closed');
        expect(result).toBe('leaked');
    });

    it('sends only the 5-char SHA-1 prefix to HIBP (k-anonymity contract)', async () => {
        const fetchMock = vi.fn(async () => rangeResponse([]));
        vi.stubGlobal('fetch', fetchMock);

        await checkPasswordLeaked(PASSWORD, 'closed');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const url = String(fetchMock.mock.calls[0][0]);
        expect(url).toBe(`https://api.pwnedpasswords.com/range/${PREFIX}`);
        // The full hash / password must never leave this machine via the URL.
        expect(url).not.toContain(FULL_HASH);
        expect(url).not.toContain(PASSWORD);
        // Async padding requested to defeat frequency side-channels.
        const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
        expect(headers['Add-Padding']).toBe('true');
    });

    it('returns temporarily_unavailable (fail-closed) on a network failure', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('socket hang up'))));
        expect(await checkPasswordLeaked(PASSWORD, 'closed')).toBe('temporarily_unavailable');
    });

    it('returns safe (fail-open) on a network failure when mode is open', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('socket hang up'))));
        expect(await checkPasswordLeaked(PASSWORD, 'open')).toBe('safe');
    });

    it('returns temporarily_unavailable (fail-closed) when HIBP responds non-2xx', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 429 })));
        expect(await checkPasswordLeaked(PASSWORD, 'closed')).toBe('temporarily_unavailable');
    });

    it('returns safe (fail-open) on non-2xx when mode is open', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
        expect(await checkPasswordLeaked(PASSWORD, 'open')).toBe('safe');
    });

    it('is case-insensitive when matching HIBP suffixes', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => rangeResponse([SUFFIX.toLowerCase()])));
        expect(await checkPasswordLeaked(PASSWORD, 'closed')).toBe('leaked');
    });
});

describe('passwordLeakFailMode', () => {
    afterEach(() => delete process.env.PASSWORD_LEAK_CHECK_FAIL_MODE);

    it('defaults to closed when the env var is absent', () => {
        delete process.env.PASSWORD_LEAK_CHECK_FAIL_MODE;
        expect(passwordLeakFailMode()).toBe('closed');
    });

    it('honors an explicit open override', () => {
        process.env.PASSWORD_LEAK_CHECK_FAIL_MODE = 'open';
        expect(passwordLeakFailMode()).toBe('open');
    });

    it('treats an invalid value as closed (no accidental fail-open)', () => {
        process.env.PASSWORD_LEAK_CHECK_FAIL_MODE = 'banana';
        expect(passwordLeakFailMode()).toBe('closed');
    });
});