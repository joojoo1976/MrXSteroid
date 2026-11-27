'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { buildCheckoutPlansHref } from '../../shared/lib/checkoutPlan';

interface PlansLinkProps {
    className?: string;
    label?: string;
}

/** One localized, accessible route from marketing content to checkout plans. */
export default function PlansLink({ className, label }: PlansLinkProps) {
    const { isRTL, language } = usePreferences();

    return (
        <Link
            href={buildCheckoutPlansHref(language === 'ar' ? 'ar' : 'en')}
            className={className ?? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-8 py-3 text-sm font-black text-black shadow-lg shadow-gold-500/20 transition hover:from-gold-400 hover:to-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background'}
        >
            {label ?? (isRTL ? 'اختر خطتك' : 'Choose your plan')}
            <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
        </Link>
    );
}
