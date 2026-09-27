import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { Language } from '@/shared/types/types';

let mockLanguage: Language = Language.EN;

vi.mock('./PreferencesContext', () => ({
    usePreferences: () => ({ language: mockLanguage }),
}));

import { RuntimeTranslationProvider, RUNTIME_TARGET_STORAGE_KEY } from './RuntimeTranslationProvider';
import { useRuntimeTranslation } from './RuntimeTranslationContext';

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

const IDENTITY = {
    engineVersion: 'v1',
    glossaryVersion: 'none',
    modelIdentifier: 'projects/p/locations/global/models/general/nmt',
    providerId: 'google-advanced-v3',
};

let getHandler: (url: string, init?: RequestInit) => Response;
let postHandler: (url: string, init?: RequestInit) => Response;

function installFetch() {
    const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        return init?.method === 'POST' ? postHandler(url, init) : getHandler(url, init);
    });
    vi.stubGlobal('fetch', mock);
    return mock;
}

function Probe() {
    const state = useRuntimeTranslation();
    return (
        <div>
            <span data-testid="status">{state.status}</span>
            <span data-testid="targets">{state.targets.map((entry) => entry.code).join(',')}</span>
            <span data-testid="error-code">{state.error?.code ?? ''}</span>
            <span data-testid="target">{state.target ?? ''}</span>
            <span data-testid="active">{String(state.isActive)}</span>
            <button type="button" onClick={() => state.setTarget('de')}>
                pick-de
            </button>
            <button type="button" onClick={() => state.setTarget('xx')}>
                pick-xx
            </button>
            <button type="button" onClick={() => state.refresh()}>
                refresh
            </button>
        </div>
    );
}

function renderProvider() {
    return render(
        <RuntimeTranslationProvider>
            <Probe />
        </RuntimeTranslationProvider>
    );
}

/**
 * `vitest.setup.ts` installs a non-functional localStorage stub (every method is
 * a bare `vi.fn()`), so persistence behaviour cannot be observed through it.
 * This is a real in-memory replacement, scoped to this suite.
 */
function installLocalStorage() {
    const store = new Map<string, string>();
    const stub = {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => void store.set(key, String(value)),
        removeItem: (key: string) => void store.delete(key),
        clear: () => store.clear(),
        get length() {
            return store.size;
        },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
    };
    Object.defineProperty(window, 'localStorage', { value: stub, writable: true, configurable: true });
    return store;
}

beforeEach(() => {
    mockLanguage = Language.EN;
    document.body.innerHTML = '';
    installLocalStorage();
    getHandler = () => jsonResponse({
        ok: true,
        languages: [
            { code: 'fr', displayName: 'French', nativeName: 'Français', rtl: false },
            { code: 'de', displayName: 'German', nativeName: 'Deutsch', rtl: false },
        ],
    });
    postHandler = () =>
        jsonResponse({
            ok: true,
            sourceLanguage: 'en',
            targetLanguage: 'fr',
            surface: 'hero',
            translations: ['Commencez'],
            identity: IDENTITY,
        });
});

afterEach(() => {
    // RTL auto-cleanup only registers with vitest `globals: true`, which this
    // project does not enable. Explicit cleanup also unmounts the provider, which
    // is what triggers its scanner restore — so a leaked provider cannot leave
    // machine-translated text in the document for the next test.
    cleanup();
    vi.unstubAllGlobals();
});

describe('T3 · provider · capability states', () => {
    it('becomes ready with only provider-verified targets', async () => {
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        expect(screen.getByTestId('targets').textContent).toBe('fr,de');
        expect(screen.getByTestId('error-code').textContent).toBe('');
    });

    it('reports PROVIDER_NOT_CONFIGURED as unavailable, not as an empty list', async () => {
        getHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'no provider', retryable: true } },
                503
            );
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unavailable'));
        expect(screen.getByTestId('error-code').textContent).toBe('PROVIDER_NOT_CONFIGURED');
        expect(screen.getByTestId('targets').textContent).toBe('');
    });

    it('keeps PROVIDER_CAPABILITY_UNAVAILABLE distinct', async () => {
        getHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'PROVIDER_CAPABILITY_UNAVAILABLE', message: 'vendor down', retryable: true } },
                503
            );
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unavailable'));
        expect(screen.getByTestId('error-code').textContent).toBe('PROVIDER_CAPABILITY_UNAVAILABLE');
    });

    it('reports a 429 as limited', async () => {
        getHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'RATE_LIMITED', message: 'slow down', retryable: true } },
                429
            );
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('limited'));
    });

    it('reports a transport failure as an error state', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('offline');
            })
        );
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
    });
});

describe('T3 · provider · the English-only gate (§3)', () => {
    it('is inactive and issues no request when the page is in Arabic', async () => {
        mockLanguage = Language.AR;
        const mockFetch = installFetch();
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('inactive'));
        expect(mockFetch).not.toHaveBeenCalled();
        expect(screen.getByTestId('targets').textContent).toBe('');
    });

    it('never offers Arabic as a runtime target', async () => {
        getHandler = () =>
            jsonResponse({
                ok: true,
                languages: [
                    { code: 'fr', displayName: 'French', nativeName: 'Français', rtl: false },
                    { code: 'ar', displayName: 'Arabic', nativeName: 'العربية', rtl: true },
                ],
            });
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        // Even if a provider claimed it, the client refuses to expose 'ar'.
        expect(screen.getByTestId('targets').textContent).not.toContain('ar');
    });
});

describe('T3 · provider · target selection', () => {
    it('adopts a stored preference only when the provider verified it', async () => {
        window.localStorage.setItem(RUNTIME_TARGET_STORAGE_KEY, 'de');
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        await waitFor(() => expect(screen.getByTestId('target').textContent).toBe('de'));
    });

    it('discards a stored preference the provider did not verify', async () => {
        window.localStorage.setItem(RUNTIME_TARGET_STORAGE_KEY, 'pt');
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        expect(screen.getByTestId('target').textContent).toBe('');
    });

    it('refuses a selection outside the verified set', async () => {
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

        await act(async () => {
            screen.getByText('pick-xx').click();
        });
        expect(screen.getByTestId('target').textContent).toBe('');
    });

    it('accepts a verified selection and persists it', async () => {
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

        await act(async () => {
            screen.getByText('pick-de').click();
        });
        expect(screen.getByTestId('target').textContent).toBe('de');
        expect(window.localStorage.getItem(RUNTIME_TARGET_STORAGE_KEY)).toBe('de');
    });

    it('drops the target when a refresh finds the provider gone', async () => {
        installFetch();
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        await act(async () => {
            screen.getByText('pick-de').click();
        });
        expect(screen.getByTestId('target').textContent).toBe('de');

        getHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'gone', retryable: false } },
                503
            );
        await act(async () => {
            screen.getByText('refresh').click();
        });

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unavailable'));
        // An unavailable provider must never keep a live target.
        expect(screen.getByTestId('target').textContent).toBe('');
        expect(screen.getByTestId('targets').textContent).toBe('');
    });
});

describe('T3 · provider · L2 scanning lifecycle', () => {
    it('translates a marked surface for the chosen target', async () => {
        document.body.innerHTML = '<h1 data-mrx-surface="hero">Welcome aboard</h1>';
        const mockFetch = installFetch();
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        await act(async () => {
            screen.getByText('pick-de').click();
        });

        await waitFor(() => {
            const heading = document.querySelector('h1');
            expect(heading?.textContent).toBe('Commencez');
        });
        const postCalls = mockFetch.mock.calls.filter(([, init]) => (init as RequestInit)?.method === 'POST');
        expect(postCalls.length).toBeGreaterThan(0);
    });

    it('restores English when the target is cleared', async () => {
        document.body.innerHTML = '<h1 data-mrx-surface="hero">Welcome aboard</h1>';
        installFetch();
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        await act(async () => {
            screen.getByText('pick-de').click();
        });
        await waitFor(() => expect(document.querySelector('h1')?.textContent).toBe('Commencez'));

        await act(async () => {
            screen.getByText('pick-de').click();
        });
        await waitFor(() => expect(document.querySelector('h1')?.textContent).toBe('Welcome aboard'));
    });

    it('leaves English in place when the provider fails', async () => {
        document.body.innerHTML = '<h1 data-mrx-surface="hero">Welcome aboard</h1>';
        postHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'PROVIDER_ERROR', message: 'boom', retryable: true } },
                502
            );
        installFetch();
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
        await act(async () => {
            screen.getByText('pick-de').click();
        });

        await waitFor(() => {
            expect(document.querySelector('h1')?.textContent).toBe('Welcome aboard');
        });
    });

    it('does not scan while the provider is unavailable', async () => {
        document.body.innerHTML = '<h1 data-mrx-surface="hero">Welcome aboard</h1>';
        getHandler = () =>
            jsonResponse(
                { ok: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'no provider', retryable: false } },
                503
            );
        const mockFetch = installFetch();
        renderProvider();

        await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unavailable'));
        expect(mockFetch.mock.calls.filter(([, init]) => (init as RequestInit)?.method === 'POST')).toHaveLength(0);
        expect(document.querySelector('h1')?.textContent).toBe('Welcome aboard');
    });
});
