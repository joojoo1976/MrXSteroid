'use client';

/**
 * SmartToolsHeader — renders the exact same GlobalHeader for all SmartTools routes.
 * Integrates usePreferences, useAuth, and App Router navigation.
 */
import React from 'react';
import { usePathname } from 'next/navigation';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/context/AuthContext';
import { useLegacyNavigation } from '@/lib/use-legacy-navigation';
import { pathToPage } from '@/lib/legacy-routes';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import { Page } from '@/shared/types/types';

export default function SmartToolsHeader() {
    const pathname = usePathname();
    const { content } = usePreferences();
    const { user, signOut } = useAuth();
    const navigateTo = useLegacyNavigation();
    const currentPage = pathToPage(pathname) || Page.MASTER_CALCULATOR;

    return (
        <GlobalHeader
            content={content}
            currentPage={currentPage}
            navigateTo={navigateTo}
            user={user}
            onLogout={signOut}
        />
    );
}
