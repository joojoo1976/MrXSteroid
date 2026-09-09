'use client';

import type { Provider } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import OAuthButton from './OAuthButton';

/**
 * AuthButtons — the single source of truth for social login on /login & /signup.
 * Composes the shared OAuthButton primitive (PKCE via the project's Supabase
 * browser client, redirect to /auth/callback) for Google, Facebook and X.
 *
 * Ultra-modern dark treatment with neon-green (#39FF14) accents, brand-colored
 * SVG logos, hover lift + glow, focus ring, and a per-button loading spinner.
 * Fully RTL-aware (labels localized via usePreferences inside OAuthButton).
 */

const GoogleLogo = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
);
const FacebookLogo = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
);
const XLogo = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const NEON_BTN =
    'relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#39FF14]/40 bg-zinc-950/70 text-sm font-semibold text-[#39FF14] shadow-[0_0_14px_rgba(57,255,20,0.12)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#39FF14] hover:text-white hover:shadow-[0_0_22px_rgba(57,255,20,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/60 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0';

interface Social { provider: Provider; name: string; labelAr: string; labelEn: string; icon: ReactNode; scopes?: string; }

// NOTE: Supabase merges these with each provider's SERVER-configured default
// scopes. Facebook's server default requests `email`, which Meta rejects with
// "Invalid Scopes: email" until `email` is enabled in the Meta console OR the
// Supabase Facebook provider's Scopes field is set to `public_profile`.
const PROVIDERS: Social[] = [
    { provider: 'google',   name: 'Google',   labelAr: 'المتابعة باستخدام Google',   labelEn: 'Continue with Google',   icon: <GoogleLogo /> },
    { provider: 'facebook', name: 'Facebook', labelAr: 'المتابعة باستخدام Facebook', labelEn: 'Continue with Facebook', icon: <FacebookLogo />, scopes: 'public_profile' },
    { provider: 'twitter',  name: 'X',        labelAr: 'المتابعة باستخدام X',        labelEn: 'Continue with X',        icon: <XLogo /> },
];

// Feature flag: X / Twitter OAuth 2.0 is currently NOT emitted by this Supabase
// project's GoTrue (authorize returns root instead of x.com). The button is
// hidden to avoid a broken redirect; the wiring is kept intact. Flip to true to
// re-enable once Supabase fixes X OAuth 2.0 for this project.
const ENABLE_X = false;

const VISIBLE_PROVIDERS = PROVIDERS.filter((s) => ENABLE_X || s.provider !== 'twitter');

export default function AuthButtons() {
    return (
        <div className="flex w-full flex-col gap-3">
            {VISIBLE_PROVIDERS.map((s) => (
                <OAuthButton
                    key={s.provider}
                    provider={s.provider}
                    name={s.name}
                    icon={s.icon}
                    labelAr={s.labelAr}
                    labelEn={s.labelEn}
                    scopes={s.scopes}
                    className={NEON_BTN}
                />
            ))}
        </div>
    );
}
