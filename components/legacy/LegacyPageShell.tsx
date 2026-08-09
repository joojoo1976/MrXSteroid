/**
 * LegacyPageShell — client wrapper used by every restored App Router page.
 * Supplies the legacy props every page expects (`content`, `navigateTo`) from
 * context + the App Router navigation adapter, plus a shared Header/Footer
 * frame so restored pages keep working navigation and legal links.
 */
'use client';

import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useLegacyNavigation } from '../../lib/use-legacy-navigation';
import { Page, ContentStrings } from '@/shared/types/types';
import LegacyHeader from './LegacyHeader';
import LegacyFooter from './LegacyFooter';

interface LegacyPageShellProps {
    children: (ctx: { content: ContentStrings; navigateTo: (page: Page) => void }) => React.ReactNode;
}

export default function LegacyPageShell({ children }: LegacyPageShellProps) {
    const { content, isRTL } = usePreferences();
    const navigateTo = useLegacyNavigation();

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100">
            <LegacyHeader navigateTo={navigateTo} />
            <main className="flex-1 pt-24 pb-20 container mx-auto px-4 animate-fade-in">
                {children({ content, navigateTo })}
            </main>
            <LegacyFooter navigateTo={navigateTo} />
        </div>
    );
}
