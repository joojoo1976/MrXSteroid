/**
 * components/seo/LiveKeywordSection.dom.test.tsx
 * T9 / prompt §62 test 4 — "UI displays fallback after API failure => the state
 * is reported as a diagnostic fallback, never as Dynamic Intelligence".
 *
 * The production risk this pins down: a section that renders curated words can
 * look identical whether the live feed worked or not. The component therefore
 * exposes `data-feed-state`, and this suite asserts the rendered copy changes
 * with it, so "the user sees keywords" can never be read as "the system works".
 */
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LiveKeywordSection } from './LiveKeywordSection';

vi.mock('../../context/PreferencesContext', () => ({
    usePreferences: () => ({ language: 'en', isRTL: false }),
}));

const FALLBACK_POOL = ['curated one', 'curated two'];

function stubFetch(impl: () => Promise<unknown>) {
    // @ts-expect-error test double
    globalThis.fetch = vi.fn(impl);
}

const dynamicPayload = {
    keywords: [
        {
            id: 'k1',
            keyword: 'ffmi calculator',
            language: 'en',
            cluster: 'smart-tools',
            intent: 'informational',
            destinationPath: '/genetic',
            destinationType: 'tool',
            score: 90,
            trendStatus: 'rising',
        },
    ],
    sourceTier: 'database',
    dataKind: 'observed',
};

describe('T9 · the feed state is visible and honest', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Without an explicit unmount each render() would leave a second copy
        // of the section mounted and getByTestId would match both.
        cleanup();
    });

    it('labels a live, database-backed feed as the dynamic index', async () => {
        stubFetch(async () => ({ ok: true, json: async () => dynamicPayload }));
        render(<LiveKeywordSection fallbackPool={FALLBACK_POOL} />);

        await waitFor(() => {
            expect(screen.getByTestId('keyword-feed-state').dataset.feedState).toBe('dynamic');
        });
        // The live heading is used, and no fallback wording appears.
        expect(screen.getByText(/Live Search Intelligence/i)).toBeTruthy();
        expect(screen.queryByText(/fallback/i)).toBeNull();
    });

    it('labels a baseline-tier payload as a fallback even though HTTP succeeded', async () => {
        // The exact false-pass case: 200 OK, keywords present, but the server
        // declared sourceTier='baseline'. This must NOT read as dynamic.
        stubFetch(async () => ({
            ok: true,
            json: async () => ({ ...dynamicPayload, sourceTier: 'baseline', dataKind: 'curated' }),
        }));
        render(<LiveKeywordSection fallbackPool={FALLBACK_POOL} />);

        await waitFor(() => {
            expect(screen.getByTestId('keyword-feed-state').dataset.feedState).toBe('fallback');
        });
        expect(screen.getByText(/Keyword Directory \(Fallback\)/i)).toBeTruthy();
        expect(screen.getByText(/Curated fallback/i)).toBeTruthy();
        expect(screen.queryByText(/Live Search Intelligence/i)).toBeNull();
    });

    it('falls back and says so when the API request fails outright', async () => {
        stubFetch(async () => {
            throw new Error('network down');
        });
        render(<LiveKeywordSection fallbackPool={FALLBACK_POOL} />);

        await waitFor(() => {
            expect(screen.getByTestId('keyword-feed-state').dataset.feedState).toBe('fallback');
        });
        // Emergency UX fallback words may render, but the heading must not claim
        // live intelligence.
        expect(screen.queryByText(/Live Search Intelligence/i)).toBeNull();
    });

    it('falls back when the API returns a non-2xx status', async () => {
        stubFetch(async () => ({ ok: false, status: 500, json: async () => ({}) }));
        render(<LiveKeywordSection fallbackPool={FALLBACK_POOL} />);

        await waitFor(() => {
            expect(screen.getByTestId('keyword-feed-state').dataset.feedState).toBe('fallback');
        });
    });
});