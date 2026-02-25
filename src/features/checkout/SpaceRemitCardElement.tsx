/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  💳 SPACE REMIT CARD ELEMENT
 *  Embedded Card Input Component using SpaceRemit JavaScript SDK
 *  PCI Compliant - Card data never touches your server
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
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
    const scriptLoadedRef = useRef(false);

    // Load SpaceRemit SDK
    useEffect(() => {
        if (scriptLoadedRef.current) {
            setIsLoading(false);
            return;
        }

        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
            script.async = true;
            script.onload = () => {
                scriptLoadedRef.current = true;
                setIsLoading(false);
            };
            script.onerror = () => {
                setIsLoading(false);
                onError(isAr 
                    ? 'فشل تحميل بوابة الدفع. يرجى التحقق من اتصالك بالإنترنت.' 
                    : 'Failed to load payment gateway. Please check your internet connection.');
            };
            document.body.appendChild(script);
        };

        loadScript();
    }, [isAr, onError]);

    // Initialize SpaceRemit card element
    useEffect(() => {
        if (isLoading || !containerRef.current || disabled) return;

        try {
            // Set up global callbacks
            window.SP_SUCCESSFUL_PAYMENT = (code: string) => {
                console.log('✅ Payment successful:', code);
                // The SpaceRemit SDK doesn't provide card details directly
                // Card details are handled within the embedded iframe
                onTokenReceived(code);
            };

            window.SP_FAILD_PAYMENT = () => {
                console.error('❌ Payment failed');
                onError(isAr
                    ? 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.'
                    : 'Payment failed. Please try again.');
            };

            window.SP_RECIVED_MESSAGE = (msg: string) => {
                console.log('📩 SpaceRemit message:', msg);
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

                setIsInitialized(true);
                onReady(true);
            }
        } catch (error) {
            console.error('Error initializing SpaceRemit:', error);
            onError(isAr
                ? 'حدث خطأ في تهيئة بوابة الدفع'
                : 'Error initializing payment gateway');
        }
    }, [isLoading, publicKey, amount, currency, customerEmail, customerName, disabled, isAr, onReady, onError, onTokenReceived]);

    if (isLoading) {
        return (
            <div className="p-6 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-400 font-medium">
                    {isAr ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}
                </span>
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
                {!isInitialized && !isLoading && (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        {isAr
                            ? 'جاري تحضير نموذج الدفع...'
                            : 'Initializing payment form...'}
                    </div>
                )}
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
