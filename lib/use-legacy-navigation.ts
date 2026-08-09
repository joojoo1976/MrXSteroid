/**
 * useLegacyNavigation — turns the legacy imperative `navigateTo(page)` API
 * into Next.js App Router navigation. Pages and shared UI call
 * `navigateTo(Page.X)` as before; this hook adapts it to `router.push`.
 */
'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Page } from '@/shared/types/types';
import { pageToPath } from './legacy-routes';

export function useLegacyNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const navigateTo = useCallback(
        (page: Page, options?: { replace?: boolean; scroll?: boolean }) => {
            const path = pageToPath(page);
            if (path === pathname) {
                // Already there — just scroll to top for the expected UX.
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            if (options?.replace) {
                router.replace(path);
            } else {
                router.push(path);
            }
        },
        [router, pathname],
    );

    return navigateTo;
}
