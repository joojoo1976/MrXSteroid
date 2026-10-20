'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  features/checkout/MultiLegCheckoutCoordinator.tsx
 *
 *  Interactive Multi-Leg Payment Coordinator (Client-Side).
 *  Handles multi-gateway checkout flows (Fourthwall merchandise + Kashier services):
 *  1. Displays individual leg statuses (pending, succeeded, failed).
 *  2. Guides the buyer through sequential provider checkout sessions.
 *  3. Allows safe resumption when returning from Provider 1 to proceed to Leg 2.
 *  4. Supports cancellation handling and leg retry without recreating invoices.
 *  5. Gates completion until the server verifies overall status === 'paid'.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../shared/ui/card';
import { paymentService, type ClientPaymentLeg, type CheckoutStatusResult } from '../../shared/lib/payment.service';

interface MultiLegCheckoutCoordinatorProps {
    invoiceId: string;
    initialLegs?: ClientPaymentLeg[];
    isAr?: boolean;
    onCompleted?: () => void;
    onCancel?: () => void;
}

export const MultiLegCheckoutCoordinator: React.FC<MultiLegCheckoutCoordinatorProps> = ({
    invoiceId,
    initialLegs = [],
    isAr = true,
    onCompleted,
    onCancel,
}) => {
    const [legs, setLegs] = useState<ClientPaymentLeg[]>(initialLegs);
    const [paymentStatus, setPaymentStatus] = useState<string>('pending');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const refreshStatus = async () => {
        if (!invoiceId) return;
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res: CheckoutStatusResult = await paymentService.getCheckoutStatus(invoiceId);
            if (res.success) {
                if (res.legs && res.legs.length > 0) {
                    setLegs(res.legs);
                }
                if (res.paymentStatus) {
                    setPaymentStatus(res.paymentStatus);
                }
                if (res.isCompleted || res.paymentStatus === 'paid') {
                    onCompleted?.();
                }
            } else {
                setErrorMessage(res.error || (isAr ? 'تعذر جلب حالة الدفع' : 'Could not fetch status'));
            }
        } catch (err) {
            setErrorMessage(isAr ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 4000);
        return () => clearInterval(interval);
    }, [invoiceId]);

    const allSucceeded = paymentStatus === 'paid' || legs.every((l) => l.status === 'succeeded');
    const nextLeg = legs.find((l) => l.status !== 'succeeded') || null;

    const handleProceedToLeg = (leg: ClientPaymentLeg) => {
        if (leg.sessionUrl && typeof window !== 'undefined') {
            window.location.assign(leg.sessionUrl);
        }
    };

    return (
        <Card className="bg-zinc-900/90 border-2 border-gold-500/30 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden text-white" dir={isAr ? 'rtl' : 'ltr'}>
            <CardHeader className="border-b border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-gold-400">
                        <ShieldCheck className="w-5 h-5 text-gold-500" />
                        {isAr ? 'منسق الدفع متعدد المراحل' : 'Multi-Leg Payment Coordinator'}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshStatus}
                        disabled={isLoading}
                        className="text-zinc-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <CardDescription className="text-xs text-zinc-400">
                    {isAr
                        ? 'طلبك يحتوي على منتجات وخدمات تتطلب تسوية مستقلة لكل جزء تحت نفس الفاتورة.'
                        : 'Your order contains mixed items requiring independent gateway sessions for the same invoice.'}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
                {errorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="space-y-3">
                    {legs.map((leg, idx) => {
                        const isSucceeded = leg.status === 'succeeded';
                        const isCurrent = nextLeg?.id === leg.id;
                        const isFailed = leg.status === 'failed';

                        return (
                            <motion.div
                                key={leg.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                                    isSucceeded
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                        : isCurrent
                                        ? 'bg-gold-500/10 border-gold-500/40 text-white shadow-lg'
                                        : isFailed
                                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                        : 'bg-black/30 border-zinc-800 text-zinc-400'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-zinc-800 border border-zinc-700">
                                        {isSucceeded ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : isFailed ? (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold capitalize">
                                            {leg.legType === 'merchandise'
                                                ? (isAr ? 'الدفعة 1: الكتب والمنتجات (Fourthwall)' : 'Leg 1: Books & Merchandise (Fourthwall)')
                                                : (isAr ? 'الدفعة 2: التدريب والاستشارات (Kashier)' : 'Leg 2: Coaching & Consultation (Kashier)')}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {leg.amount} {leg.currency} •{' '}
                                            <span className="font-semibold">
                                                {isSucceeded
                                                    ? (isAr ? 'مكتمل ✅' : 'Completed ✅')
                                                    : isFailed
                                                    ? (isAr ? 'فشل السداد ⚠️' : 'Payment Failed ⚠️')
                                                    : (isAr ? 'في انتظار السداد' : 'Pending Payment')}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {isSucceeded ? (
                                        <span className="text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">
                                            {isAr ? 'مدفوع' : 'Paid'}
                                        </span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            disabled={!leg.sessionUrl || isLoading}
                                            onClick={() => handleProceedToLeg(leg)}
                                            className={
                                                isFailed
                                                    ? 'bg-red-500 hover:bg-red-400 text-white font-bold text-xs'
                                                    : 'bg-gold-500 hover:bg-gold-400 text-black font-black text-xs'
                                            }
                                        >
                                            {isFailed
                                                ? (isAr ? 'إعادة المحاولة' : 'Retry')
                                                : (isAr ? 'سداد الآن' : 'Pay Now')}
                                            <ExternalLink className="w-3.5 h-3.5 ms-1" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>

            <CardFooter className="border-t border-zinc-800 pt-4 flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">
                    {isAr
                        ? 'تُفعّل الصلاحيات والتنزيلات تلقائيًا فور اكتمال جميع الأرجل.'
                        : 'Entitlements unlock automatically upon full settlement.'}
                </p>
                {onCancel && !allSucceeded && (
                    <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-zinc-400">
                        {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
