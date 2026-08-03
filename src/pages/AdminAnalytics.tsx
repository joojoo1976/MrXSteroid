import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../shared/lib/supabase';
import { Database } from '@/shared/types/db_types';
import { Card, CardContent } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import {
    BarChart3,
    Wallet,
    Clock,
    CreditCard,
    Smartphone,
    Send,
    Users,
    Shield,
    Loader2,
    RefreshCw,
    DollarSign,
    CheckCircle2,
    XCircle,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileRole = Profile['role'];

const fmtCurrency = (amount: number, currency: string) => {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
        return `${currency} ${amount}`;
    }
};

const AdminAnalytics: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [invRes, profRes] = await Promise.all([
                supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(200),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(300),
            ]);
            if (invRes.error) console.warn('[AdminAnalytics] Invoices error:', invRes.error.message);
            if (profRes.error) console.warn('[AdminAnalytics] Profiles error:', profRes.error.message);
            setInvoices((invRes.data || []) as Invoice[]);
            setProfiles((profRes.data || []) as Profile[]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = useMemo(() => {
        const success = invoices.filter(i => i.status === 'success');
        const pending = invoices.filter(i => i.status === 'pending' || i.status === 'open');
        const failed = invoices.filter(i => i.status === 'failed');

        const usdRevenue = success.filter(i => i.currency === 'USD').reduce((sum, i) => sum + Number(i.amount || 0), 0);
        const egpRevenue = success.filter(i => i.currency === 'EGP').reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const gateways: Record<string, { count: number; revenue: number; currency: string }> = {};
        invoices.forEach(inv => {
            const g = inv.gateway || 'unknown';
            gateways[g] = gateways[g] || { count: 0, revenue: 0, currency: inv.currency };
            if (inv.status === 'success') {
                gateways[g].count += 1;
                gateways[g].revenue += Number(inv.amount || 0);
            }
        });

        const tierCounts: Record<string, number> = {};
        success.forEach(inv => {
            tierCounts[inv.tier_id] = (tierCounts[inv.tier_id] || 0) + 1;
        });

        return {
            successCount: success.length,
            pendingCount: pending.length,
            failedCount: failed.length,
            totalInvoices: invoices.length,
            usdRevenue,
            egpRevenue,
            gateways,
            tierCounts,
        };
    }, [invoices]);

    const updateUser = async (id: string, patch: { role?: ProfileRole; has_paid?: boolean; subscription_status?: string; subscription_tier?: string }) => {
        setUpdating(id);
        const { error } = await supabase.from('profiles').update(patch as Partial<Profile>).eq('id', id);
        setUpdating(null);
        if (error) {
            toast.error('Update failed: ' + error.message);
            return;
        }
        setProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...patch } as Profile : p)));
        toast.success('User updated');
    };

    const gatewayMeta = {
        stripe: { icon: CreditCard, label: 'Stripe', color: 'text-indigo-400' },
        paymob: { icon: Smartphone, label: 'Paymob', color: 'text-emerald-400' },
        spaceremit: { icon: Send, label: 'SpaceRemit', color: 'text-sky-400' },
    };

    if (loading) {
        return <div className="p-20 text-center font-black text-gold-500 animate-pulse">LOADING ADMIN ANALYTICS...</div>;
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <BarChart3 className="w-10 h-10 text-gold-500" /> Admin Analytics
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">
                        Sales Intelligence · Stripe · Paymob · SpaceRemit
                    </p>
                </div>
                <Button variant="outline" className="border-zinc-800 text-zinc-400" onClick={loadData}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </header>

            {/* ── Revenue & Sales Stats ──────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                            <DollarSign className="w-4 h-4 text-gold-500" /> USD Revenue
                        </div>
                        <p className="text-3xl font-black text-white">{fmtCurrency(stats.usdRevenue, 'USD')}</p>
                        <p className="text-xs text-zinc-500 font-bold">{stats.successCount} successful sales</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                            <Wallet className="w-4 h-4 text-emerald-400" /> EGP Revenue
                        </div>
                        <p className="text-3xl font-black text-white">{fmtCurrency(stats.egpRevenue, 'EGP')}</p>
                        <p className="text-xs text-zinc-500 font-bold">Egypt gateway volume</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                            <CheckCircle2 className="w-4 h-4 text-green-400" /> Completed
                        </div>
                        <p className="text-3xl font-black text-white">{stats.successCount}</p>
                        <p className="text-xs text-zinc-500 font-bold">of {stats.totalInvoices} total invoices</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase">
                            <Clock className="w-4 h-4 text-amber-400" /> Pending
                        </div>
                        <p className="text-3xl font-black text-white">{stats.pendingCount}</p>
                        <p className="text-xs text-zinc-500 font-bold">{stats.failedCount} failed</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Gateway Breakdown ──────────────────────────────────────── */}
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(gatewayMeta).map(([key, meta]) => {
                    const g = stats.gateways[key];
                    const Icon = meta.icon;
                    return (
                        <Card key={key} className="bg-zinc-900/80 border-zinc-800">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                                            <Icon className={`w-5 h-5 ${meta.color}`} />
                                        </div>
                                        <p className="font-black text-white">{meta.label}</p>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-bold">{key.toUpperCase()}</span>
                                </div>
                                <p className="text-2xl font-black text-white">{g ? fmtCurrency(g.revenue, g.currency) : '—'}</p>
                                <p className="text-xs text-zinc-500 font-bold">{g ? g.count : 0} successful transactions</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ── Recent Invoices ────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-500" />
                    <h2 className="text-xl font-black text-white uppercase">Recent Invoices</h2>
                </div>
                <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Gateway</th>
                                        <th className="p-4">Tier</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.slice(0, 15).map(inv => (
                                        <tr key={inv.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                            <td className="p-4 text-zinc-400 font-mono text-xs">{inv.id.slice(0, 8)}</td>
                                            <td className="p-4">
                                                <span className="text-xs font-bold text-white uppercase">{inv.gateway}</span>
                                            </td>
                                            <td className="p-4 text-xs text-zinc-400 font-bold">{inv.tier_id}</td>
                                            <td className="p-4 text-xs text-white font-bold">{fmtCurrency(Number(inv.amount || 0), inv.currency)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${inv.status === 'success'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : inv.status === 'failed'
                                                            ? 'bg-red-500/10 text-red-400'
                                                            : 'bg-amber-500/10 text-amber-400'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-zinc-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {invoices.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm font-bold">No invoices found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── User Management ────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gold-500" />
                        <h2 className="text-xl font-black text-white uppercase">User Management</h2>
                    </div>
                    <span className="text-xs text-zinc-500 font-bold">{profiles.length} accounts</span>
                </div>

                <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Subscription</th>
                                        <th className="p-4">Premium Access</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiles.map(p => (
                                        <tr key={p.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-zinc-950 border border-gold-500/30 flex items-center justify-center">
                                                        <Shield className="w-4 h-4 text-gold-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-white truncate">{p.full_name || '—'}</p>
                                                        <p className="text-xs text-zinc-500 truncate">{p.email || p.user_name || p.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    title="Role"
                                                    value={p.role || 'user'}
                                                    onChange={e => updateUser(p.id, { role: e.target.value as ProfileRole })}
                                                    className="bg-black border border-zinc-800 rounded text-xs text-white p-1.5"
                                                >
                                                    <option value="user">user</option>
                                                    <option value="delegate">delegate</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${p.subscription_status === 'active'
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-zinc-800 text-zinc-500'
                                                        }`}>
                                                        {p.subscription_status || 'none'}
                                                    </span>
                                                    <p className="text-[10px] text-zinc-500 font-bold">{p.subscription_tier || '—'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => updateUser(p.id, { has_paid: !p.has_paid })}
                                                    disabled={updating === p.id}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all border ${p.has_paid
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                                        }`}
                                                >
                                                    {updating === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.has_paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                    {p.has_paid ? 'Active' : 'Free'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {profiles.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-zinc-500 text-sm font-bold">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalytics;
