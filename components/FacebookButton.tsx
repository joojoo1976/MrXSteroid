'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../shared/lib/supabase';
import { usePreferences } from '../context/PreferencesContext';

const FacebookIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
            fill="currentColor"
            d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
        />
    </svg>
);

/**
 * Facebook OAuth sign-in button. Mirrors GoogleButton: uses the shared Supabase
 * browser client (PKCE) to signInWithOAuth({provider:'facebook'}) with
 * redirectTo /auth/callback. The existing callback page exchanges the code for
 * a session, and the on_auth_user_created trigger provisions the profile row.
 */
export default function FacebookButton() {
    const { isRTL } = usePreferences();
    const [loading, setLoading] = useState(false);

    const handleFacebookLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('Facebook sign-in error:', msg);
            toast.error(
                isRTL
                    ? 'تعذّر بدء تسجيل الدخول عبر Facebook. تأكد من تفعيل مزوّد Facebook.'
                    : 'Could not start Facebook sign-in. Ensure the Facebook provider is enabled.',
            );
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold text-xs rounded-xl border border-transparent hover:bg-[#0f63d6] active:scale-[0.99] transition-all shadow-sm disabled:opacity-60"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FacebookIcon />}
            <span>{isRTL ? 'المتابعة باستخدام Facebook' : 'Continue with Facebook'}</span>
        </button>
    );
}
