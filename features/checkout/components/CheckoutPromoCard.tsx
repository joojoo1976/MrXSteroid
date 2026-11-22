'use client';

import { Target, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';

interface CheckoutPromoCardProps {
    isAr: boolean;
    isEg: boolean;
    checkout: CheckoutController;
}

export function CheckoutPromoCard({ isAr, isEg, checkout }: CheckoutPromoCardProps) {
    const {
        promoCode,
        setPromoCode,
        promoStatus,
        isPromoLoading,
        discountAmount,
        discountPct,
        handleApplyPromo,
    } = checkout;

    return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gold-500">
                        <Target className="w-5 h-5" />
                        {isAr ? "كود الخصم (Steroid IQ)" : "Steroid IQ Promo Code"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder={isAr ? "أدخل الكود هنا" : "Enter Code (e.g. IQ1P-XXXX)"}
                            className="bg-black/40 border-zinc-700 font-mono tracking-widest uppercase"
                            disabled={promoStatus?.valid}
                        />
                        <Button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isPromoLoading || promoStatus?.valid || !promoCode}
                            className={cn(
                                "font-bold w-32",
                                promoStatus?.valid ? "bg-green-500 hover:bg-green-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                            )}
                        >
                            {isPromoLoading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : promoStatus?.valid
                                    ? <CheckCircle2 className="w-5 h-5" />
                                    : (isAr ? "تطبيق" : "Apply")}
                        </Button>
                    </div>

                    {/* Promo Status Feedback */}
                    {promoStatus && (
                        <div className={cn(
                            "mt-3 p-3 rounded-xl border text-sm font-bold flex items-start gap-2",
                            promoStatus.valid
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                        )}>
                            {promoStatus.valid
                                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                            <div>
                                <p>{promoStatus.message}</p>
                                {promoStatus.valid && discountAmount > 0 && (
                                    <p className="text-gold-400 font-black mt-1">
                                        {isAr
                                            ? `💰 تم تطبيق خصم ${discountPct > 0 ? `${discountPct}%` : ''} — وفّرت ${isEg
                                                ? new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(discountAmount)
                                                : `$${discountAmount.toFixed(2)}`}`
                                            : `💰 ${discountPct > 0 ? `${discountPct}% off` : ''} applied — You saved ${isEg
                                                ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(discountAmount)
                                                : `$${discountAmount.toFixed(2)}`}`
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
    );
}
