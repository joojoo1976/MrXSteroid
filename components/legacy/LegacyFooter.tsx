/**
 * LegacyFooter — minimal footer for restored legacy pages with legal links.
 */
'use client';

import React from 'react';
import { Page } from '@/shared/types/types';

const LEGAL_LINKS: { label: string; page: Page }[] = [
    { label: 'Privacy', page: Page.PRIVACY },
    { label: 'Terms', page: Page.TERMS },
    { label: 'Refund', page: Page.REFUND },
    { label: 'Disclaimer', page: Page.LEGAL_DISCLAIMER_PAGE },
    { label: 'About', page: Page.ABOUT },
    { label: 'Contact', page: Page.CONTACT },
    { label: 'Support', page: Page.SUPPORT },
    { label: 'Careers', page: Page.CAREERS },
];

interface LegacyFooterProps {
    navigateTo: (page: Page) => void;
}

export default function LegacyFooter({ navigateTo }: LegacyFooterProps) {
    return (
        <footer className="border-t border-white/10 bg-black/40">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <button
                        type="button"
                        onClick={() => navigateTo(Page.HOME)}
                        className="flex items-center gap-2 text-lg font-black tracking-tight"
                    >
                        <span className="neon-text">MR</span>
                        <span className="text-white">.X</span>
                    </button>

                    <nav aria-label="Legal" className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {LEGAL_LINKS.map((l) => (
                            <button
                                key={l.page}
                                type="button"
                                onClick={() => navigateTo(l.page)}
                                className="text-left text-xs font-semibold text-zinc-400 transition-colors hover:text-[rgb(var(--neon-primary))]"
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="text-gold-400 font-bold">⚡ Payment Options:</span>
                        <span className="text-zinc-400">InstaPay · Vodafone Cash · Visa · Mastercard · Meeza · Stripe · PayPal · Aman</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                        <span>🔒 256-BIT SSL</span>
                        <span>🛡️ PCI-DSS COMPLIANT</span>
                    </div>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
                    © {new Date().getFullYear()} Mr. X Steroid — The Protocol. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
