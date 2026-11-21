import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalHeader from './GlobalHeader';
import { Language, Page, type ContentStrings } from '@/shared/types/types';

// The header is a shared chrome component. These tests pin the WCAG behaviours
// the owner approved: label-in-name for the language and unit controls, one
// focusable logo target, a 44px logo hit area, and readable secondary-nav text.

let mockPreferences: {
    language: Language;
    unitSystem: 'metric' | 'imperial';
    isRTL: boolean;
    setLanguage: ReturnType<typeof vi.fn>;
    setUnitSystem: ReturnType<typeof vi.fn>;
};

vi.mock('@/context/PreferencesContext', () => ({
    usePreferences: () => mockPreferences,
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ user: null, profileData: null }),
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/context/RuntimeTranslationContext', () => ({
    useRuntimeTranslation: () => ({
        status: 'inactive',
        targets: [],
        error: null,
        target: null,
        setTarget: vi.fn(),
        identity: null,
        isActive: false,
        refresh: vi.fn(),
    }),
}));

function preferences(language: Language, unitSystem: 'metric' | 'imperial' = 'metric') {
    mockPreferences = {
        language,
        unitSystem,
        isRTL: language === Language.AR,
        setLanguage: vi.fn(),
        setUnitSystem: vi.fn(),
    };
    return mockPreferences;
}

function renderHeader() {
    return render(
        <GlobalHeader
            content={{} as ContentStrings}
            currentPage={Page.HOME}
            navigateTo={vi.fn()}
        />,
    );
}

afterEach(() => cleanup());

beforeEach(() => {
    preferences(Language.EN);
});

describe('GlobalHeader accessibility · language control', () => {
    it('keeps the visible English-mode label inside the Arabic-toggle accessible name', () => {
        renderHeader();
        // Visible label is "عربي"; an aria-label of "Switch Language" alone
        // would break WCAG 2.5.3 label-in-name.
        const toggle = screen.getByRole('button', { name: /عربي/ });
        expect(toggle).toHaveAccessibleName(/عربي/);
    });

    it('keeps the visible Arabic-mode label inside the English-toggle accessible name', () => {
        preferences(Language.AR);
        renderHeader();
        expect(screen.getByRole('button', { name: /EN/ })).toBeInTheDocument();
    });

    it('activates on Enter and Space and asks the preference layer for the other language', async () => {
        const prefs = preferences(Language.EN);
        const user = userEvent.setup();
        renderHeader();

        const toggle = screen.getByRole('button', { name: /عربي/ });
        toggle.focus();
        await user.keyboard('{Enter}');
        expect(prefs.setLanguage).toHaveBeenNthCalledWith(1, Language.AR);

        await user.keyboard(' ');
        expect(prefs.setLanguage).toHaveBeenNthCalledWith(2, Language.AR);
    });

    it('gives the mobile language control an accessible name containing its visible label', () => {
        renderHeader();
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        const mobileToggle = screen.getByRole('button', { name: /العربية/ });
        expect(mobileToggle).toHaveAttribute('aria-label', expect.stringContaining('العربية'));
    });
});

describe('GlobalHeader accessibility · measurement control', () => {
    it('exposes the current unit inside the desktop switch name and toggles it', () => {
        const prefs = preferences(Language.EN, 'metric');
        renderHeader();

        const unit = screen.getByRole('button', { name: /Switch measurement system.*MET/i });
        fireEvent.click(unit);
        expect(prefs.setUnitSystem).toHaveBeenCalledWith('imperial');
    });

    it('exposes the visible unit inside the mobile switch name', () => {
        renderHeader();
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        expect(screen.getByRole('button', { name: /Switch measurement system.*Metric/i })).toBeInTheDocument();
    });
});

describe('GlobalHeader accessibility · brand target', () => {
    it('renders a single interactive logo target with a 44px hit area', () => {
        renderHeader();
        const brand = within(screen.getByRole('banner')).getAllByRole('button', { name: 'Home' })[0];

        // The nested role="button" span used to obscure its own parent and
        // created a second, actionless tab stop.
        expect(within(brand).queryByRole('button')).toBeNull();
        expect(brand).toHaveClass('min-h-11');
        expect(brand).toHaveClass('min-w-11');
    });
});

describe('GlobalHeader accessibility · secondary navigation contrast', () => {
    it('uses a dark-theme text token that clears 4.5:1 on the navy header', () => {
        renderHeader();
        const macros = screen.getByRole('button', { name: /Macros/ });
        expect(macros).toHaveClass('dark:text-zinc-400');
    });
});
