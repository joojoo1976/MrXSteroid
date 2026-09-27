import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RuntimeLanguageSelector } from './RuntimeLanguageSelector';
import type { RuntimeTranslationState } from '@/context/RuntimeTranslationContext';

const noop = () => {};

function state(overrides: Partial<RuntimeTranslationState>): RuntimeTranslationState {
    return {
        status: 'ready',
        targets: [],
        error: null,
        target: null,
        setTarget: noop,
        identity: null,
        isActive: false,
        refresh: noop,
        ...overrides,
    };
}

let mockState: RuntimeTranslationState;

vi.mock('@/context/RuntimeTranslationContext', () => ({
    useRuntimeTranslation: () => mockState,
}));

const TARGETS = [
    { code: 'fr', displayName: 'French', nativeName: 'Français', rtl: false },
    { code: 'de', displayName: 'German', nativeName: 'Deutsch', rtl: false },
];

beforeEach(() => {
    mockState = state({ status: 'ready', targets: TARGETS });
});

// RTL auto-cleanup only registers with vitest `globals: true`; this project does
// not enable it, so cleanup is explicit. Without it renders accumulate in
// document.body and queries match stale nodes.
afterEach(() => {
    cleanup();
});

describe('T3 · selector · verified-only list', () => {
    it('offers exactly the verified targets plus the original', () => {
        render(<RuntimeLanguageSelector />);
        expect(screen.getByRole('button', { name: /off/i })).toBeInTheDocument();
        // The dropdown is closed until requested.
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders the active target code', () => {
        mockState = state({ status: 'ready', targets: TARGETS, target: 'de' });
        render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-value').textContent).toBe('DE');
    });

    it('shows OFF when no runtime target is selected', () => {
        render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-value').textContent).toBe('OFF');
    });
});

describe('T3 · selector · a failure is never an empty selector', () => {
    it.each([
        ['PROVIDER_NOT_CONFIGURED', 503],
        ['PROVIDER_CAPABILITY_UNAVAILABLE', 503],
    ])('renders the %s reason rather than a language list', (code, status) => {
        mockState = state({
            status: 'unavailable',
            targets: [],
            error: { code, message: 'nope', retryable: true, status },
        });
        render(<RuntimeLanguageSelector />);

        const banner = screen.getByTestId('runtime-selector-unavailable');
        expect(banner).toBeInTheDocument();
        expect(banner).toHaveAttribute('data-error-code', code);
        // No dropdown, so this cannot be mistaken for "no languages".
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /off/i })).not.toBeInTheDocument();
    });

    it('keeps the two 503 codes visually distinct', () => {
        mockState = state({
            status: 'unavailable',
            error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'a', retryable: false, status: 503 },
        });
        const { unmount } = render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-unavailable')).toHaveAttribute(
            'data-error-code',
            'PROVIDER_NOT_CONFIGURED'
        );
        unmount();

        mockState = state({
            status: 'unavailable',
            error: { code: 'PROVIDER_CAPABILITY_UNAVAILABLE', message: 'b', retryable: true, status: 503 },
        });
        render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-unavailable')).toHaveAttribute(
            'data-error-code',
            'PROVIDER_CAPABILITY_UNAVAILABLE'
        );
    });

    it('reports a rate limit as paused', () => {
        mockState = state({
            status: 'limited',
            error: { code: 'RATE_LIMITED', message: 'slow down', retryable: true, status: 429 },
        });
        render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-unavailable')).toHaveAttribute('data-error-code', 'RATE_LIMITED');
    });

    it('surfaces a message for an unrecognised code', () => {
        mockState = state({
            status: 'error',
            error: { code: 'SOMETHING_NEW', message: 'unexpected thing', retryable: false, status: 500 },
        });
        render(<RuntimeLanguageSelector />);
        const banner = screen.getByTestId('runtime-selector-unavailable');
        expect(banner).toHaveAttribute('data-error-code', 'SOMETHING_NEW');
        expect(banner.getAttribute('title')).toContain('unexpected thing');
    });

    it('treats a ready-but-empty list as a fault, not as a selector', () => {
        mockState = state({ status: 'ready', targets: [] });
        render(<RuntimeLanguageSelector />);
        // The route refuses to answer 200 with an empty list, so this state is
        // unreachable in practice and must not render as a working selector.
        expect(screen.getByTestId('runtime-selector-unavailable')).toHaveAttribute(
            'data-error-code',
            'NO_VERIFIED_TARGETS'
        );
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
});

describe('T3 · selector · lifecycle states', () => {
    it('shows a checking state during capability discovery', () => {
        mockState = state({ status: 'loading' });
        render(<RuntimeLanguageSelector />);
        expect(screen.getByTestId('runtime-selector-loading')).toBeInTheDocument();
        expect(screen.queryByTestId('runtime-selector')).not.toBeInTheDocument();
    });

    it('explains itself when the page is Arabic', () => {
        mockState = state({ status: 'inactive' });
        render(<RuntimeLanguageSelector />);
        const node = screen.getByTestId('runtime-selector-inactive');
        expect(node).toBeInTheDocument();
        // Arabic is human-authored; L2 must not offer to machine-translate it.
        expect(node.getAttribute('title')).toMatch(/Arabic/i);
    });
});
