'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🎁 MR. X STEROID — GUEST ORDER CLAIM PAGE                                ║
 * ║  Converts an already-PAID guest order into a real authenticated account   ║
 * ║  استرجاع طلب مدفوع بحسابك                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 *  WHY THIS PAGE EXISTS
 *  Guest checkout is intentionally enabled, so a captured guest payment settles
 *  the §6.3 journal and then issues a single-use claim token. The emailed claim
 *  URL is `/claim-order?token=...`; without this page the link was a dead end and
 *  a paying guest received nothing.
 *
 *  SECURITY POSTURE (deliberate, not incidental)
 *  · The raw token is a ONE-TIME BEARER CREDENTIAL. It is held in React state
 *    only for the lifetime of this component. It is never written to
 *    localStorage, sessionStorage, cookies, IndexedDB or any analytics call, and
 *    it is NEVER rendered into the DOM or included in any error message.
 *  · The token is sent in the JSON BODY of both API calls, never as a query
 *    parameter, so it does not leak into request lines, access logs or
 *    `Referer` headers.
 *  · This page performs no authorization of its own. It is a renderer: it asks
 *    the server what state the claim is in, and the SERVER decides. The only
 *    mutation is the server-side compare-and-swap in `redeemGuestOrderClaim`,
 *    which re-verifies ownership, single-use and expiry itself.
 *  · This page NEVER creates a user and NEVER fabricates an identity. There is
 *    deliberately no sign-up form here: an unauthenticated visitor is sent to
 *    the ordinary login page and must return to the emailed link afterwards.
 *  · Nothing from the payment (amount, currency, invoice id, transaction id) is
 *    displayed. The page reveals only that a claim exists, which product it is,
 *    and when it lapses.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Gift, Loader2, LogIn, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '../shared/lib/supabase';
import { Button } from '../shared/ui/button';
import BrandLogo from '../shared/ui/BrandLogo';
import { PAYMOB_PRODUCTS } from '../shared/lib/paymobProducts';
import { Page } from '@/shared/types/types';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GuestOrderClaimPageProps {
    /** Raw claim token from `?token=`. Never rendered, never stored. */
    token: string;
    navigateTo: (page: Page) => void;
    locale?: 'ar' | 'en';
}

type ClaimState =
    | 'loading'
    | 'invalid_link'
    | 'sign_in_required'
    | 'ready'
    | 'redeeming'
    | 'success'
    | 'expired'
    | 'already_claimed'
    | 'wrong_account'
    | 'server_error';

/** Server failure codes → page states. */
const CODE_TO_STATE: Record<string, ClaimState> = {
    invalid_token: 'invalid_link',
    expired: 'expired',
    already_redeemed: 'already_claimed',
    unauthorized: 'wrong_account',
    grant_failed: 'server_error',
    db_error: 'server_error',
};

// ═══════════════════════════════════════════════════════════════════════════
//                          CONTENT STRINGS
// ═══════════════════════════════════════════════════════════════════════════

const CONTENT = {
    ar: {
        title: 'استرجاع طلبك',
        loading: 'جارٍ التحقق من رابط الاسترجاع...',
        signInTitle: 'سجّل الدخول للاسترجاع',
        signInDesc: 'هذا الطلب تم الدفعه بحساب غير مسجل. سجّل الدخول بالبريد الإلكتروني الذي استخدمته في الطلب، ثم ارجع إلى هذا الرابط من رسالتك لإكمال الاسترجاع.',
        signInCta: 'تسجيل الدخول',
        signInBack: 'لا ننشئ حساباً جديداً هنا — استخدم صفحة التسجيل إن لم يكن لديك حساب.',
        readyTitle: 'طلبك جاهز للاسترجاع',
        readyDesc: 'سيتم إرفاق المنتج الذي دفعت مقابله بحسابك فوراً. لا يوجد أي مبلغ إضافي.',
        expiry: 'ينتهي الرابط في',
        claimCta: 'استرجاع الطلب',
        redeeming: 'جارٍ الاسترجاع...',
        successTitle: 'تم استرجاع طلبك بنجاح',
        successDesc: 'تم إرفاق المنتج بحسابك وهو متاح لك الآن.',
        successCta: 'الذهاب للوحة التحكم',
        successAgain: 'يمكن استخدام هذا الرابط مرة واحدة فقط.',
        expiredTitle: 'انتهت صلاحية الرابط',
        expiredDesc: 'انتهت صلاحية رابط الاسترجاع. تواصل مع الدعم ومعك الإيصال وسنسترجع طلبك.',
        alreadyTitle: 'تم استرجاع هذا الطلب بالفعل',
        alreadyDesc: 'هذا الرابط تم استخدامه من قبل. إذا لم يظهر المنتج في حسابك، تواصل مع الدعم.',
        wrongTitle: 'الرابط لبريد إلكتروني مختلف',
        wrongDesc: 'هذا الطلب تم إنشاؤه ببريد إلكتروني مختلف عن الذي سجّلت الدخول به. سجّل الدخول بالبريد المستخدم في الطلب.',
        invalidTitle: 'رابط غير صالح',
        invalidDesc: 'هذا الرابط غير صالح أو تم تعديله. تأكد من نسخ الرابط كاملاً من رسالة البريد الإلكتروني.',
        serverTitle: 'حدث خطأ غير متوقع',
        serverDesc: 'تعذر إتمام العملية الآن. يرجى المحاولة بعد قليل. إذا لم يتم الاسترجاع بعد فسيبقى طلبك محفوظاً.',
        serverRetry: 'إعادة المحاولة',
        contactSupport: 'تواصل مع الدعم',
        securityNote: 'رابط آمن يُستخدم مرة واحدة فقط ولا يتم تخزينه على جهازك',
    },
    en: {
        title: 'Claim your order',
        loading: 'Checking your claim link...',
        signInTitle: 'Sign in to claim',
        signInDesc: 'This order was paid for without an account. Sign in with the email address you used at checkout, then return to this link from your email to finish claiming it.',
        signInCta: 'Sign in',
        signInBack: 'We never create an account here — use the sign-up page if you do not have one yet.',
        readyTitle: 'Your order is ready to claim',
        readyDesc: 'The product you paid for will be attached to your account immediately. There is nothing more to pay.',
        expiry: 'Link expires',
        claimCta: 'Claim my order',
        redeeming: 'Claiming your order...',
        successTitle: 'Your order has been claimed',
        successDesc: 'The product is now attached to your account and available to you.',
        successCta: 'Go to dashboard',
        successAgain: 'This link can only be used once.',
        expiredTitle: 'This link has expired',
        expiredDesc: 'The claim link has expired. Contact support with your receipt and we will recover your order for you.',
        alreadyTitle: 'This order has already been claimed',
        alreadyDesc: 'This link has already been used. If the product is not on your account, please contact support.',
        wrongTitle: 'This link belongs to a different email',
        wrongDesc: 'This order was placed with a different email address than the one you signed in with. Please sign in with the email used for the order.',
        invalidTitle: 'Invalid link',
        invalidDesc: 'This link is not valid or has been altered. Please make sure you copied the whole link from your email.',
        serverTitle: 'Something went wrong',
        serverDesc: 'We could not complete this just now. Please try again shortly — if the claim did not go through, your order is still safely recorded.',
        serverRetry: 'Try again',
        contactSupport: 'Contact support',
        securityNote: 'Secure one-time link — never stored on your device',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
//                              HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Human-readable product name for a claim.
 *
 * The claim stores the internal tier id, so this maps it through the existing
 * product catalog. It is presentation only: an unmapped id is rendered as-is
 * rather than guessed at.
 */
function productLabel(productId: string | null, locale: 'ar' | 'en'): string {
    if (!productId) return '';
    const match = PAYMOB_PRODUCTS.find((p) => p.tierId === productId);
    if (!match) return productId;
    return locale === 'ar' ? match.nameAr : match.nameEn;
}

function formatExpiry(iso: string, locale: 'ar' | 'en'): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

// ═══════════════════════════════════════════════════════════════════════════
//                              COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const GuestOrderClaimPage: React.FC<GuestOrderClaimPageProps> = ({ token, navigateTo, locale = 'en' }) => {
    const content = CONTENT[locale];
    const isAr = locale === 'ar';

    const [state, setState] = useState<ClaimState>('loading');
    const [productId, setProductId] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    // The token is mirrored into a ref only so the API callbacks can read it
    // without re-subscribing. It stays in memory for the page's lifetime and is
    // never persisted or rendered.
    const tokenRef = useRef(token);
    tokenRef.current = token;

    /**
     * Ask the server what state the claim is in. Read-only.
     *
     * Returns `null` when the caller is not authenticated, which is the signal
     * to show the sign-in state rather than an error.
     */
    const loadStatus = useCallback(async (): Promise<ClaimState | null> => {
        let accessToken: string | undefined;
        try {
            const { data } = await supabase.auth.getSession();
            accessToken = data.session?.access_token;
        } catch {
            return null;
        }
        if (!accessToken) return null;

        try {
            const res = await fetch('/api/guest-claims/status', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                // Body, never the query string: keeps the token out of access
                // logs and Referer headers.
                body: JSON.stringify({ token: tokenRef.current }),
            });

            if (res.ok) {
                const data = (await res.json()) as {
                    state?: string;
                    productId?: string;
                    expiresAt?: string;
                };
                setProductId(typeof data.productId === 'string' ? data.productId : null);
                setExpiresAt(typeof data.expiresAt === 'string' ? data.expiresAt : null);
                setState('ready');
                return 'ready';
            }

            const data = (await res.json().catch(() => ({}))) as { code?: string };
            if (res.status === 401) return null;
            setState(CODE_TO_STATE[data.code ?? ''] ?? 'server_error');
            return CODE_TO_STATE[data.code ?? ''] ?? 'server_error';
        } catch {
            setState('server_error');
            return 'server_error';
        }
    }, []);

    // ── Initial load: token presence → auth → server-side status ────────────
    useEffect(() => {
        if (!tokenRef.current) {
            setState('invalid_link');
            return;
        }
        let cancelled = false;
        void (async () => {
            const next = await loadStatus();
            if (cancelled) return;
            if (next === null) setState('sign_in_required');
        })();
        return () => {
            cancelled = true;
        };
    }, [loadStatus, token]);

    // ── Re-check when the guest returns from signing in ─────────────────────
    useEffect(() => {
        if (state !== 'sign_in_required') return;
        let cancelled = false;

        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.access_token) {
                void (async () => {
                    const next = await loadStatus();
                    if (!cancelled && next === null) setState('sign_in_required');
                })();
            }
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, [state, loadStatus]);

    /**
     * In-flight latch.
     *
     * A `state === 'redeeming'` guard is NOT sufficient: three clicks landing in
     * the same tick all read the same stale `state` (React batches the update),
     * so all three would fire. A ref is mutated synchronously, so the first
     * click latches and the rest are refused. The server-side compare-and-swap
     * is what actually guarantees single use — this only avoids wasting
     * requests and showing a spurious "already claimed" to a real customer.
     */
    const claiming = useRef(false);

    /**
     * Redeem the claim. The server performs the single-use compare-and-swap; the
     * page only reflects the outcome.
     */
    const handleClaim = useCallback(async () => {
        if (claiming.current) return;
        claiming.current = true;
        setState('redeeming');
        try {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;
            if (!accessToken) {
                setState('sign_in_required');
                return;
            }

            const res = await fetch('/api/guest-claims/redeem', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ token: tokenRef.current }),
            });

            if (res.ok) {
                setState('success');
                return;
            }

            const body = (await res.json().catch(() => ({}))) as { code?: string };
            if (res.status === 401) {
                setState('sign_in_required');
                return;
            }
            setState(CODE_TO_STATE[body.code ?? ''] ?? 'server_error');
        } catch {
            setState('server_error');
        } finally {
            // Released only on a non-terminal outcome, so a failed attempt can
            // be retried while a successful claim stays locked.
            claiming.current = false;
        }
    }, []);

    // ── Render ──────────────────────────────────────────────────────────────
    const renderContent = () => {
        switch (state) {
            case 'loading':
            case 'redeeming':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                        <Loader2 className="w-14 h-14 mx-auto text-gold-500 animate-spin" />
                        <h2 className="text-2xl font-black text-white">
                            {state === 'redeeming' ? content.redeeming : content.loading}
                        </h2>
                    </motion.div>
                );

            case 'sign_in_required':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-gold-500/15 rounded-full flex items-center justify-center">
                            <LogIn className="w-9 h-9 text-gold-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.signInTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.signInDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.LOGIN)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.signInCta}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                        </div>
                        <p className="text-[11px] text-zinc-500">{content.signInBack}</p>
                    </motion.div>
                );

            case 'ready':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-gold-500/15 rounded-full flex items-center justify-center">
                            <Gift className="w-9 h-9 text-gold-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.readyTitle}</h2>
                        {productId && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700">
                                <Gift className="w-3.5 h-3.5 text-gold-400" />
                                <span className="text-sm font-bold text-gold-400">
                                    {productLabel(productId, locale)}
                                </span>
                            </div>
                        )}
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.readyDesc}</p>
                        {expiresAt && (
                            <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                    {content.expiry}: {formatExpiry(expiresAt, locale)}
                                </span>
                            </div>
                        )}
                        <Button
                            onClick={handleClaim}
                            className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                        >
                            {content.claimCta}
                        </Button>
                    </motion.div>
                );

            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white">{content.successTitle}</h2>
                        <p className="text-zinc-400 max-w-md mx-auto">{content.successDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.successCta}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                        </div>
                        <p className="text-[11px] text-zinc-500">{content.successAgain}</p>
                    </motion.div>
                );

            case 'expired':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-yellow-500/15 rounded-full flex items-center justify-center">
                            <Clock className="w-9 h-9 text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.expiredTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.expiredDesc}</p>
                        <Button
                            onClick={() => navigateTo(Page.SUPPORT)}
                            className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                        >
                            {content.contactSupport}
                        </Button>
                    </motion.div>
                );

            case 'already_claimed':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-blue-500/15 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.alreadyTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.alreadyDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.successCta}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'wrong_account':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-orange-500/15 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-9 h-9 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.wrongTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.wrongDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.LOGIN)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.signInCta}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'invalid_link':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-red-500/15 rounded-full flex items-center justify-center">
                            <XCircle className="w-9 h-9 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.invalidTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.invalidDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.HOME)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.title}
                            </Button>
                        </div>
                    </motion.div>
                );

            default:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-red-500/15 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-9 h-9 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white">{content.serverTitle}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">{content.serverDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => void loadStatus()}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.serverRetry}
                            </Button>
                            <Button
                                onClick={() => navigateTo(Page.SUPPORT)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-xl"
                            >
                                {content.contactSupport}
                            </Button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
                <BrandLogo className="text-4xl" />
            </motion.div>

            <div className="relative z-10 w-full max-w-lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-12"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-2 text-xs text-zinc-600"
            >
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>{content.securityNote}</span>
            </motion.div>
        </div>
    );
};

export default GuestOrderClaimPage;
