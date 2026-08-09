/**
 * StickyCTA.tsx — Client Component.
 * Conversion nudge that appears once the user has scrolled past 40% of the page.
 * Uses a passive scroll listener (no re-render storms) and respects reduced motion.
 */
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from '../../motion-client';

export default function StickyCTA() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
            setVisible(pct > 40);
        };
        // Read once on mount so a deep-linked visit shows the bar immediately.
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 90, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 90, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="fixed inset-x-0 bottom-4 z-50 px-4"
                >
                    <div className="glass-strong neon-border mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:px-6">
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-black text-white">
                                Your numbers are in. <span className="neon-text">Lock the protocol.</span>
                            </p>
                            <p className="text-xs text-zinc-400">One-time price · lifetime access · 48h refund.</p>
                        </div>
                        <a
                            href="#pricing"
                            className="inline-flex flex-shrink-0 items-center rounded-xl bg-[rgb(var(--neon-primary))] px-6 py-3 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.03]"
                        >
                            Claim The Protocol
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
