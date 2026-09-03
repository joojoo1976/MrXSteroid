/**
 * LegacyHeader — thin wrapper around GlobalHeader for legacy pages.
 * Routes navigation through the shared adapter; styling, scroll behavior,
 * and RTL support all live in the GlobalHeader component.
 */
'use client';

import React from 'react';
import { Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from '../../shared/ui/GlobalHeader';

interface LegacyHeaderProps {
    navigateTo: (page: Page) => void;
    currentPage?: Page;
}

export default function LegacyHeader({ navigateTo, currentPage = Page.HOME }: LegacyHeaderProps) {
    const { content } = usePreferences();
    const { user, signOut } = useAuth();

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
