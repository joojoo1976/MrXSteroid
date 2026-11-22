'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, Copy, Check, Upload } from 'lucide-react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController, InstapayReceiptState } from '../checkoutFormTypes';

interface CheckoutInstapayMethodProps {
    isAr: boolean;
    checkout: CheckoutController;
    receipt: InstapayReceiptState;
}

export function CheckoutInstapayMethod({ isAr, checkout, receipt }: CheckoutInstapayMethodProps) {
    const { paymobMethod, setPaymobMethod } = checkout;
    const {
        ref: instapayRef,
        setRef: setInstapayRef,
        file: instapayFile,
        error: instapayFileError,
        handleFileChange: handleInstapayFileChange,
    } = receipt;
    const [copiedInstapay, setCopiedInstapay] = React.useState(false);

    const handleCopyInstapay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText('jan.ghattas@instapay');
            setCopiedInstapay(true);
            setTimeout(() => setCopiedInstapay(false), 2500);
        }
    };

    return (
                                <motion.div
                                    id="checkout-method-instapay"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('instapay')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3",
                                        paymobMethod === 'instapay'
                                            ? "border-emerald-500 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'instapay' ? "bg-emerald-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                                <QrCode className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-white text-sm">
                                                        {isAr ? "تحويل إنستاباي الفوري (InstaPay IPN)" : "InstaPay Instant Transfer"}
                                                    </p>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        {isAr ? "فوري ومباشر ⚡" : "Direct & Fast"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                                                    {isAr ? "تحويل فوري عبر تطبيق إنستاباي باستخدام العنوان أو مسح الـ QR" : "Instant transfer via InstaPay address or QR scan"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                InstaPay
                                            </span>
                                            {paymobMethod === 'instapay' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                    </div>

                                    {/* Expanded InstaPay Details & QR Code */}
                                    {paymobMethod === 'instapay' && (
                                        <div className="pt-3 border-t border-emerald-500/20 space-y-4">
                                            <div className="bg-zinc-950/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-zinc-400 block">
                                                            {isAr ? "عنوان الدفع اللحظي (IPA Handle):" : "InstaPay Address (IPA):"}
                                                        </span>
                                                        <span className="text-sm font-black text-emerald-400 font-mono tracking-wide select-all">
                                                            jan.ghattas@instapay
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyInstapay}
                                                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                                    >
                                                        {copiedInstapay ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-emerald-400" />
                                                                <span>{isAr ? "تم النسخ!" : "Copied!"}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                <span>{isAr ? "نسخ المعرف" : "Copy Handle"}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* QR Code Container */}
                                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner text-center">
                                                    <img
                                                        src="/images/instapay-qr.jpg"
                                                        alt="InstaPay QR Code"
                                                        className="w-48 h-48 object-contain rounded-lg"
                                                    />
                                                    <span className="text-xs font-black text-zinc-900 mt-2 font-mono">
                                                        jan.ghattas@instapay
                                                    </span>
                                                    <span className="text-[10px] font-bold text-zinc-600 mt-0.5">
                                                        {isAr ? "امسح الرمز من تطبيق InstaPay للتحويل السريع" : "Scan from your InstaPay mobile app"}
                                                    </span>
                                                </div>

                                                {/* Instructions */}
                                                <div className="text-[11px] text-zinc-300 space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                                                    <p className="font-bold text-emerald-400 flex items-center gap-1">
                                                        <span>📌</span> {isAr ? "خطوات التحويل والتفعيل:" : "Quick Steps:"}
                                                    </p>
                                                    <p>{isAr ? "1. افتح تطبيق إنستاباي وحوّل المبلغ المطلوب إلى jan.ghattas@instapay" : "1. Open InstaPay app and send amount to jan.ghattas@instapay"}</p>
                                                    <p>{isAr ? "2. اكتب اسم صاحب الحساب أو رقم المرجع في الحقل أدناه (اختياري)" : "2. Enter your sender account name or reference below (optional)"}</p>
                                                    <p>{isAr ? "3. اضغط تأكيد الطلب لتسجيل الفاتورة وتفعيل حسابك" : "3. Click Submit to record your invoice & activate your access"}</p>
                                                </div>
                                            </div>

{/* Optional Reference Input */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-emerald-400 font-bold block">
                                                    {isAr ? "اسم صاحب الحساب المحول منه أو رقم العملية (اختياري للتأكيد)" : "Sender Account Name / Transfer Ref (Optional)"}
                                                </Label>
                                                <Input
                                                    value={instapayRef}
                                                    onChange={(e) => setInstapayRef(e.target.value)}
                                                    placeholder={isAr ? "مثال: تحويل باسم أحمد محمود / Ref: 98124" : "e.g. Sent by John Doe / Ref: 98124"}
                                                    className="bg-black/60 border-zinc-700 text-xs focus:border-emerald-500"
                                                />
                                            </div>

                                            {/* Required Receipt Upload */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-emerald-400 font-bold block">
                                                    {isAr ? "🔍 رفع إيصال التحويل (مطلوب للتأكيد)" : "🔍 Upload Transfer Receipt (Required)"}
                                                </Label>
                                                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-black/60 border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 cursor-pointer transition-all text-center">
                                                    <Upload className="w-5 h-5 text-emerald-400" />
                                                    <span className="text-[11px] font-bold text-zinc-300">
                                                        {instapayFile
                                                            ? instapayFile.name
                                                            : isAr
                                                                ? "اضغط لاختيار صورة أو PDF للإيصال — PNG, JPG, WEBP, PDF (حتى 10MB)"
                                                                : "Tap to select receipt image or PDF — PNG, JPG, WEBP, PDF (up to 10MB)"}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp,application/pdf"
                                                        onChange={handleInstapayFileChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {instapayFileError && (
                                                    <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter">{instapayFileError}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
    );
}
