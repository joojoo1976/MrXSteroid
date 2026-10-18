'use client';

/**
 * GlobalFooterWrapper — renders the canonical shared/ui/Footer for all routes
 * that don't already use LegacyPageShell.
 *
 * • content   — from usePreferences()
 * • navigateTo — from useLegacyNavigation() (App Router adapter)
 * • openLegal  — declared in FooterProps but NOT used in the Footer body;
 *                passed as noop to satisfy the interface.
 * • pool       — passed as [] (LiveKeywordSection handles an empty fallback pool).
 */
import React from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { useLegacyNavigation } from '@/lib/use-legacy-navigation';
import Footer from '@/shared/ui/Footer';

export default function GlobalFooterWrapper() {
    const { content } = usePreferences();
    const navigateTo = useLegacyNavigation();

    return (
        <Footer
            content={content}
            navigateTo={navigateTo}
            openLegal={() => {}}
            pool={[]}
        />
    );
}
