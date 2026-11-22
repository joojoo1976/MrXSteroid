'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';

interface CheckoutRegionCardProps {
    isAr: boolean;
    checkout: CheckoutController;
}

export function CheckoutRegionCard({ isAr, checkout }: CheckoutRegionCardProps) {
    const { regionOption, setRegionOption } = checkout;

    return (
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gold-500 text-lg">
                        <Globe className="w-5 h-5 text-gold-500" />
                        {isAr ? "01. حدد موقعك الإقليمي" : "01. Select Your Region"}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                        {isAr
                            ? "تحديد النطاق الجغرافي يضمن عرض وسائل الدفع المتاحة لدولتك مباشرة"
                            : "Select your region to view tailored local or international payment methods"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRegionOption('EG')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                regionOption === 'EG'
                                    ? "bg-gold-500/10 border-gold-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.15)] ring-2 ring-gold-500/20"
                                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            )}
                        >
                            {regionOption === 'EG' && (
                                <CheckCircle2 className="w-4 h-4 text-gold-500 absolute top-2.5 end-2.5" />
                            )}
                            <span className="text-3xl mb-1">🇪🇬</span>
                            <span className="font-black text-sm">{isAr ? "داخل مصر" : "Inside Egypt"}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                EGP (بالجنيه المصري)
                            </span>
                        </motion.button>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRegionOption('GLOBAL')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                regionOption === 'GLOBAL'
                                    ? "bg-gold-500/10 border-gold-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.15)] ring-2 ring-gold-500/20"
                                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            )}
                        >
                            {regionOption === 'GLOBAL' && (
                                <CheckCircle2 className="w-4 h-4 text-gold-500 absolute top-2.5 end-2.5" />
                            )}
                            <span className="text-3xl mb-1">🌍</span>
                            <span className="font-black text-sm">{isAr ? "خارج مصر" : "Outside Egypt"}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                USD ($ الدولي)
                            </span>
                        </motion.button>
                    </div>
                </CardContent>
            </Card>
    );
}
