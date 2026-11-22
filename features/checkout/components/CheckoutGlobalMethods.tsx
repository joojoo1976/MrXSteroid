'use client';

import { motion } from 'framer-motion';
import { Zap, Globe, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';

interface CheckoutGlobalMethodsProps {
    isAr: boolean;
    checkout: CheckoutController;
}

export function CheckoutGlobalMethods({ isAr, checkout }: CheckoutGlobalMethodsProps) {
    const { paymobMethod, setPaymobMethod } = checkout;

    return (
        <>
                                <motion.div
                                    id="checkout-method-stripe"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('stripe')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'stripe'
                                            ? "border-[#635bff] bg-[#635bff]/10 shadow-[0_0_20px_rgba(99,91,255,0.2)] ring-1 ring-[#635bff]/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'stripe' ? "bg-[#635bff] text-white font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "بطاقة دولية / Link by Stripe" : "Card / Link by Stripe"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع مضمّن آمن بدون إعادة توجيه — PCI-DSS" : "Secure embedded checkout — no redirect, PCI-DSS"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-[#635bff] bg-[#635bff]/10 px-2 py-0.5 rounded-full border border-[#635bff]/20">
                                            Stripe
                                        </span>
                                        {paymobMethod === 'stripe' && <CheckCircle2 className="w-5 h-5 text-[#635bff]" />}
                                    </div>
                                </motion.div>

                                {/* Option 3: Kashier Global (كاشير الدولي) */}
                                <motion.div
                                    id="checkout-method-kashier-global"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('kashier')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'kashier'
                                            ? "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'kashier' ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "كاشير الدولي / بطاقات ائتمان (Kashier Global)" : "Kashier Global (USD Credit Cards)"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع دولي سريع وآمن ببطاقات فيزا وماستركارد (USD)" : "Fast & secure international card checkout in USD"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                            Kashier
                                        </span>
                                        {paymobMethod === 'kashier' && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                                    </div>
                                </motion.div>
        </>
    );
}
