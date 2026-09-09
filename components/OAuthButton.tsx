'use client';

import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../shared/lib/supabase';
import { usePreferences } from '../context/PreferencesContext';
import type { Provider } from '@supabase/supabase-js';

/**
 * Shared OAuth sign-in button. All providers (Google / Facebook / X) use the
 * same PKCE flow via the project's Supabase browser client, redirecting to the
 * existing /auth/callback page. Loading state + safe error toast live here once.
 *
 * Note: Supabase's provider slug for X (formerly Twitter) is `'twitter'`.
 */
interface OAuthButtonProps {
    provider: Provider;
    /** Display name used in the error message (e.g. "Google"). */
    name: string;
    icon: ReactNode;
    labelAr: string;
    labelEn: string;
    className?: string;
    /** Optional OAuth scopes. NOTE: Supabase MERGES these with the provider's
     *  server-configured default scopes; it cannot remove a server-set scope. */
    scopes?: string;
}

const BASE = 'w-full h-10 flex items-center justify-center gap-3 font-bold text-xs rounded-xl transition-all active:scale-[0.99] shadow-sm disabled:opacity-60 border';

export default function OAuthButton({ provider, name, icon, labelAr, labelEn, className, scopes }: OAuthButtonProps) {
    const { isRTL } = usePreferences();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    ...(scopes ? { scopes } : {}),
                },
            });
            if (error) throw error;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`${provider} sign-in error:`, msg);
            toast.error(
                isRTL
                    ? `تعذّر بدء تسجيل الدخول عبر ${name}. تأكد من تفعيل مزوّد ${name}.`
                    : `Could not start ${name} sign-in. Ensure the ${name} provider is enabled.`,
            );
            setLoading(false);
        }
    };

    return (
        <button type="button" onClick={handleClick} disabled={loading} className={className ?? BASE}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            <span>{isRTL ? labelAr : labelEn}</span>
        </button>
    );
}
