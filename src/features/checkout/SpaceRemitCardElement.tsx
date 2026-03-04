/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  💳 SPACE REMIT CARD ELEMENT
 *  Embedded Card Input Component using SpaceRemit JavaScript SDK
 *  PCI Compliant - Card data never touches your server
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

declare global {
    interface Window {
        SPACEREMIT?: {
            init: (config: {
                public_key: string;
                form_id: string;
                card_container_id: string;
                amount: number;
                currency: string;
                customer_email?: string;
                customer_name?: string;
                notes?: string;
            }) => void;
            submit: () => Promise<{
                success: boolean;
                spaceremit_code?: string;
                error?: string;
            }>;
        };
        SP_SUCCESSFUL_PAYMENT?: (code: string) => void;
        SP_FAILD_PAYMENT?: () => void;
        SP_RECIVED_MESSAGE?: (msg: string) => void;
    }
}

export interface SpaceRemitCardElementProps {
    publicKey: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    customerName?: string;
    onReady: (ready: boolean) => void;
    onTokenReceived: (spaceremitCode: string, cardInfo?: { last4?: string; brand?: string }) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

export const SpaceRemitCardElement: React.FC<SpaceRemitCardElementProps> = ({
    publicKey,
    amount,
    currency,
    customerEmail,
    customerName,
    onReady,
    onTokenReceived,
    onError,
    disabled = false
}) => {
    const { language } = usePreferences();
    const isAr = language === 'ar';
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const scriptLoadedRef = useRef(false);
    const maxRetries = 3;

    // Validate public key early
    useEffect(() => {
        if (!publicKey || publicKey.trim() === '') {
            const errorMsg = isAr
                ? 'مفتاح الدفع غير مُعد. يرجى الاتصال بالدعم.'
                : 'Payment key not configured. Please contact support.';
            console.error('❌ [SpaceRemit] Empty public key:', { publicKey, length: publicKey?.length });
            setInitError(errorMsg);
            setIsLoading(false);
            onError(errorMsg);
        }
    }, [publicKey, isAr, onError]);

    // Load SpaceRemit SDK
    useEffect(() => {
        if (scriptLoadedRef.current || initError) {
            setIsLoading(false);
            return;
        }

        const loadScript = () => {
            console.log('📦 [SpaceRemit] Loading SDK script...');
            const script = document.createElement('script');
            script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
            script.async = true;
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                console.log('✅ [SpaceRemit] SDK loaded successfully');
                scriptLoadedRef.current = true;
                setIsLoading(false);
            };

            script.onerror = (error) => {
                console.error('❌ [SpaceRemit] Failed to load SDK:', error);
                setIsLoading(false);
                const errorMsg = isAr
                    ? 'فشل تحميل بوابة الدفع. تأكد من اتصالك بالإنترنت.'
                    : 'Failed to load payment gateway. Check your internet connection.';
                setInitError(errorMsg);
                onError(errorMsg);
            };

            document.body.appendChild(script);
        };

        loadScript();
    }, [isAr, onError, initError]);

    // Initialize SpaceRemit card element
    useEffect(() => {
        // Don't proceed if loading, has error, disabled, or container not ready
        if (isLoading || initError || !containerRef.current || disabled) return;

        // Check HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            const warningMsg = isAr
                ? '⚠️ يجب استخدام HTTPS للدفع. الموقع غير آمن.'
                : '⚠️ HTTPS required for payments. Site is not secure.';
            console.warn(warningMsg);
        }

        try {
            // Validate public key format
            if (!publicKey || !publicKey.startsWith('pk') && !publicKey.startsWith('sb')) {
                throw new Error(`Invalid public key format: ${publicKey?.substring(0, 8)}...`);
            }

            console.log('🔧 [SpaceRemit] Initializing with:', {
                publicKey: `${publicKey?.substring(0, 8)}...`,
                amount,
                currency,
                form_id: 'spaceremit-checkout-form',
                card_container_id: 'spaceremit-card-element'
            });

            // Set up global callbacks BEFORE init
            window.SP_SUCCESSFUL_PAYMENT = (code: string) => {
                console.log('✅ [SpaceRemit] Payment successful:', code);
                onTokenReceived(code);
            };

            window.SP_FAILD_PAYMENT = () => {
                console.error('❌ [SpaceRemit] Payment failed');
                const errorMsg = isAr
                    ? 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.'
                    : 'Payment failed. Please try again.';
                onError(errorMsg);
            };

            window.SP_RECIVED_MESSAGE = (msg: string) => {
                console.log('📩 [SpaceRemit] Message:', msg);
            };

            // Initialize SpaceRemit
            if (window.SPACEREMIT) {
                window.SPACEREMIT.init({
                    public_key: publicKey,
                    form_id: 'spaceremit-checkout-form',
                    card_container_id: 'spaceremit-card-element',
                    amount: amount,
                    currency: currency,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    notes: `Order payment - ${new Date().toISOString()}`
                });

                console.log('✅ [SpaceRemit] Initialization complete');
                setIsInitialized(true);
                setInitError(null);
                onReady(true);
            } else {
                throw new Error('Window.SPACEREMIT is undefined after script load');
            }
        } catch (error) {
            const errorMsg = (error as Error).message;
            console.error('❌ [SpaceRemit] Initialization error:', error);

            // Retry logic
            if (retryCount < maxRetries) {
                console.log(`🔄 [SpaceRemit] Retrying initialization (${retryCount + 1}/${maxRetries})...`);
                setRetryCount(prev => prev + 1);
                return;
            }

            const userFriendlyMsg = isAr
                ? 'حدث خطأ في تهيئة بوابة الدفع. يرجى إعادة تحميل الصفحة.'
                : 'Error initializing payment gateway. Please refresh the page.';
            setInitError(userFriendlyMsg);
            onError(userFriendlyMsg);
        }
    }, [isLoading, initError, retryCount, publicKey, amount, currency, customerEmail, customerName, disabled, isAr, onReady, onError, onTokenReceived]);

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 bg-black/40 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-400 font-medium">
                    {isAr ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}
                </span>
                <p className="text-xs text-zinc-500">
                    {isAr ? 'يرجى الانتظار...' : 'Please wait...'}
                </p>
            </div>
        );
    }

    // Error state - Critical fix: Show clear error instead of empty space
    if (initError) {
        return (
            <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                    <p className="text-sm font-bold text-red-400 mb-1">
                        {isAr ? '⚠️ خطأ في بوابة الدفع' : '⚠️ Payment Gateway Error'}
                    </p>
                    <p className="text-xs text-red-500/80">{initError}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setInitError(null);
                        setRetryCount(0);
                        setIsLoading(true);
                        scriptLoadedRef.current = false;
                        window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
            </div>
        );
    }

    // Not initialized state
    if (!isInitialized) {
        return (
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-yellow-400 font-medium">
                    {isAr ? 'جاري تحضير نموذج الدفع...' : 'Initializing payment form...'}
                </span>
                <p className="text-xs text-yellow-500/70">
                    {isAr ? 'إذا استمر هذا طويلاً، يرجى إعادة تحميل الصفحة.' : 'If this takes too long, please refresh the page.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Security Badge */}
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                    <p className="text-xs font-bold text-green-400">
                        {isAr
                            ? '🔒 دفع آمن عبر SpaceRemit'
                            : '🔒 Secure Payment via SpaceRemit'}
                    </p>
                    <p className="text-[10px] text-green-500/70 mt-0.5">
                        {isAr
                            ? 'بيانات بطاقتك مشفرة ومحمية. نحن لا نخزن أي معلومات بنكية.'
                            : 'Your card details are encrypted and secure. We never store any banking information.'}
                    </p>
                </div>
                <Lock className="w-4 h-4 text-green-500" />
            </div>

            {/* Card Element Container */}
            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-bold text-white">
                        {isAr ? 'بيانات البطاقة البنكية' : 'Card Details'}
                    </span>
                </div>
                <div
                    ref={containerRef}
                    id="spaceremit-card-element"
                    className={`min-h-[180px] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                />
            </div>

            {/* Accepted Cards */}
            <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                    <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold">VISA</div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold">Mastercard</div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold">Mada</div>
                </div>
            </div>
        </div>
    );
};
