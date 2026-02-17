import React from 'react';
import { ShoppingBag, Lock, CheckCircle2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Card, CardContent } from '../../shared/ui/card';
import { ContentStrings } from '../../types';
import DynamicBrandLogo from '../../shared/ui/DynamicBrandLogo';

interface OrderSummaryProps {
    content: ContentStrings;
    variant: string;
    quantity: number;
    totals: {
        subtotal: number;
        shippingCost: number;
        grandTotal: number;
    };
    isAr: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ content, variant, quantity, totals, isAr }) => {
    const { formatPrice } = usePreferences();

    return (
        <Card className="bg-zinc-900 border-zinc-800 shadow-3xl overflow-hidden border-2 rounded-[2.5rem] sticky top-32">
            <div className="p-8 border-b border-zinc-800 bg-black/40">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
                    <ShoppingBag className="w-5 h-5 text-gold-500" />
                    {content.orderSummary || (isAr ? "ملخص الطلب" : "Order Summary")}
                </h3>
            </div>

            <CardContent className="p-8 space-y-8">
                {/* Product Preview */}
                <div className="flex gap-6 items-center">
                    <div className="w-24 h-32 bg-zinc-800 rounded-xl flex-shrink-0 relative group overflow-hidden border border-white/5 shadow-2xl">
                        <img
                            src={isAr ? "/cover-ar.webp" : "/cover-en.webp"}
                            alt="Product Cover"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black leading-tight text-white mb-1 flex items-center gap-2">
                            <DynamicBrandLogo inline variant="full" />: <span className="text-gold-500 capitalize">{variant.replace('_plus', ' + Coaching').replace('_', ' ')}</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5 uppercase tracking-wider">
                                {isAr ? "الكمية: " : "QTY: "}{quantity}
                            </span>
                            {variant !== 'digital' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5 uppercase tracking-wider">
                                    {isAr ? "الوزن: " : "Weight: "}{((variant === 'coaching' || variant === 'coaching_plus' ? 1.2 : 0.8) * quantity).toFixed(1)}kg
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Totals Calculation */}
                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex justify-between text-zinc-400 font-bold text-sm">
                        <span>{content.subtotal}</span>
                        <span className="font-mono text-white">{formatPrice(totals.subtotal)}</span>
                    </div>
                    {totals.shippingCost > 0 ? (
                        <div className="flex justify-between text-zinc-400 font-bold text-sm">
                            <span>{content.shipping}</span>
                            <span className="font-mono text-gold-500">+{formatPrice(totals.shippingCost)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between text-zinc-400 font-bold text-sm">
                            <span>{content.shipping}</span>
                            <span className="text-green-500 uppercase tracking-wider text-xs">{isAr ? "مجاني" : "FREE"}</span>
                        </div>
                    )}
                </div>

                {/* Grand Total */}
                <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">
                            {content.total || "TOTAL"}
                        </p>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-bold uppercase">
                            <Lock className="w-3 h-3 text-gold-500" />
                            {content.secureCheckout || "SECURE"}
                        </p>
                    </div>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter text-gold-500 font-mono">
                        {formatPrice(totals.grandTotal)}
                    </div>
                </div>
            </CardContent>

            {/* Security Footer */}
            <div className="p-6 bg-black/40 border-t border-zinc-800">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-400 leading-relaxed font-bold">
                        {content.securePaymentMessage || "Your payment information is processed securely. We do not store credit card details nor have access to your credit card information."}
                    </div>
                </div>
            </div>
        </Card>
    );
};
