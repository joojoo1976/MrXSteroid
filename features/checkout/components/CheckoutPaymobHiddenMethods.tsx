'use client';

import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Store, Phone, CheckCircle2 } from 'lucide-react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';

interface CheckoutPaymobHiddenMethodsProps {
    isAr: boolean;
    checkout: CheckoutController;
    cardId: string;
    walletId: string;
    kioskId: string;
}

export function CheckoutPaymobHiddenMethods({
    isAr,
    checkout,
    cardId,
    walletId,
    kioskId,
}: CheckoutPaymobHiddenMethodsProps) {
    const { paymobMethod, setPaymobMethod } = checkout;
    const { watch, setValue } = checkout.form;

    return (
        <>
                                <motion.div
                                    id={cardId}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('card')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'card'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'card' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "بطاقة بنكية / أونلاين (Paymob Card)" : "Online Credit / Debit Card (Paymob)"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "فيزا / ماستركارد بالجنيه المصري عبر Paymob" : "Visa & Mastercard online in EGP via Paymob"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob
                                        </span>
                                        {paymobMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                </motion.div>

                                {/* Option 2: Mobile Wallet (5792309) */}
                                <motion.div
                                    id={walletId}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('wallet')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3",
                                        paymobMethod === 'wallet'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'wallet' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">
                                                    {isAr ? "محفظة إلكترونية (Mobile Wallets)" : "Mobile Wallets (Vodafone Cash / Orange / Etisalat)"}
                                                </p>
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    {isAr ? "فودافون كاش، اتصالات، أورنج، وي كاش (ID: 5792309)" : "Vodafone Cash, Etisalat Cash, Orange Money"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                                Paymob
                                            </span>
                                            {paymobMethod === 'wallet' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                        </div>
                                    </div>

                                    {/* Required Wallet Phone Number Input */}
                                    {paymobMethod === 'wallet' && (
                                        <div className="pt-2 border-t border-gold-500/20 space-y-2">
                                            <Label className="text-xs text-gold-400 font-bold mb-1 block">
                                                {isAr ? '⚡ رقم المحفظة الإلكترونية (مطلوب)' : '⚡ Wallet Phone Number (Required)'}
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute start-3 top-3 w-4 h-4 text-zinc-500" />
                                                <Input
                                                    id="checkout-wallet-phone"
                                                    value={watch("phoneNumber") || ""}
                                                    onChange={(e) => setValue("phoneNumber", e.target.value, { shouldValidate: true })}
                                                    className="ps-10 bg-black/60 border-zinc-700 text-sm focus:border-gold-500"
                                                    placeholder={isAr ? '01010101010' : '01010101010'}
                                                    maxLength={12}
                                                    dir="ltr"
                                                />
                                            </div>
                                            <p className="text-[10px] text-zinc-600 font-mono">
                                                {isAr
                                                    ? 'اختبار: 01010101010 | MPin: 123456 | OTP: 123456'
                                                    : 'Test: 01010101010 · MPin: 123456 · OTP: 123456'}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Option 3: Accept Kiosk / Cash (5792311) */}
                                <motion.div
                                    id={kioskId}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('kiosk')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'kiosk'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'kiosk' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "أمان / مصاري / كاش (Accept Kiosk)" : "Accept Kiosk Cash (Aman / Masary)"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع نقدي بمنافذ أمان ومصاري بسلسلة كود مرجعي (ID: 5792311)" : "Pay cash via Aman or Masary kiosk codes"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob
                                        </span>
                                        {paymobMethod === 'kiosk' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                </motion.div>
        </>
    );
}
