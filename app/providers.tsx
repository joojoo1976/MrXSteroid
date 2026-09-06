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
                    {children}
                    <Toaster position="top-right" richColors />
                    <PaymobModalHost />
                </PreferencesProvider>
            </RegionProvider>
        </AuthProvider>
    );
}
