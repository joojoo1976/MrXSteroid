'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { Users, Split, DollarSign, CheckCircle2, AlertTriangle, Play, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Beneficiary {
    id: string;
    name: string;
    email: string | null;
    role: string;
    payout_method: string;
    payout_details: Record<string, unknown>;
    is_active: boolean;
}

interface SplitRule {
    id: string;
    tier_id: string | null;
    beneficiary_id: string;
    share_type: 'percentage' | 'fixed';
    share_value: number;
    priority: number;
    is_active: boolean;
    beneficiary?: Beneficiary;
}

interface OrderSplit {
    id: string;
    invoice_id: string;
    beneficiary_id: string;
    gross_amount_minor: number;
    gateway_fee_minor: number;
    net_amount_minor: number;
    allocated_amount_minor: number;
    currency: string;
    status: string;
    created_at: string;
    beneficiary?: Beneficiary;
}

interface Payout {
    id: string;
    beneficiary_id: string;
    amount_minor: number;
    currency: string;
    payout_method: string;
    status: string;
    kashier_transfer_id: string | null;
    error_message: string | null;
    created_at: string;
    beneficiary?: Beneficiary;
}

export const RevenueSplitsManager: React.FC = () => {
    const [tab, setTab] = useState<'beneficiaries' | 'rules' | 'splits' | 'payouts'>('beneficiaries');
    const [loading, setLoading] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [rules, setRules] = useState<SplitRule[]>([]);
    const [splits, setSplits] = useState<OrderSplit[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [batchApproving, setBatchApproving] = useState(false);

    // Form state for new Beneficiary
    const [newBenName, setNewBenName] = useState('');
    const [newBenEmail, setNewBenEmail] = useState('');
    const [newBenRole, setNewBenRole] = useState<'author' | 'platform' | 'coach' | 'partner'>('author');
    const [newBenMethod, setNewBenMethod] = useState<'bank_account' | 'mobile_wallet' | 'card'>('mobile_wallet');
    const [newBenAccount, setNewBenAccount] = useState('');

    // Form state for new Rule
    const [ruleTier, setRuleTier] = useState('');
    const [ruleBenId, setRuleBenId] = useState('');
    const [ruleType, setRuleType] = useState<'percentage' | 'fixed'>('percentage');
    const [ruleValue, setRuleValue] = useState('70');
    const [rulePriority, setRulePriority] = useState('0');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [bRes, rRes, sRes, pRes] = await Promise.all([
                supabase.from('beneficiaries').select('*').order('created_at', { ascending: false }),
                supabase.from('split_rules').select('*, beneficiary:beneficiaries(*)').order('priority', { ascending: false }),
                supabase.from('order_splits').select('*, beneficiary:beneficiaries(*)').order('created_at', { ascending: false }).limit(50),
                supabase.from('payouts').select('*, beneficiary:beneficiaries(*)').order('created_at', { ascending: false }).limit(50),
            ]);

            if (bRes.data) setBeneficiaries(bRes.data as Beneficiary[]);
            if (rRes.data) setRules(rRes.data as SplitRule[]);
            if (sRes.data) setSplits(sRes.data as OrderSplit[]);
            if (pRes.data) setPayouts(pRes.data as Payout[]);
        } catch (err) {
            console.error('Failed to load revenue split data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBenName.trim()) return toast.error('Beneficiary name is required');

        const { error } = await supabase.from('beneficiaries').insert({
            name: newBenName.trim(),
            email: newBenEmail.trim() || null,
            role: newBenRole,
            payout_method: newBenMethod,
            payout_details: { destination: newBenAccount.trim() },
        });

        if (error) {
            toast.error(`Failed to add beneficiary: ${error.message}`);
        } else {
            toast.success('Beneficiary created');
            setNewBenName('');
            setNewBenEmail('');
            setNewBenAccount('');
            loadData();
        }
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ruleBenId) return toast.error('Select a beneficiary');

        const { error } = await supabase.from('split_rules').insert({
            tier_id: ruleTier.trim() || null,
            beneficiary_id: ruleBenId,
            share_type: ruleType,
            share_value: parseFloat(ruleValue) || 0,
            priority: parseInt(rulePriority, 10) || 0,
        });

        if (error) {
            toast.error(`Failed to add rule: ${error.message}`);
        } else {
            toast.success('Split rule created');
            loadData();
        }
    };

    const handleApproveBatch = async () => {
        const queuedSplits = splits.filter(s => s.status === 'queued');
        if (queuedSplits.length === 0) {
            return toast.info('No queued splits ready for payout approval');
        }

        setBatchApproving(true);
        try {
            // Group by beneficiary
            const groups: Record<string, { amountMinor: number; currency: string; method: string }> = {};
            for (const s of queuedSplits) {
                const bId = s.beneficiary_id;
                const bMethod = s.beneficiary?.payout_method || 'mobile_wallet';
                if (!groups[bId]) {
                    groups[bId] = { amountMinor: 0, currency: s.currency, method: bMethod };
                }
                groups[bId].amountMinor += s.allocated_amount_minor;
            }

            // Create queued payouts and mark splits
            for (const [beneficiaryId, g] of Object.entries(groups)) {
                const { data: payout, error: pErr } = await supabase
                    .from('payouts')
                    .insert({
                        beneficiary_id: beneficiaryId,
                        amount_minor: g.amountMinor,
                        currency: g.currency,
                        payout_method: g.method,
                        status: 'completed', // Simulation in v1
                        kashier_transfer_id: `SIM-${Date.now()}`,
                    })
                    .select('id')
                    .single();

                if (!pErr && payout) {
                    await supabase
                        .from('order_splits')
                        .update({ status: 'paid', payout_id: payout.id })
                        .eq('beneficiary_id', beneficiaryId)
                        .eq('status', 'queued');
                }
            }

            toast.success(`Batch approved: disbursed ${Object.keys(groups).length} payout(s)`);
            loadData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(`Batch approval error: ${msg}`);
        } finally {
            setBatchApproving(false);
        }
    };

    const tabCls = (active: boolean) =>
        `px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
            active ? 'bg-gold-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
        }`;

    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                        <Split className="w-4 h-4 text-gold-500" />
                        Revenue Splits & Payouts Engine (v3.1)
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-bold mt-0.5">
                        Integer Minor Units · Largest-Remainder · Frozen Snapshots · Manual Batch Approval
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setTab('beneficiaries')} className={tabCls(tab === 'beneficiaries')}>
                    Beneficiaries ({beneficiaries.length})
                </button>
                <button onClick={() => setTab('rules')} className={tabCls(tab === 'rules')}>
                    Split Rules ({rules.length})
                </button>
                <button onClick={() => setTab('splits')} className={tabCls(tab === 'splits')}>
                    Order Splits ({splits.length})
                </button>
                <button onClick={() => setTab('payouts')} className={tabCls(tab === 'payouts')}>
                    Payouts Queue ({payouts.length})
                </button>
            </div>

            {/* TAB: Beneficiaries */}
            {tab === 'beneficiaries' && (
                <div className="space-y-4 pt-1">
                    <form onSubmit={handleCreateBeneficiary} className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 bg-black/40 border border-zinc-800/80 p-3 rounded-xl">
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Name</label>
                            <input
                                value={newBenName}
                                onChange={e => setNewBenName(e.target.value)}
                                placeholder="George Mourice"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Role</label>
                            <select
                                value={newBenRole}
                                onChange={e => setNewBenRole(e.target.value as any)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            >
                                <option value="author">Author</option>
                                <option value="platform">Platform</option>
                                <option value="coach">Coach</option>
                                <option value="partner">Partner</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Payout Method</label>
                            <select
                                value={newBenMethod}
                                onChange={e => setNewBenMethod(e.target.value as any)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            >
                                <option value="mobile_wallet">Mobile Wallet</option>
                                <option value="bank_account">Bank Account</option>
                                <option value="card">Card / Token</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Account / Wallet Number (Secured)</label>
                            <input
                                value={newBenAccount}
                                onChange={e => setNewBenAccount(e.target.value)}
                                placeholder="010XXXXXXXX or IBAN"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-1.5 rounded-lg bg-gold-500 text-black font-black text-xs hover:bg-gold-400 transition-all"
                            >
                                Add Beneficiary
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800 text-left">
                                    <th className="py-2 px-3">Beneficiary</th>
                                    <th className="py-2 px-3">Role</th>
                                    <th className="py-2 px-3">Method</th>
                                    <th className="py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {beneficiaries.map(b => (
                                    <tr key={b.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/20">
                                        <td className="py-2 px-3 font-bold text-white">{b.name}</td>
                                        <td className="py-2 px-3 text-zinc-400 uppercase text-[10px] font-bold">{b.role}</td>
                                        <td className="py-2 px-3 text-zinc-400 uppercase text-[10px]">{b.payout_method}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${b.is_active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {b.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {beneficiaries.length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-zinc-600">No beneficiaries configured</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Rules */}
            {tab === 'rules' && (
                <div className="space-y-4 pt-1">
                    <form onSubmit={handleCreateRule} className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 border border-zinc-800/80 p-3 rounded-xl">
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Tier / Product (Optional)</label>
                            <input
                                value={ruleTier}
                                onChange={e => setRuleTier(e.target.value)}
                                placeholder="digital, bundle, or blank for all"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Beneficiary</label>
                            <select
                                value={ruleBenId}
                                onChange={e => setRuleBenId(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                            >
                                <option value="">Select Beneficiary...</option>
                                {beneficiaries.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.role})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Type & Value</label>
                            <div className="flex gap-1">
                                <select
                                    value={ruleType}
                                    onChange={e => setRuleType(e.target.value as any)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                                >
                                    <option value="percentage">%</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ruleValue}
                                    onChange={e => setRuleValue(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-1.5 rounded-lg bg-gold-500 text-black font-black text-xs hover:bg-gold-400 transition-all"
                            >
                                Add Rule
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800 text-left">
                                    <th className="py-2 px-3">Tier</th>
                                    <th className="py-2 px-3">Beneficiary</th>
                                    <th className="py-2 px-3">Share</th>
                                    <th className="py-2 px-3">Priority</th>
                                    <th className="py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map(r => (
                                    <tr key={r.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/20">
                                        <td className="py-2 px-3 font-mono text-zinc-300">{r.tier_id || 'Global'}</td>
                                        <td className="py-2 px-3 font-bold text-white">{r.beneficiary?.name || r.beneficiary_id}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-gold-500">
                                            {r.share_type === 'percentage' ? `${r.share_value}%` : `${(r.share_value / 100).toFixed(2)} fixed`}
                                        </td>
                                        <td className="py-2 px-3 text-zinc-400">{r.priority}</td>
                                        <td className="py-2 px-3">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-green-500/10 text-green-400">Active</span>
                                        </td>
                                    </tr>
                                ))}
                                {rules.length === 0 && (
                                    <tr><td colSpan={5} className="p-4 text-center text-zinc-600">No split rules configured</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Order Splits Browser */}
            {tab === 'splits' && (
                <div className="space-y-3 pt-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800 text-left">
                                    <th className="py-2 px-3">Invoice</th>
                                    <th className="py-2 px-3">Beneficiary</th>
                                    <th className="py-2 px-3">Net (Minor)</th>
                                    <th className="py-2 px-3">Allocated</th>
                                    <th className="py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {splits.map(s => (
                                    <tr key={s.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/20">
                                        <td className="py-2 px-3 font-mono text-[11px] text-zinc-300">#{s.invoice_id?.slice(0, 8)}</td>
                                        <td className="py-2 px-3 font-bold text-white">{s.beneficiary?.name || s.beneficiary_id}</td>
                                        <td className="py-2 px-3 font-mono text-zinc-400">{(s.net_amount_minor / 100).toFixed(2)} {s.currency}</td>
                                        <td className="py-2 px-3 font-mono font-black text-gold-500">{(s.allocated_amount_minor / 100).toFixed(2)} {s.currency}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${s.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-gold-500/10 text-gold-400'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {splits.length === 0 && (
                                    <tr><td colSpan={5} className="p-4 text-center text-zinc-600">No frozen order splits recorded</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Payouts Queue & Manual Batch Approval */}
            {tab === 'payouts' && (
                <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between p-3 bg-gold-500/5 border border-gold-500/20 rounded-xl">
                        <div>
                            <p className="text-xs font-black text-gold-400 uppercase">Manual Batch Approval (v1 Enforced)</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                Review eligible queued splits and execute transfer batch safely.
                            </p>
                        </div>
                        <button
                            onClick={handleApproveBatch}
                            disabled={batchApproving || splits.filter(s => s.status === 'queued').length === 0}
                            className="px-4 py-2 rounded-xl bg-gold-500 text-black font-black text-xs hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {batchApproving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <Play className="w-3 h-3 fill-current" />
                            Approve Batch
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-zinc-500 uppercase text-[10px] border-b border-zinc-800 text-left">
                                    <th className="py-2 px-3">Payout ID</th>
                                    <th className="py-2 px-3">Beneficiary</th>
                                    <th className="py-2 px-3">Amount</th>
                                    <th className="py-2 px-3">Method</th>
                                    <th className="py-2 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(p => (
                                    <tr key={p.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/20">
                                        <td className="py-2 px-3 font-mono text-[11px] text-zinc-400">#{p.id.slice(0, 8)}</td>
                                        <td className="py-2 px-3 font-bold text-white">{p.beneficiary?.name || p.beneficiary_id}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-gold-500">{(p.amount_minor / 100).toFixed(2)} {p.currency}</td>
                                        <td className="py-2 px-3 uppercase text-[10px] text-zinc-400">{p.payout_method}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.status === 'completed' ? 'bg-green-500/10 text-green-400' : p.status === 'queued' ? 'bg-gold-500/10 text-gold-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr><td colSpan={5} className="p-4 text-center text-zinc-600">No payouts executed yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
