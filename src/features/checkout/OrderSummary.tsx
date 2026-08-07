import React from 'react';
import { ShoppingBag, ShoppingCart, Lock } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Card } from '../../shared/ui/card';
import { ContentStrings } from '@/shared/types/types';
import DynamicBrandLogo from '../../shared/ui/DynamicBrandLogo';

interface OrderSummaryProps {
    content: ContentStrings;
    variant: string;
    quantity: number;
    totals: {
        subtotal: number;
        addonPrice?: number;
        shippingCost: number;
        discountAmount?: number;
        grandTotal: number;
    };
    isAr: boolean;
    isEg?: boolean;
    onSubmitOrder?: () => void;
}

const VARIANT_LABELS: Record<string, { ar: string; en: string }> = {
    digital: { ar: 'البروتوكول الرقمي', en: 'Digital Protocol (PDF)' },
    bundle: { ar: 'الباقة التكتيكية', en: 'Tactical Bundle' },
    coaching: { ar: 'المحترف الذكي', en: 'Smart Professional (VIP)' },
    coaching_plus: { ar: 'المحترف الذكي + تدريب شخصي', en: 'Smart Professional + Coaching' },
    paperback: { ar: 'النسخة الورقية الفاخرة', en: 'Paperback Edition' },
    hardcover: { ar: 'النسخة ذات الغلاف المقوى', en: 'Hardcover Edition' },
};

const FullBrandName: React.FC<{ isAr: boolean; className?: string }> = ({ isAr, className }) => (
    <span className={`whitespace-nowrap font-black tracking-tighter ${className ?? ''}`}>
        {isAr ? (
            <>
                <span className="text-gold-500">مستر</span>
                <span className="text-white"> إكس</span>
                <span className="text-zinc-400">-</span>
                <span className="text-gold-500">سترويد</span>
            </>
        ) : (
            <span className="text-white">Mr. X-Steroid</span>
        )}
    </span>
);

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    content,
    variant,
    quantity,
    totals,
    isAr,
    isEg,
    onSubmitOrder,
}) => {
    const { formatPrice: globalFormatPrice } = usePreferences();

    const formatPrice = React.useCallback((amount: number) => {
        if (isEg) {
            return new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-EG', {
                style: 'currency',
                currency: 'EGP',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        }
        return globalFormatPrice(amount);
    }, [isEg, isAr, globalFormatPrice]);

    const baseVariant = variant.endsWith('_plus') ? variant.replace('_plus', '') : variant;
    const variantLabel = (VARIANT_LABELS[baseVariant] || VARIANT_LABELS.digital)[isAr ? 'ar' : 'en'];
    const addonLabel = isAr ? 'تدريب شخصي أونلاين لمدة كورس واحد' : 'Online Personal Training for One Course';

    const scrollToPayment = () => {
        document.getElementById('checkout-payment-methods')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const selectPaymentMethod = (method: 'card' | 'paypal') => {
        const el = document.getElementById(method === 'card' ? 'checkout-method-card' : 'checkout-method-paypal');
        el?.click();
        scrollToPayment();
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 shadow-3xl overflow-hidden border-2 rounded-[2.5rem] lg:sticky lg:top-32">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 bg-black/40">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2.5 text-white">
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                    {content.orderSummary || (isAr ? 'ملخص الطلب' : 'Order Summary')}
                </h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Product Preview: cover image + brand name */}
                <div className="flex gap-5 items-center">
                    <div className="w-20 h-28 bg-zinc-800 rounded-xl flex-shrink-0 relative group overflow-hidden border border-white/5 shadow-2xl">
                        <img
                            src={isAr ? "/cover-ar.webp" : "/cover-en.webp"}
                            alt={isAr ? "غلاف الكتاب" : "Book Cover"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/site-logo-mascot.png";
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <DynamicBrandLogo inline variant="full" className="min-w-max" />
                        </div>
                        <p className="text-sm font-black text-gold-500 tracking-tight truncate">
                            {isAr ? 'مستر إكس-سترويد — النسخة الكاملة' : 'Mr. X-Steroid — Full Edition'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5 uppercase tracking-wider">
                                {isAr ? "الكمية: " : "QTY: "}{quantity}
                            </span>
                            {baseVariant !== 'digital' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5 uppercase tracking-wider">
                                    {isAr ? "الوزن: " : "Weight: "}{((baseVariant === 'coaching' || baseVariant === 'coaching_plus' ? 1.2 : 0.8) * quantity).toFixed(1)}kg
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Line-items table */}
                <div>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 pb-2.5 border-b border-zinc-800/70">
                        <span>{isAr ? 'الصنف' : 'Item'}</span>
                        <span className="text-center">{isAr ? 'الكمية' : 'Qty'}</span>
                        <span className="text-end text-blue-300/80">{isAr ? 'القيمة' : 'Price'}</span>
                    </div>

                    <div className="space-y-3 pt-3">
                        {/* Product row */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{variantLabel}</p>
                            </div>
                            <span className="text-xs font-bold text-zinc-400 text-center">×{quantity}</span>
                            <span className="text-sm font-black text-blue-300 text-end whitespace-nowrap">{formatPrice(totals.subtotal)}</span>
                        </div>

                        {/* Coaching addon row */}
                        {totals.addonPrice && totals.addonPrice > 0 ? (
                            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-zinc-200 truncate">{addonLabel}</p>
                                </div>
                                <span className="text-xs font-bold text-zinc-400 text-center">×1</span>
                                <span className="text-sm font-black text-blue-300 text-end whitespace-nowrap">{formatPrice(totals.addonPrice)}</span>
                            </div>
                        ) : null}

                        {/* Shipping */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                            <span className="text-xs font-bold text-zinc-400">{content.shipping || (isAr ? 'الشحن' : 'Shipping')}</span>
                            <span />
                            {totals.shippingCost > 0 ? (
                                <span className="text-xs font-black text-blue-300 text-end whitespace-nowrap">+{formatPrice(totals.shippingCost)}</span>
                            ) : (
                                <span className="text-xs font-black text-green-500 text-end uppercase">{isAr ? 'مجاني' : 'FREE'}</span>
                            )}
                        </div>

                        {/* Discount */}
                        {totals.discountAmount && totals.discountAmount > 0 ? (
                            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                <span className="text-xs font-bold text-green-400">{isAr ? 'خصم كود (Steroid IQ)' : 'Steroid IQ Discount'}</span>
                                <span />
                                <span className="text-xs font-black text-green-400 text-end whitespace-nowrap">-{formatPrice(totals.discountAmount)}</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t border-zinc-700/60 flex items-center justify-between gap-4">
                    <span className="text-sm font-black text-white">{isAr ? 'المجموع الكلي' : 'Order Total'}</span>
                    <span className="text-xl md:text-2xl font-black text-blue-300 font-mono whitespace-nowrap">
                        {formatPrice(totals.grandTotal)}
                    </span>
                </div>
            </div>

            {/* Payment Options */}
            <div className="px-6 space-y-4 pb-2">
                {/* PayPal — only offered on the Global region (Paymob handles Egypt) */}
                {!isEg && (
                    <>
                        <button
                            type="button"
                            onClick={() => selectPaymentMethod('paypal')}
                            className="w-full py-3.5 rounded-2xl bg-[#FFC439] hover:bg-[#ffcd57] active:scale-[0.99] text-[#003087] font-black text-base italic tracking-tight transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                        >
                            <span className="not-italic text-lg leading-none font-black">P</span>
                            <span>Pay</span><span className="not-italic font-black">Pal</span>
                        </button>

                        {/* Divider: أو */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-zinc-700/60" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{isAr ? 'أو' : 'or'}</span>
                            <div className="flex-1 h-px bg-zinc-700/60" />
                        </div>
                    </>
                )}

                {/* Pay by card shortcut */}
                <div className="rounded-2xl bg-white p-4 shadow-2xl shadow-black/30">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-[#635BFF] font-black text-lg italic tracking-tighter leading-none">Card</span>
                        <span className="text-[10px] text-zinc-500 font-bold truncate">
                            {isAr ? 'بطاقة ائتمان / خصم' : 'Credit / debit card'}
                        </span>
                    </div>
                    <div className="rounded-xl bg-zinc-100 p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-9 h-6 rounded-md bg-gradient-to-br from-[#635BFF] to-[#00D4FF] flex items-center justify-center text-white text-[8px] font-black shrink-0">VISA</span>
                            <span className="text-sm font-black text-zinc-800">{isAr ? 'الدفع بالبطاقة' : 'Card payment'}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold">
                            {isAr ? 'ادفع بأمان مباشرة عبر أي بطاقة' : 'Pay securely with any card'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => selectPaymentMethod('card')}
                        className="w-full mt-3 py-3 rounded-xl bg-black hover:bg-zinc-900 text-white font-black text-sm transition-colors"
                    >
                        {isAr ? 'الدفع بالبطاقة' : 'Pay by card'}
                    </button>
                </div>
            </div>

            {/* CTA & Footer */}
            <div className="p-6 pt-4 space-y-4">
                <button
                    type="button"
                    onClick={onSubmitOrder}
                    className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.99] text-white font-black text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-green-500/20 transition-all"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {isAr ? 'أكمل الطلب' : 'Complete Order'}
                </button>

                <p className="text-center">
                    <FullBrandName isAr={isAr} className="text-sm md:text-base" />
                </p>

                <div className="flex items-center justify-center gap-2.5 bg-zinc-800/80 rounded-xl py-3 px-4 border border-zinc-700/60">
                    <Lock className="w-4 h-4 text-zinc-300 shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-200 tracking-wide text-center">
                        {content.securePaymentMessage || (isAr ? 'دفع آمن ومشفّر 100% عبر SPACEREMIT' : '100% secure and encrypted payment via SPACEREMIT')}
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default OrderSummary;
