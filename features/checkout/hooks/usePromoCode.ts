'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { validatePromoCode } from '../../../shared/lib/logic';

export interface PromoStatus {
    valid: boolean;
    message: string;
    discount: number;       // fixed flat amount
    discountPct?: number;   // percentage (0.5 or 1)
    codeType?: 'fixed' | 'pct';
}

/** Owns the promo-code input, validation state and apply action. */
export function usePromoCode(isAr: boolean) {
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<PromoStatus | null>(null);
    const [isPromoLoading, setIsPromoLoading] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsPromoLoading(true);
        try {
            const result = await validatePromoCode(promoCode);
            if (result.valid) {
                const newStatus = {
                    valid: true,
                    message: result.message,
                    discount: result.discount || 0,
                    discountPct: result.discountPct,
                    codeType: result.codeType,
                };
                setPromoStatus(newStatus);
                toast.success(result.message);
                // Parent discountAmount is synced by the discountAmount effect above.
            } else {
                setPromoStatus({ valid: false, message: result.message, discount: 0 });
                toast.error(result.message);
            }
        } catch {
            toast.error(isAr ? "خطأ في التحقق من الكود" : "Error validating code");
        } finally {
            setIsPromoLoading(false);
        }
    };

    return {
        promoCode,
        setPromoCode,
        promoStatus,
        isPromoLoading,
        handleApplyPromo,
    };
}
