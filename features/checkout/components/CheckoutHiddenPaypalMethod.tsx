'use client';

import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';

interface CheckoutHiddenPaypalMethodProps {
    isAr: boolean;
    checkout: CheckoutController;
    id: string;
}

export function CheckoutHiddenPaypalMethod({ isAr, checkout, id }: CheckoutHiddenPaypalMethodProps) {
    const { paymobMethod, setPaymobMethod } = checkout;

    return (
                                        <motion.div
                                            id={id}
                                            whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('paypal')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'paypal'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-gold-500 text-black font-bold flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "PayPal / بطاقة دولية (Paymob PayPal)" : "PayPal & Global Credit Cards"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع آمن دولياً بالدولار الأمريكي (ID: 5792310)" : "Secure international payment in USD"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob PayPal
                                        </span>
                                        {paymobMethod === 'paypal' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                        </motion.div>
    );
}
