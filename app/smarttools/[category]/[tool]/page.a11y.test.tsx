import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

vi.mock('next/navigation', () => ({
    notFound: () => {
        throw new Error('notFound');
    },
}));

vi.mock('next/link', async () => {
    const ReactModule = await import('react');
    return {
        default: ({ href, children, ...props }: { href: unknown; children?: React.ReactNode }) =>
            ReactModule.createElement(
                'a',
                { href: typeof href === 'string' ? href : String(href), ...props },
                children,
            ),
    };
});

vi.mock('@/lib/tools/smartToolsCatalog4', () => ({
    getPublishedCatalogTools: () => [
        {
            slug: 'bmi',
            titleEn: 'Body Mass Index (BMI)',
            descriptionEn: 'Calculate BMI from weight and height',
            accessTier: 'free',
        },
    ],
}));

vi.mock('@/lib/tools/categories', () => ({
    getCategory: (slug: string) =>
        slug === 'body-composition' ? { slug: 'body-composition', nameEn: 'Body Composition' } : null,
    getCategoryOfSlug: () => 'body-composition',
}));

vi.mock('@/lib/tools/loaders', () => ({
    getToolComponent: async () => () => React.createElement('div', null, 'tool'),
}));

vi.mock('@/components/tools/SafetyNotice', () => ({
    SafetyNotice: () => React.createElement('div', { 'data-testid': 'safety-notice' }),
}));

import ToolPage from './page';

afterEach(() => cleanup());

describe('Shared tool breadcrumb', () => {
    it('is readable on the dark tool surface and marks the current page', async () => {
        const ui = await ToolPage({
            params: Promise.resolve({ category: 'body-composition', tool: 'bmi' }),
        });
        render(ui);

        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
        const home = within(nav).getByRole('link', { name: 'Home' });

        // Lighthouse measured #71717a on #0e0543 at 3.87:1. The dark token must
        // resolve lighter without changing the 12px breadcrumb scale. Links
        // inherit this token from the nav.
        expect(nav).toHaveClass('dark:text-zinc-400');
        expect(home.closest('nav')).toBe(nav);
        expect(within(nav).getByText('Body Mass Index (BMI)')).toHaveAttribute('aria-current', 'page');
    });
});
