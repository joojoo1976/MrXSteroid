'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💳 MR. X STEROID - INSTAPAY RECEIPTS ADMIN SECTION                       ║
 * ║  Review queue for manual-transfer receipts: list, detail, verify/reject   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    Loader2,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Eye,
    Search,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react';
import { adminFetch } from './adminFetch';

type ReceiptStatus = 'pending_review' | 'under_review' | 'verified' | 'rejected' | 'expired';

interface PaymentReceipt {
    id: string;
    order_id: string | null;
    invoice_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    transaction_reference: string | null;
    payment_method: string;
    amount: number | string;
    currency: string;
    receipt_url: string | null;
    receipt_path: string | null;
    receipt_filename: string | null;
    receipt_mime_type: string | null;
    status: ReceiptStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
    pending_review: { label: 'في انتظار المراجعة', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
    under_review: { label: 'قيد المراجعة', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
    verified: { label: 'تم التأكيد', badge: 'bg-green-500/10 text-green-400 border-green-500/30', dot: 'bg-green-500' },
    rejected: { label: 'مرفوض', badge: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-500' },
    expired: { label: 'منتهي', badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30', dot: 'bg-zinc-500' },
};

const ALL_STATUSES: ReceiptStatus[] = ['pending_review', 'under_review', 'verified', 'rejected', 'expired'];

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));

const formatAmount = (amount: number | string, currency: string) =>
    `${Number(amount).toLocaleString()} ${currency === 'EGP' ? 'ج.م' : currency}`;

export const PaymentReceiptsSection: React.FC = () => {
    const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<ReceiptStatus | 'all'>('pending_review');
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<PaymentReceipt | null>(null);

    const load = useCallback(async (status?: ReceiptStatus | 'all') => {
        setLoading(true);
        setError('');
        const query = new URLSearchParams();
        if (status && status !== 'all') query.set('status', status);
        query.set('limit', '200');
        const res = await adminFetch<{ success: boolean; receipts: PaymentReceipt[] }>(
            `/api/admin/payment-receipts?${query.toString()}`
        );
        if (!res.ok || !res.data.success) {
            setError(res.error || 'تعذر تحميل الإيصالات');
            setReceipts([]);
        } else {
            setReceipts(res.data.receipts || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void load(filter);
    }, [filter, load]);

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return receipts;
        const q = searchTerm.toLowerCase();
        return receipts.filter(r =>
            [r.customer_name, r.customer_email, r.customer_phone, r.invoice_id, r.transaction_reference]
                .filter(Boolean)
                .some(v => String(v).toLowerCase().includes(q))
        );
    }, [receipts, searchTerm]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: receipts.length };
        for (const s of ALL_STATUSES) c[s] = receipts.filter(r => r.status === s).length;
        return c;
    }, [receipts]);

    const openReceipt = async (r: PaymentReceipt) => {
        const res = await adminFetch<{ success: boolean; url: string }>(
            `/api/admin/payment-receipts/${r.id}/receipt`
        );
        if (res.ok && res.data?.url) {
            window.open(res.data.url, '_blank', 'noopener');
        } else {
            alert('تعذر فتح الإيصال: ' + (res.error || 'Unknown error'));
        }
    };

    const handleUpdated = (updated: PaymentReceipt) => {
        setReceipts(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r)));
        setSelected(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gold-500" /> إيصالات إنستاباي
                        <span className="text-xs text-zinc-500">/ InstaPay Receipts</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-bold mt-1">
                        مراجعة إيصالات التحويل وتأكيدها (Activates order) أو رفضها (Cancels order)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث بالاسم / البريد / الرقم / الطلب..."
                            className="bg-black/60 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-gold-500 outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => load(filter)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-300"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> تحديث
                    </button>
                </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
                {(['all', ...ALL_STATUSES] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight border transition-all ${
                            filter === s
                                ? 'bg-gold-500/15 text-gold-400 border-gold-500/40'
                                : 'bg-zinc-800/40 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                        }`}
                    >
                        {STATUS_STYLES[s]?.label || 'الكل (All)'}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-black/40">{counts[s] ?? 0}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                    ⚠ {error}
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin text-gold-500 mb-2" />
                        <span className="text-xs font-bold">جارِ تحميل الإيصالات...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                        <Wallet className="w-8 h-8 mb-2 opacity-40" />
                        <span className="text-sm font-black">لا توجد إيصالات هنا</span>
                        <span className="text-xs mt-1">الطلبات الجديدة عبر إنستاباي ستظهر تلقائياً في قائمة الانتظار</span>
                    </div>
                ) : (
                    filtered.map(r => {
                        const style = STATUS_STYLES[r.status] || STATUS_STYLES.pending_review;
                        return (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-black text-white truncate">{r.customer_name}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-tight ${style.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                {style.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-zinc-500 font-bold">
                                            <span className="text-emerald-400 font-black">{formatAmount(r.amount, r.currency)}</span>
                                            <span>🧾 {r.invoice_id || r.order_id?.slice(0, 8) || '—'}</span>
                                            <span>📧 {r.customer_email || '—'}</span>
                                            <span>📱 {r.customer_phone || '—'}</span>
                                            {r.transaction_reference && <span className="font-mono">REF: {r.transaction_reference}</span>}
                                            <span>🕒 {formatDate(r.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openReceipt(r)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-bold text-zinc-300"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> الإيصال
                                        </button>
                                        <button
                                            onClick={() => setSelected(r)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-[11px] font-black text-gold-400"
                                        >
                                            مراجعة <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {selected && <ReviewModal receipt={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   REVIEW MODAL — verify / reject with notes & reason
   ════════════════════════════════════════════════════════════════════════ */
const ReviewModal: React.FC<{
    receipt: PaymentReceipt;
    onClose: () => void;
    onUpdated: (r: PaymentReceipt) => void;
}> = ({ receipt, onClose, onUpdated }) => {
    const [busy, setBusy] = useState(false);
    const [action, setAction] = useState<'verified' | 'rejected' | ''>('');
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const isTerminal = receipt.status === 'verified' || receipt.status === 'rejected' || receipt.status === 'expired';

    const submit = async () => {
        if (!action) return;
        if (action === 'rejected' && !reason.trim()) {
            setError('سبب الرفض مطلوب / Rejection reason is required');
            return;
        }
        setBusy(true);
        setError('');
        const res = await adminFetch<{ success: boolean; receipt: PaymentReceipt }>(
            `/api/admin/payment-receipts/${receipt.id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    status: action,
                    reviewNotes: notes.trim() || undefined,
                    rejectionReason: action === 'rejected' ? reason.trim() || undefined : undefined,
                }),
            }
        );
        setBusy(false);
        if (!res.ok || !res.data.success) {
            setError(res.error || 'فشلت العملية');
            return;
        }
        onUpdated(res.data.receipt);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-white">مراجعة الإيصال / Review Receipt</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg font-black">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold mb-4">
                    <Field label="العميل" value={receipt.customer_name} />
                    <Field label="المبلغ" value={formatAmount(receipt.amount, receipt.currency)} />
                    <Field label="البريد" value={receipt.customer_email || '—'} />
                    <Field label="الهاتف" value={receipt.customer_phone || '—'} />
                    <Field label="رقم الأمر" value={receipt.invoice_id || '—'} mono />
                    <Field label="المرجع" value={receipt.transaction_reference || '—'} mono />
                    <Field label="الملف" value={receipt.receipt_filename || '—'} />
                    <Field label="تاريخ الإرسال" value={formatDate(receipt.created_at)} />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => openReceiptPublic(receipt.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-600 text-[11px] font-black text-zinc-200 hover:bg-zinc-700"
                    >
                        <Eye className="w-3.5 h-3.5" /> عرض الإيصال
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-700 text-[10px] font-black text-zinc-400 uppercase">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> {receipt.status}
                    </span>
                </div>

                {/* Review notes */}
                <label className="block text-[11px] font-black text-zinc-400 uppercase mb-1">ملاحظات المراجعة / Review notes</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="أي ملاحظات تسجل في سجل التدقيق..."
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-gold-500 outline-none mb-3"
                />

                {/* Rejection reason */}
                {action === 'rejected' && (
                    <label className="block text-[11px] font-black text-red-400 uppercase mb-1">سبب الرفض (إجباري) / Rejection reason</label>
                )}
                {action === 'rejected' && (
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={2}
                        placeholder="المبلغ غير مطابق / إيصال غير واضح / رقم التحويل غير موجود..."
                        className="w-full bg-black/60 border border-red-500/40 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-red-500 outline-none mb-3"
                    />
                )}

                {error && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold mb-3">
                        ⚠ {error}
                    </div>
                )}

                {/* Action buttons */}
                {isTerminal ? (
                    <div className="text-center p-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-xs font-bold text-zinc-500">
                        هذا الإيصال في حالة نهائية ({receipt.status}) ولا يمكن تغييرها.
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                        <button
                            onClick={submit}
                            disabled={busy || action === ''}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                                action === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                    : action === 'verified'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                        >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : action === 'verified' ? <CheckCircle2 className="w-4 h-4" /> : action === 'rejected' ? <XCircle className="w-4 h-4" /> : null}
                            {action === 'verified' ? 'تأكيد الدفع (تفعيل الطلب)' : action === 'rejected' ? 'رفض الإيصال (إلغاء الطلب)' : 'اختر الإجراء أولاً'}
                        </button>
                    </div>
                )}

                {/* Select action first */}
                {!isTerminal && !action && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button onClick={() => setAction('verified')} className="flex-1 px-4 py-3 rounded-xl bg-green-500/15 border border-green-500/40 text-sm font-black text-green-400 hover:bg-green-500/25">
                            ✅ موافق عليه
                        </button>
                        <button onClick={() => setAction('rejected')} className="flex-1 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-sm font-black text-red-400 hover:bg-red-500/25">
                            ❌ مرفوض
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const openReceiptPublic = (id: string) => {
    void adminFetch<{ success: boolean; url: string }>(`/api/admin/payment-receipts/${id}/receipt`).then(res => {
        if (res.ok && res.data?.url) window.open(res.data.url, '_blank', 'noopener');
        else alert('تعذر فتح الإيصال: ' + (res.error || 'Unknown error'));
    });
};

const Field: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
    <div className="bg-black/40 rounded-xl p-2.5 border border-zinc-800">
        <div className="text-[10px] text-zinc-500 font-bold uppercase">{label}</div>
        <div className={`text-xs text-zinc-200 font-black mt-0.5 break-all ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
);

export default PaymentReceiptsSection;