'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '../../context/PreferencesContext';
import { Language } from '@/shared/types/types';

export default function LangRootPage() {
    const router = useRouter();
    const { setLanguage, language } = usePreferences();

    useEffect(() => {
        setLanguage(Language.EN);
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath === '/en' || currentPath === '/en/') {
                window.location.replace('/');
            } else {
                router.replace('/');
            }
        }
    }, [router, setLanguage, language]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 text-sm font-bold">Loading...</p>
            </div>
        </div>
    );
}
