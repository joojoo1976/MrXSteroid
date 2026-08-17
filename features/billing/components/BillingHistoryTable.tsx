'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Printer, CheckCircle2, Clock, AlertCircle, ShieldCheck, Crown, ExternalLink } from 'lucide-react';
import { InvoiceItem } from '../types/billing.types';
import { BillingService } from '../services/billing.service';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import { useUserInvoices } from '../hooks/useUserInvoices';

interface BillingHistoryTableProps {
    userId?: string | null;
    isRTL?: boolean;
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({
    userId,
    isRTL = true
}) => {
    const { invoices, subscription, loading, refreshing, refresh } = useUserInvoices(userId, isRTL);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

    const isSubscribed = subscription && subscription.status === 'active';

    return (
        <div className="space-y-6">
            {/* Active Subscription Summary Card */}
            <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 p-0.5 shadow-lg shadow-gold-500/20">
                            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center text-gold-400">
                                <Crown className="w-7 h-7" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg md:text-xl font-black text-white">
                                    {subscription ? subscription.planName : (isRTL ? 'الاشتراك الحالي' : 'Current Subscription')}
                                </h3>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                    isSubscribed
                                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}>
                                    {isSubscribed ? (isRTL ? 'نشط ومفعل' : 'ACTIVE') : (isRTL ? 'مجاني / غير مفعل' : 'FREE TIER')}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">
                                {isSubscribed
                                    ? (isRTL ? 'تم تفعيل جميع مميزات المحرك الحسابي والأدوات المتقدمة بنجاح.' : 'Full BioCalc engine and advanced protocols unlocked.')
                                    : (isRTL ? 'قم بالترقية للحصول على البروتوكول الكامل والوصول غير المحدود.' : 'Upgrade to unlock full protocol cycles and downloads.')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={refresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices History Table */}
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 mb-4">
                    <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-gold-400" />
                        <h4 className="text-sm md:text-base font-black text-white">
                            {isRTL ? 'سجل المعاملات والفواتير الصادرة' : 'Transaction & Invoices History'}
                        </h4>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                        {invoices.length} {isRTL ? 'معاملات' : 'invoices'}
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-zinc-500 text-xs font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                        {isRTL ? 'جاري جلب سجل الفواتير...' : 'Loading invoice records...'}
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs font-bold">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-600" />
                        {isRTL ? 'لا توجد فواتير أو عمليات دفع سابقة مسجلة.' : 'No invoices or past transactions found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead>
                                <tr className="border-b border-zinc-800/60 text-zinc-400 uppercase text-[11px] font-black">
                                    <th className="py-3 px-3">{isRTL ? 'رقم الفاتورة' : 'Invoice #'}</th>
                                    <th className="py-3 px-3">{isRTL ? 'الباقة / الخدمة' : 'Plan'}</th>
                                    <th className="py-3 px-3">{isRTL ? 'التاريخ' : 'Date'}</th>
                                    <th className="py-3 px-3">{isRTL ? 'المبلغ' : 'Amount'}</th>
                                    <th className="py-3 px-3">{isRTL ? 'الحالة' : 'Status'}</th>
                                    <th className="py-3 px-3 text-center">{isRTL ? 'الإجراء' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {invoices.map((inv) => {
                                    const isSuccess = inv.status === 'success';
                                    const isPending = inv.status === 'pending';
                                    const dateStr = new Date(inv.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });

                                    return (
                                        <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                                            <td className="py-3.5 px-3 font-mono font-bold text-zinc-300">
                                                #{inv.id.slice(0, 8)}
                                            </td>
                                            <td className="py-3.5 px-3 font-bold text-white">
                                                {BillingService.getPlanName(inv.tier_id, isRTL)}
                                            </td>
                                            <td className="py-3.5 px-3 text-zinc-400 font-medium">
                                                {dateStr}
                                            </td>
                                            <td className="py-3.5 px-3 font-black text-gold-400 font-mono">
                                                {BillingService.formatPrice(inv.amount, inv.currency, isRTL)}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    isSuccess
                                                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                                        : isPending
                                                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                                                        : 'bg-red-950/60 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {isSuccess ? (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    ) : isPending ? (
                                                        <Clock className="w-3 h-3" />
                                                    ) : (
                                                        <AlertCircle className="w-3 h-3" />
                                                    )}
                                                    {isSuccess ? (isRTL ? 'مدفوعة' : 'PAID') : inv.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <button
                                                    onClick={() => setSelectedInvoice(inv)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-gold-500/15 hover:border-gold-500/40 hover:text-gold-400 text-zinc-300 border border-zinc-800 font-bold text-xs transition-all cursor-pointer"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>{isRTL ? 'عرض الإيصال' : 'View Receipt'}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            <InvoiceReceiptModal
                isOpen={Boolean(selectedInvoice)}
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                isRTL={isRTL}
            />
        </div>
    );
};
