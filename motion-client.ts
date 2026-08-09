/**
 * motion-client.ts
 * Isolated Framer Motion boundary. All animation-driven components import from
 * here instead of importing framer-motion directly, keeping server components
 * fully static (no hydration mismatch from motion values rendered server-side).
 */
'use client';

import { LazyMotion, domAnimation, motion, AnimatePresence, type Variants } from 'framer-motion';

export { LazyMotion, domAnimation, motion, AnimatePresence };
export type { Variants };

/**
 * useIsomorphicLayoutEffect — runs useLayoutEffect on the client and
 * useEffect on the server, so animated layout reads never fire during SSR
 * (the classic framer-motion hydration-mismatch trigger).
 */
export function useIsomorphicLayoutEffect(
    effect: () => void | (() => void),
    deps: readonly unknown[] = [],
) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { useLayoutEffect } = require('react') as typeof import('react');
        return useLayoutEffect(effect, deps as React.DependencyList);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useEffect } = require('react') as typeof import('react');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useEffect(effect, deps as React.DependencyList);
}

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

export default motion;
