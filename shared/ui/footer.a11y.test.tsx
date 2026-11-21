import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Footer from './Footer';
import { Language, Page, type ContentStrings } from '@/shared/types/types';

vi.mock('@/context/PreferencesContext', () => ({
    usePreferences: () => ({
        language: Language.EN,
        isRTL: false,
        unitSystem: 'metric',
    }),
}));

// The live keyword panel is an independent, data-driven SEO surface. It is not
// part of the heading contract under test.
vi.mock('@/components/seo/LiveKeywordSection', () => ({
    LiveKeywordSection: () => null,
}));

const content = {
    generalLinks: 'General Menu',
    commercialLinks: 'Commercial',
    internationalLegalLinks: 'International Legal',
    supportLinks: 'Support & Help',
    complianceLinks: 'Global Compliance',
    medicalDisclaimerPage: { title: 'Medical Disclaimer' },
} as unknown as ContentStrings;

afterEach(() => cleanup());

// Framer Motion's whileInView needs this browser API; jsdom does not ship it.
beforeEach(() => {
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
            takeRecords() {
                return [];
            }
        },
    );
});

describe('Footer heading hierarchy', () => {
    it('starts at h2 and never skips a level below the tool h1', () => {
        render(<Footer content={content} navigateTo={vi.fn()} openLegal={vi.fn()} pool={[]} />);

        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
        expect(headings[0].tagName).toBe('H2');

        // The tool h1 is followed directly by the footer; h3 column titles are
        // valid after an h2, but h4 without an h3 is not.
        expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: 'General Menu' })).toBeInTheDocument();
    });
});
