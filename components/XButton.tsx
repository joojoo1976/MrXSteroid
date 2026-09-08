'use client';

import OAuthButton from './OAuthButton';

const XIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function XButton() {
    return (
        <OAuthButton
            provider="twitter"
            name="X"
            icon={<XIcon />}
            labelAr="المتابعة باستخدام X"
            labelEn="Continue with X"
            className="w-full h-10 flex items-center justify-center gap-3 bg-black text-white font-bold text-xs rounded-xl border border-zinc-700 hover:bg-zinc-900 active:scale-[0.99] transition-all shadow-sm disabled:opacity-60"
        />
    );
}
