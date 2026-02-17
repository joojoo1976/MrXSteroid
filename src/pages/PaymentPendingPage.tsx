/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ⏳ MR. X STEROID - PAYMENT PENDING PAGE                                 ║
 * ║  Loading state while waiting for payment confirmation                    ║
 * ║  حالة الانتظار أثناء تأكيد الدفع                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { paymentService } from '../shared/lib/payment.service';
import { Button } from '../shared/ui/button';
import BrandLogo from '../shared/ui/BrandLogo';
import { Page } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface PaymentPendingPageProps {
    transactionId: string;
    navigateTo: (page: Page) => void;
    locale?: 'ar' | 'en';
}

type PaymentState = 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

// ═══════════════════════════════════════════════════════════════════════════
//                              CONTENT STRINGS
// ═══════════════════════════════════════════════════════════════════════════

const CONTENT = {
    ar: {
        title: 'جاري معالجة الدفع',
        subtitle: 'يرجى الانتظار بينما نتحقق من معاملتك...',
        processing: 'جاري التحقق من الدفع',
        success: '🎉 تم الدفع بنجاح!',
        successDesc: 'تم تفعيل اشتراكك. يمكنك الآن الوصول لجميع المميزات.',
        failed: '❌ فشل الدفع',
        failedDesc: 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.',
        timeout: '⏰ انتهت مهلة الانتظار',
        timeoutDesc: 'لم نتمكن من التحقق من الدفع. إذا تم خصم المبلغ، سيتم تفعيل حسابك خلال دقائق.',
        goToDashboard: 'الذهاب للوحة التحكم',
        tryAgain: 'المحاولة مرة أخرى',
        contactSupport: 'تواصل مع الدعم',
        waitingMessage: 'لا تغلق هذه الصفحة...',
        securityNote: 'معاملتك محمية بتشفير 256-bit AES'
    },
    en: {
        title: 'Processing Payment',
        subtitle: 'Please wait while we verify your transaction...',
        processing: 'Verifying Payment',
        success: '🎉 Payment Successful!',
        successDesc: 'Your subscription has been activated. You now have access to all premium features.',
        failed: '❌ Payment Failed',
        failedDesc: 'There was an error processing your payment. Please try again.',
        timeout: '⏰ Verification Timeout',
        timeoutDesc: 'We could not verify your payment in time. If charged, your account will be activated within minutes.',
        goToDashboard: 'Go to Dashboard',
        tryAgain: 'Try Again',
        contactSupport: 'Contact Support',
        waitingMessage: "Don't close this page...",
        securityNote: 'Your transaction is secured with 256-bit AES encryption'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//                              MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PaymentPendingPage: React.FC<PaymentPendingPageProps> = ({
    transactionId,
    navigateTo,
    locale = 'en'
}) => {
    const [state, setState] = useState<PaymentState>('pending');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [_checkCount, setCheckCount] = useState(0);
    const isAr = locale === 'ar';
    const content = CONTENT[locale];

    // ─────────────────────────────────────────────────────────────────────────
    // Payment Status Polling
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!transactionId) {
            // Use timeout to avoid sync setState in effect
            const failTimeout = setTimeout(() => setState('failed'), 0);
            return () => clearTimeout(failTimeout);
        }

        const maxWaitTime = 300000; // 5 minutes
        const checkInterval = 3000; // 3 seconds
        let isActive = true;

        const checkStatus = async () => {
            if (!isActive) return;
            setCheckCount(prev => prev + 1);

            const result = await paymentService.checkTransactionStatus(transactionId);

            if (result.success && isActive) {
                const { status } = result.data;

                if (status === 'completed') {
                    setState('completed');
                } else if (status === 'failed' || status === 'cancelled') {
                    setState('failed');
                } else if (status === 'processing') {
                    setState('processing');
                }
            }
        };

        // Start polling
        const intervalId = setInterval(checkStatus, checkInterval);

        // Timeout after max wait time
        const timeoutId = setTimeout(() => {
            if (isActive && (state === 'pending' || state === 'processing')) {
                setState('timeout');
            }
        }, maxWaitTime);

        // Listen for payment events from PaymentService
        const handlePaymentSuccess = () => {
            if (isActive) {
                setState('completed');
            }
        };

        window.addEventListener('paymentSuccess', handlePaymentSuccess);

        return () => {
            isActive = false;
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            window.removeEventListener('paymentSuccess', handlePaymentSuccess);
        };
    }, [transactionId, state]);

    // ─────────────────────────────────────────────────────────────────────────
    // Elapsed Time Counter
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (state === 'pending' || state === 'processing') {
            const timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [state]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render States
    // ─────────────────────────────────────────────────────────────────────────
    const renderContent = () => {
        switch (state) {
            case 'completed':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white">{content.success}</h2>
                        <p className="text-zinc-400 max-w-md mx-auto">{content.successDesc}</p>
                        <Button
                            onClick={() => navigateTo(Page.DASHBOARD)}
                            className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-6 text-lg rounded-xl"
                        >
                            {content.goToDashboard}
                        </Button>
                    </motion.div>
                );

            case 'failed':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white">{content.failed}</h2>
                        <p className="text-zinc-400 max-w-md mx-auto">{content.failedDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.CHECKOUT)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.tryAgain}
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

            case 'timeout':
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <Clock className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white">{content.timeout}</h2>
                        <p className="text-zinc-400 max-w-md mx-auto">{content.timeoutDesc}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="bg-gold-500 hover:bg-gold-400 text-black font-black px-8 py-4 rounded-xl"
                            >
                                {content.goToDashboard}
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

            // Pending / Processing
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-8"
                    >
                        {/* Animated Loader */}
                        <div className="relative w-32 h-32 mx-auto">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />

                            {/* Spinning Ring */}
                            <motion.div
                                className="absolute inset-0 border-4 border-transparent border-t-gold-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />

                            {/* Pulse Effect */}
                            <motion.div
                                className="absolute inset-4 bg-gold-500/10 rounded-full"
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />

                            {/* Center Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white">{content.title}</h2>
                            <p className="text-zinc-400">{content.subtitle}</p>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">{formatTime(elapsedTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>{content.processing}</span>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="w-full max-w-xs mx-auto">
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gold-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: ['0%', '30%', '60%', '90%'] }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-zinc-600 font-bold">
                            {content.waitingMessage}
                        </p>
                    </motion.div>
                );
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Main Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen bg-black flex flex-col items-center justify-center p-4"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            {/* Logo */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12"
            >
                <BrandLogo className="text-4xl" />
            </motion.div>

            {/* Main Content */}
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

            {/* Security Badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-2 text-xs text-zinc-600"
            >
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>{content.securityNote}</span>
            </motion.div>

            {/* Transaction ID */}
            {transactionId && (
                <p className="mt-4 text-[10px] font-mono text-zinc-700">
                    TXN: {transactionId}
                </p>
            )}
        </div>
    );
};

export default PaymentPendingPage;
