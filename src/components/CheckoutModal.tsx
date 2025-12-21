import React, { useState, useEffect } from 'react';
import { CheckCircle, Lock, X, User, Mail, CreditCard, Loader2, Download, ShieldCheck } from 'lucide-react';
import { PricingTier, ContentStrings } from '../types';

interface CheckoutModalProps { isOpen: boolean; onClose: () => void; tier: PricingTier | null; content: ContentStrings; formattedPrice: string; onSuccess: () => void; }

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, tier, content, formattedPrice, onSuccess }) => {
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
    useEffect(() => { if (isOpen) setStep('form'); }, [isOpen]);
    if (!isOpen || !tier) return null;
    const handlePay = (e: React.FormEvent) => { e.preventDefault(); setStep('processing'); setTimeout(() => { setStep('success'); onSuccess(); }, 2500); };
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative z-10 overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                    <h3 className="font-bold text-lg flex items-center gap-2">{step === 'success' ? <CheckCircle className="text-green-500" /> : <Lock className="text-gold-500 w-5 h-5" />}{step === 'success' ? content.purchaseSuccess.split('!')[0] : content.checkoutTitle}</h3><button onClick={onClose} className="text-zinc-500 hover:text-red-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                    {step === 'form' && (
                        <form onSubmit={handlePay} className="space-y-4">
                            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl flex justify-between items-center mb-4"><div><p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{tier.name}</p><p className="text-xs text-zinc-500">{content.total}</p></div><div className="text-xl font-black text-zinc-900 dark:text-white">{formattedPrice}</div></div>
                            <div className="space-y-3">
                                <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 uppercase">{content.fullName}</label><div className="relative"><User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-400" /><input required type="text" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2.5 px-3 ps-10 focus:border-gold-500 focus:outline-none" placeholder="John Doe" /></div></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 uppercase">{content.emailAddress}</label><div className="relative"><Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-400" /><input required type="email" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2.5 px-3 ps-10 focus:border-gold-500 focus:outline-none" placeholder="john@example.com" /></div></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 uppercase">{content.creditCard}</label><div className="relative"><CreditCard className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-400" /><input required type="text" dir="ltr" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2.5 px-3 ps-10 focus:border-gold-500 focus:outline-none text-start" placeholder="0000 0000 0000 0000" /></div></div>
                                <div className="flex gap-4"><div className="space-y-1 flex-1"><label className="text-xs font-bold text-zinc-500 uppercase">{content.expiryDate}</label><input required type="text" dir="ltr" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2.5 px-3 focus:border-gold-500 focus:outline-none text-center" placeholder="MM/YY" /></div><div className="space-y-1 flex-1"><label className="text-xs font-bold text-zinc-500 uppercase">{content.cvc}</label><input required type="text" dir="ltr" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2.5 px-3 focus:border-gold-500 focus:outline-none text-center" placeholder="123" /></div></div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{content.payNow}</button>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 mt-2"><ShieldCheck className="w-3 h-3" />{content.secureCheckout}</div>
                        </form>
                    )}
                    {step === 'processing' && <div className="flex flex-col items-center justify-center py-10 space-y-4"><Loader2 className="w-12 h-12 text-gold-500 animate-spin" /><p className="text-zinc-500 animate-pulse">{content.processing}</p></div>}
                    {step === 'success' && <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center animate-fade-in"><div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-500" /></div><div><h4 className="text-xl font-bold mb-2">{content.purchaseSuccess}</h4><p className="text-sm text-zinc-500 dark:text-zinc-400">Please check your email for the receipt.</p></div><a href="/dummy-book.pdf" download className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Download className="w-5 h-5" />{content.downloadFullBook}</a></div>}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
