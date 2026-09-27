/**
 * RootProviders — client boundary that mounts the legacy app-wide providers
 * (Auth, Region, Preferences/Theme) plus the global Toaster. The legacy
 * components consume these via context, so they must live above the page tree.
 */
'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthContext';
import { RegionProvider } from '../context/RegionContext';
import { PreferencesProvider } from '../context/PreferencesProvider';
import { RuntimeTranslationProvider } from '../context/RuntimeTranslationProvider';
import PaymobModalHost from '../components/legacy/PaymobModalHost';

interface RootProvidersProps {
    children: React.ReactNode;
    /** Server-resolved initial language (cookie/header-aware) to avoid flash. */
    initialLanguage?: 'ar' | 'en';
    /** Server-resolved initial unit system to avoid flash. */
    initialUnitSystem?: 'metric' | 'imperial';
}

export default function RootProviders({ children, initialLanguage, initialUnitSystem }: RootProvidersProps) {
    return (
        <AuthProvider>
            <RegionProvider>
                <PreferencesProvider initialLanguage={initialLanguage} initialUnitSystem={initialUnitSystem}>
                    {/* L2 inline runtime translation. Mounted inside PreferencesProvider because it
                        reads the L1 language to stay disabled whenever the page is in Arabic. */}
                    <RuntimeTranslationProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                        <PaymobModalHost />
                    </RuntimeTranslationProvider>
                </PreferencesProvider>
            </RegionProvider>
        </AuthProvider>
    );
}
