'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, CheckCircle2, AlertCircle, Clock, FileText, ShieldCheck } from 'lucide-react';
import { InvoiceItem } from '../types/billing.types';
import { BillingService } from '../services/billing.service';
import { InvoicePdfService } from '../services/invoice-pdf.service';

interface InvoiceReceiptModalProps {
    isOpen: boolean;
    invoice: InvoiceItem | null;
    onClose: () => void;
    isRTL?: boolean;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
    isOpen,
    invoice,
    onClose,
    isRTL = true
}) => {
    if (!isOpen || !invoice) return null;

    const planName = BillingService.getPlanName(invoice.tier_id, isRTL);
    const dateFormatted = new Date(invoice.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isSuccess = invoice.status === 'success';
    const isPending = invoice.status === 'pending';

    const handlePrint = () => {
        InvoicePdfService.printInvoice(invoice, isRTL);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
                >
                    {/* Glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 font-black">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-black text-white">
                                    {isRTL ? 'تفاصيل الفاتورة الإلكترونية' : 'Digital Invoice Details'}
                                </h3>
                                <p className="text-xs text-zinc-500 font-mono">
                                    ID: {invoice.id.slice(0, 13)}...
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Status Banner */}
                    <div className={`mt-5 p-4 rounded-2xl border flex items-center justify-between ${
                        isSuccess
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                            : isPending
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-400'
                            : 'bg-red-950/30 border-red-500/30 text-red-400'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            {isSuccess ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : isPending ? (
                                <Clock className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            <span className="text-xs font-black uppercase tracking-wider">
                                {isSuccess
                                    ? (isRTL ? 'مدفوعة وموثقة رسمياً' : 'Payment Confirmed & Settled')
                                    : isPending
                                    ? (isRTL ? 'قيد انتظار التأكيد المصرفي' : 'Pending Payment Confirmation')
                                    : (isRTL ? 'فشلت المعاملة' : 'Transaction Failed')}
                            </span>
                        </div>
                        <span className="text-xs font-bold font-mono">
                            {invoice.gateway.toUpperCase()}
                        </span>
                    </div>

                    {/* Invoice Body */}
                    <div className="mt-6 space-y-4">
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">{isRTL ? 'المنتج / الباقة:' : 'Plan / Package:'}</span>
                                <span className="text-white font-black">{planName}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-400">{isRTL ? 'تاريخ الإصدار:' : 'Issued Date:'}</span>
                                <span className="text-zinc-200 font-medium">{dateFormatted}</span>
                            </div>
                            {invoice.gateway_reference_id && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">{isRTL ? 'المرجع البنكي:' : 'Reference ID:'}</span>
                                    <span className="text-zinc-300 font-mono text-[11px]">{invoice.gateway_reference_id}</span>
                                </div>
                            )}
                            {invoice.customer_email && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">{isRTL ? 'البريد الإلكتروني:' : 'Billed To:'}</span>
                                    <span className="text-zinc-300 font-mono text-[11px]">{invoice.customer_email}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-gold-500/20 flex items-center justify-between">
                            <span className="text-sm font-black text-zinc-300">
                                {isRTL ? 'المبلغ الإجمالي المدفوع:' : 'Total Amount Paid:'}
                            </span>
                            <span className="text-xl md:text-2xl font-black text-gold-400 font-mono">
                                {BillingService.formatPrice(invoice.amount, invoice.currency, isRTL)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-black text-xs md:text-sm transition-all shadow-lg shadow-gold-500/20 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>{isRTL ? 'طباعة / تصدير PDF' : 'Print / Save Receipt PDF'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs md:text-sm transition-colors cursor-pointer border border-zinc-800"
                        >
                            {isRTL ? 'إغلاق' : 'Close'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
