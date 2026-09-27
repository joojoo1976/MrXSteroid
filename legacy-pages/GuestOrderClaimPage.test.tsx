/**
 * legacy-pages/GuestOrderClaimPage.test.tsx
 *
 * UI tests for the `/claim-order` page, which is the destination of the emailed
 * guest claim link. Runs in the jsdom project (see vitest.config.ts).
 *
 * WHAT IS UNDER TEST
 * A guest paid without an account, so their order settled financially and a
 * single-use, email-bound claim token was issued. This page is what turns that
 * paid-but-undelivered order into a real account. It is therefore a security
 * surface as much as a UI: it holds a live bearer credential.
 *
 * Properties pinned here:
 *   · every required state renders the right message and the right affordance
 *   · an unauthenticated visitor is NEVER allowed to redeem, and is told to sign
 *     in with the checkout email
 *   · the raw token is never rendered into the DOM
 *   · the raw token is never written to localStorage or sessionStorage
 *   · the raw token is never passed to console.log/error/warn
 *   · the token travels in the request BODY, never as a query parameter
 *   · the page never creates a user: there is no sign-up affordance, and no
 *     auth call other than reading the existing session
 *   · all authorization stays server-side: the page only reflects the response
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// ── Mocks ────────────────────────────────────────────────────────────────────

const getSession = vi.fn();
// Matches the real supabase-js shape: `{ data: { subscription } }`.
const onAuthStateChange = vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
}));

// Mock paths are resolved relative to THIS file (`legacy-pages/`), not to the
// page under test, so they are `../shared/...` rather than `../../shared/...`.
vi.mock('../shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...a: any[]) => (getSession as any)(...a),
            onAuthStateChange: (...a: any[]) => (onAuthStateChange as any)(...a),
        },
    },
}));

// The page renders a logo; stub it so the suite does not drag in the whole
// legacy visual stack.
vi.mock('../shared/ui/BrandLogo', () => ({
    default: () => <div data-testid="brand-logo" />,
}));

import GuestOrderClaimPage from './GuestOrderClaimPage';
import { Page } from '@/shared/types/types';

const TOKEN = 'RAW-CLAIM-TOKEN-must-never-appear-0123456789';
const FUTURE = '2099-01-01T00:00:00.000Z';

let fetchMock: ReturnType<typeof vi.fn>;
let navigateTo: ReturnType<typeof vi.fn>;

function signedIn(email = 'guest@example.com') {
    getSession.mockResolvedValue({
        data: { session: { access_token: 'access-token-abc', user: { id: 'u1', email } } },
    });
}

function signedOut() {
    getSession.mockResolvedValue({ data: { session: null } });
}

function jsonResponse(status: number, body: unknown): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
        text: async () => JSON.stringify(body),
    } as unknown as Response;
}

function renderPage(token = TOKEN) {
    return render(
        <GuestOrderClaimPage token={token} navigateTo={navigateTo as any} locale="en" />
    );
}

/** Bodies sent to fetch, in order, so a test can assert on the request shape. */
function requestBodies(): any[] {
    return fetchMock.mock.calls.map((c) => {
        try {
            return JSON.parse((c[1] as any).body);
        } catch {
            return null;
        }
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    (globalThis as any).fetch = fetchMock;
    navigateTo = vi.fn();
    getSession.mockResolvedValue({ data: { session: null } });
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    // Default: signed in, claim is live.
    signedIn();
    fetchMock.mockResolvedValue(
        jsonResponse(200, { ok: true, state: 'claimable', productId: 'digital', expiresAt: FUTURE })
    );
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

// ── States ───────────────────────────────────────────────────────────────────

describe('claim page states', () => {
    it('shows a loading state before anything resolves', async () => {
        fetchMock.mockReturnValue(new Promise(() => {}));
        renderPage();
        expect(screen.getByText(/Checking your claim link/i)).toBeInTheDocument();
    });

    it('shows "Ready to claim" for a live owned claim', async () => {
        renderPage();
        expect(await screen.findByText(/Your order is ready to claim/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Claim my order/i })).toBeInTheDocument();
    });

    it('shows an explicit Sign in required state and does NOT call the API', async () => {
        signedOut();
        renderPage();

        expect(await screen.findByText(/Sign in to claim/i)).toBeInTheDocument();
        // A signed-out visitor must not probe the claim endpoint at all.
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows the success state after a successful redemption', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true, productId: 'digital' }));
        screen.getByRole('button', { name: /Claim my order/i }).click();

        expect(await screen.findByText(/Your order has been claimed/i)).toBeInTheDocument();
        expect(screen.getByText(/attached to your account/i)).toBeInTheDocument();
    });

    it('shows an Invalid link state when no token is present', async () => {
        renderPage('');
        expect(await screen.findByText(/Invalid link/i)).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows an Invalid link state for an invalid token', async () => {
        fetchMock.mockResolvedValue(jsonResponse(404, { code: 'invalid_token' }));
        renderPage();
        expect(await screen.findByText(/Invalid link/i)).toBeInTheDocument();
    });

    it('shows an expired state', async () => {
        fetchMock.mockResolvedValue(jsonResponse(410, { code: 'expired' }));
        renderPage();
        expect(await screen.findByText(/This link has expired/i)).toBeInTheDocument();
    });

    it('shows an already-claimed state for an already-used token', async () => {
        fetchMock.mockResolvedValue(jsonResponse(409, { code: 'already_redeemed' }));
        renderPage();
        expect(await screen.findByText(/already been claimed/i)).toBeInTheDocument();
    });

    it('shows a wrong-account state when the signed-in email is not the owner', async () => {
        fetchMock.mockResolvedValue(jsonResponse(403, { code: 'unauthorized' }));
        renderPage();
        expect(await screen.findByText(/belongs to a different email/i)).toBeInTheDocument();
    });

    it('shows a server error state and offers a retry', async () => {
        fetchMock.mockResolvedValue(jsonResponse(500, { code: 'db_error' }));
        renderPage();

        expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });

    it('shows the server error state when the network itself fails', async () => {
        fetchMock.mockRejectedValue(new Error('offline'));
        renderPage();
        expect(await screen.findByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('reverts to Sign in required if the session is gone at redemption time', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        // Session expired between the status check and the claim click.
        signedOut();
        screen.getByRole('button', { name: /Claim my order/i }).click();

        expect(await screen.findByText(/Sign in to claim/i)).toBeInTheDocument();
    });
});

// ── Security ─────────────────────────────────────────────────────────────────

describe('claim token handling', () => {
    it('never renders the raw token anywhere in the DOM', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        expect(document.body.innerHTML).not.toContain(TOKEN);
        expect(document.body.textContent).not.toContain(TOKEN);
    });

    it('never renders the raw token in ANY state, including error states', async () => {
        // Each entry names the exact heading that state must render, so the
        // assertions cannot pass on an unrelated node.
        const cases: [number, any, RegExp][] = [
            [404, { code: 'invalid_token' }, /Invalid link/i],
            [410, { code: 'expired' }, /This link has expired/i],
            [409, { code: 'already_redeemed' }, /already been claimed/i],
            [403, { code: 'unauthorized' }, /belongs to a different email/i],
            [500, { code: 'db_error' }, /Something went wrong/i],
        ];
        for (const [status, body, heading] of cases) {
            fetchMock.mockResolvedValue(jsonResponse(status, body));
            const view = renderPage();
            await screen.findByText(heading);
            expect(document.body.innerHTML).not.toContain(TOKEN);
            expect(document.body.textContent).not.toContain(TOKEN);
            view.unmount();
        }
    });

    it('never writes the token to localStorage or sessionStorage', async () => {
        const setLocal = vi.spyOn(Storage.prototype, 'setItem');
        const getLocal = vi.spyOn(Storage.prototype, 'getItem');
        const setSession = vi.spyOn(Storage.prototype, 'setItem');

        renderPage();
        await screen.findByText(/Your order is ready to claim/i);
        screen.getByRole('button', { name: /Claim my order/i }).click();
        await screen.findByText(/Your order has been claimed/i);

        for (const call of [...setLocal.mock.calls, ...setSession.mock.calls]) {
            expect(String(call[0])).not.toContain(TOKEN);
            expect(String(call[1])).not.toContain(TOKEN);
        }
        // And it must not have been READ back out of storage either.
        for (const call of getLocal.mock.calls) {
            expect(String(call[0])).not.toContain('token');
        }
    });

    it('never passes the token to console.log/error/warn', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        renderPage();
        await screen.findByText(/Your order is ready to claim/i);
        screen.getByRole('button', { name: /Claim my order/i }).click();
        await screen.findByText(/Your order has been claimed/i);

        for (const spy of [log, error, warn]) {
            for (const call of spy.mock.calls) {
                expect(JSON.stringify(call)).not.toContain(TOKEN);
            }
        }
    });

    it('sends the token in the request BODY, never as a query parameter', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        for (const call of fetchMock.mock.calls) {
            const url = String(call[0]);
            expect(url).not.toContain(TOKEN);
            expect(url).not.toContain(encodeURIComponent(TOKEN));
            expect(url).not.toContain('token=');
        }
        // ...and it IS present in the body.
        expect(requestBodies().some((b) => b?.token === TOKEN)).toBe(true);
    });

    it('authenticates the status request with the session bearer token', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        const [url, init] = fetchMock.mock.calls[0] as [string, any];
        expect(String(url)).toBe('/api/guest-claims/status');
        expect(init.method).toBe('POST');
        expect((init.headers as any).authorization).toBe('Bearer access-token-abc');
    });

    it('never creates or signs up a user — it only reads the existing session', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        // The only auth interaction permitted is reading the current session and
        // subscribing to changes. No signUp / signIn / admin user creation.
        expect(getSession).toHaveBeenCalled();
        const authCalls = [
            ...getSession.mock.calls,
            ...onAuthStateChange.mock.calls,
        ];
        for (const call of authCalls) {
            expect(JSON.stringify(call)).not.toMatch(/signUp|signIn|createUser|impersonat/i);
        }
        // And there is no sign-up affordance offered from this page.
        expect(screen.queryByText(/create an account/i)).toBeNull();
        expect(screen.queryByText(/sign up/i)).toBeNull();
    });

    it('offers no way to claim while signed out', async () => {
        signedOut();
        renderPage();
        await screen.findByText(/Sign in to claim/i);

        expect(screen.queryByRole('button', { name: /Claim my order/i })).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

// ── Request flow ─────────────────────────────────────────────────────────────

describe('claim request flow', () => {
    it('checks status on load, then redeems on click', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0][0])).toBe('/api/guest-claims/status');

        screen.getByRole('button', { name: /Claim my order/i }).click();
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expect(String(fetchMock.mock.calls[1][0])).toBe('/api/guest-claims/redeem');
    });

    it('surfaces a redemption race as already-claimed rather than success', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        // Someone else claimed the token between the status check and the click.
        fetchMock.mockResolvedValue(jsonResponse(409, { code: 'already_redeemed' }));
        screen.getByRole('button', { name: /Claim my order/i }).click();

        expect(await screen.findByText(/already been claimed/i)).toBeInTheDocument();
    });

    it('surfaces a redemption ownership failure as a wrong-account error', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        fetchMock.mockResolvedValue(jsonResponse(403, { code: 'unauthorized' }));
        screen.getByRole('button', { name: /Claim my order/i }).click();

        expect(await screen.findByText(/belongs to a different email/i)).toBeInTheDocument();
    });

    it('ignores a double click so the token is not raced', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true, productId: 'digital' }));
        const btn = screen.getByRole('button', { name: /Claim my order/i });
        btn.click();
        btn.click();
        btn.click();

        await screen.findByText(/Your order has been claimed/i);
        // Exactly one redemption attempt, never two racing CAS updates.
        const redeemCalls = fetchMock.mock.calls.filter(
            (c) => String(c[0]).includes('/redeem')
        );
        expect(redeemCalls).toHaveLength(1);
    });

    it('does not display payment amounts, invoice ids or transaction ids', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        const text = document.body.textContent || '';
        expect(text).not.toMatch(/499|EGP|invoice|txn|transaction/i);
    });

    it('navigates to the dashboard after a successful claim', async () => {
        renderPage();
        await screen.findByText(/Your order is ready to claim/i);

        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true, productId: 'digital' }));
        screen.getByRole('button', { name: /Claim my order/i }).click();
        await screen.findByText(/Your order has been claimed/i);

        screen.getByRole('button', { name: /Go to dashboard/i }).click();
        expect(navigateTo).toHaveBeenCalledWith(Page.DASHBOARD);
    });
});
