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

export default function RootProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <RegionProvider>
                <PreferencesProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                    <PaymobModalHost />
                </PreferencesProvider>
            </RegionProvider>
        </AuthProvider>
    );
}
