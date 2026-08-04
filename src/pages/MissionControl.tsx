import React, { useMemo, useState } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Mail,
    Map,
    Settings,
    Search,
    Bell,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Package,
    Wallet,
    Clock,
    DollarSign,
    TrendingUp,
    ShieldCheck,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    PieChart,
    Pie,
    Legend,
} from 'recharts';
import { toast } from 'sonner';
import { supabase } from '../shared/lib/supabase';
import { useAdminData, fmtCurrency, timeAgo, Order, ContactMessage, Profile } from '../features/admin/useAdminData';
import { usePreferences } from '../context/PreferencesContext';

type SectionKey = 'overview' | 'orders' | 'customers' | 'messages' | 'logistics' | 'settings';

const GATEWAY_COLORS: Record<string, string> = {
    stripe: '#6366f1',
    paymob: '#10b981',
    spaceremit: '#0ea5e9',
};

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'messages', label: 'Messages', icon: Mail },
    { key: 'logistics', label: 'Logistics', icon: Map },
    { key: 'settings', label: 'Settings', icon: Settings },
];

const MissionControl: React.FC = () => {
    const { isRTL } = usePreferences();
    const [section, setSection] = useState<SectionKey>('overview');
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const data = useAdminData();

    const navClass = (active: boolean) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            active ? 'bg-gold-500/10 text-gold-500 border border-gold-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
        }`;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 border-e border-zinc-800 bg-zinc-950/60 backdrop-blur-xl sticky top-0 h-screen flex flex-col transition-all duration-300`}>
                <div className={`flex items-center gap-3 p-5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-black" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="font-black text-sm tracking-tight text-white leading-none">MISSION CONTROL</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Mr. X Steroid</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            title={s.label}
                            className={`w-full ${navClass(section === s.key)} ${collapsed ? 'justify-center' : ''}`}
                        >
                            <s.icon className="w-4.5 h-4.5 shrink-0" />
                            {!collapsed && <span>{s.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-zinc-800/60">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-all"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        {!collapsed && <span>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800 px-6 py-3 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Omni-search orders, customers, messages..."
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl ps-10 pe-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-gold-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex-1" />
                    <button className="relative p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all">
                        <Bell className="w-4.5 h-4.5" />
                        <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
                    </button>
                    <button
                        onClick={data.refresh}
                        disabled={data.refreshing}
                        className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4.5 h-4.5 ${data.refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-3 ps-3 border-s border-zinc-800">
                        <div className="w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 text-sm font-black">A</div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-black text-white leading-none">Admin</p>
                            <p className="text-[9px] text-zinc-500 font-bold mt-1">Root Clearance</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {data.loading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                            <p className="text-sm font-black text-zinc-500 uppercase tracking-widest animate-pulse">Synchronizing Global Assets...</p>
                        </div>
                    ) : (
                        <SectionRenderer
                            section={section}
                            search={search}
                            data={data}
                            onRefresh={data.refresh}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   SECTION RENDERER
   ════════════════════════════════════════════════════════════════════════ */
interface SectionRendererProps {
    section: SectionKey;
    search: string;
    data: ReturnType<typeof useAdminData>;
    onRefresh: () => void;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, search, data, onRefresh }) => {
    switch (section) {
        case 'overview': return <OverviewSection data={data} search={search} />;
        case 'orders': return <OrdersSection data={data} search={search} />;
        case 'customers': return <CustomersSection data={data} search={search} />;
        case 'messages': return <MessagesSection data={data} search={search} onRefresh={onRefresh} />;
        case 'logistics': return <LogisticsSection data={data} />;
        case 'settings': return <SettingsSection data={data} />;
        default: return null;
    }
};

/* ════════════════════════════════════════════════════════════════════════
   OVERVIEW
   ════════════════════════════════════════════════════════════════════════ */
const OverviewSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string }> = ({ data }) => {
    const { invoices, orders, messages, profiles } = data;

    const stats = useMemo(() => {
        const success = invoices.filter(i => i.status === 'success');
        const pending = invoices.filter(i => i.status === 'pending' || i.status === 'open');
        const failed = invoices.filter(i => i.status === 'failed');
        const usdRevenue = success.filter(i => i.currency === 'USD').reduce((s, i) => s + Number(i.amount || 0), 0);
        const egpRevenue = success.filter(i => i.currency === 'EGP').reduce((s, i) => s + Number(i.amount || 0), 0);

        const gatewayStats: Record<string, { count: number; revenue: number; currency: string }> = {};
        success.forEach(inv => {
            const g = inv.gateway || 'unknown';
            gatewayStats[g] = gatewayStats[g] || { count: 0, revenue: 0, currency: inv.currency };
            gatewayStats[g].count += 1;
            gatewayStats[g].revenue += Number(inv.amount || 0);
        });

        // 30-day revenue series
        const days: { date: string; revenue: number }[] = [];
        for (let d = 29; d >= 0; d--) {
            const dt = new Date();
            dt.setDate(dt.getDate() - d);
            const key = dt.toISOString().slice(0, 10);
            days.push({ date: key, revenue: 0 });
        }
        success.forEach(inv => {
            const key = new Date(inv.created_at).toISOString().slice(0, 10);
            const idx = days.findIndex(x => x.date === key);
            if (idx >= 0) days[idx].revenue += Number(inv.amount || 0);
        });

        const unhandledMessages = messages.filter(m => !m.handled).length;
        const activeDelegates = data.delegates.filter(d => d.status === 'active').length;

        return { success, pending, failed, usdRevenue, egpRevenue, gatewayStats, days, unhandledMessages, activeDelegates, totalOrders: orders.length, totalUsers: profiles.length };
    }, [invoices, orders, messages, profiles, data.delegates]);

    const pieData = Object.entries(stats.gatewayStats).map(([k, v]) => ({ name: k, value: v.count, revenue: v.revenue }));

    const recentActivity = [
        ...orders.slice(0, 5).map(o => ({ kind: 'order', title: `New order #${o.id.slice(0, 8)}`, sub: `${o.fullName} · ${fmtCurrency(Number(o.amount || 0), 'USD')}`, time: o.created_at })),
        ...messages.slice(0, 5).map(m => ({ kind: 'message', title: `Message from ${m.operator_name}`, sub: m.subject, time: m.created_at })),
        ...profiles.slice(0, 4).map(p => ({ kind: 'user', title: `New user ${p.full_name || p.email || ''}`, sub: p.email || '', time: p.created_at })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Mission Overview</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Real-time commerce intelligence</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={DollarSign} label="USD Revenue" value={fmtCurrency(stats.usdRevenue, 'USD')} sub={`${stats.success.length} sales`} tone="gold" />
                <KpiCard icon={Wallet} label="EGP Revenue" value={fmtCurrency(stats.egpRevenue, 'EGP')} sub="Egypt volume" tone="emerald" />
                <KpiCard icon={Clock} label="Pending" value={String(stats.pending.length)} sub={`${stats.failed.length} failed`} tone="amber" />
                <KpiCard icon={Mail} label="Unread Messages" value={String(stats.unhandledMessages)} sub={`${stats.totalOrders} orders`} tone="rose" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-white uppercase text-sm tracking-wide">Revenue (30 days)</h3>
                        <TrendingUp className="w-4 h-4 text-gold-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={stats.days}>
                            <defs>
                                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: '#71717a', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fill="url(#rev)" name="Revenue" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Gateway donut */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <h3 className="font-black text-white uppercase text-sm tracking-wide">Sales by Gateway</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={GATEWAY_COLORS[entry.name] || '#71717a'} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                            <Legend formatter={(v) => <span style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 700 }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent activity + status */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="font-black text-white uppercase text-sm tracking-wide mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                        {recentActivity.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${a.kind === 'order' ? 'bg-gold-500' : a.kind === 'message' ? 'bg-sky-400' : 'bg-emerald-400'}`}></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate">{a.title}</p>
                                    <p className="text-xs text-zinc-500 truncate">{a.sub}</p>
                                </div>
                                <span className="text-[10px] text-zinc-600 font-bold shrink-0">{timeAgo(a.time)}</span>
                            </div>
                        ))}
                        {recentActivity.length === 0 && <p className="text-sm text-zinc-600 font-bold text-center py-8">No recent activity</p>}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
                        <h3 className="font-black text-white uppercase text-sm tracking-wide mb-3">Order Status</h3>
                        <div className="space-y-2">
                            {['pending', 'success', 'failed'].map(s => {
                                const n = orders.filter(o => o.status === s).length;
                                const pct = orders.length ? Math.round((n / orders.length) * 100) : 0;
                                return (
                                    <div key={s}>
                                        <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1 uppercase"><span>{s}</span><span>{n} · {pct}%</span></div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${s === 'success' ? 'bg-emerald-500' : s === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 grid grid-cols-2 gap-4">
                        <div><p className="text-[10px] font-black text-zinc-500 uppercase">Total Users</p><p className="text-2xl font-black text-white">{stats.totalUsers}</p></div>
                        <div><p className="text-[10px] font-black text-zinc-500 uppercase">Active Delegates</p><p className="text-2xl font-black text-white">{stats.activeDelegates}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ icon: React.ElementType; label: string; value: string; sub: string; tone: string }> = ({ icon: Icon, label, value, sub, tone }) => {
    const toneCls: Record<string, string> = {
        gold: 'text-gold-500 bg-gold-500/10 border-gold-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };
    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3 transition-all hover:border-gold-500/30">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
                <div className={`p-2 rounded-lg border ${toneCls[tone] || toneCls.gold}`}><Icon className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-zinc-500 font-bold">{sub}</p>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   ORDERS
   ════════════════════════════════════════════════════════════════════════ */
const ORDER_STATUSES = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrdersSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string }> = ({ data, search }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [editing, setEditing] = useState<Order | null>(null);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        let list = data.orders;
        if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(o =>
                o.fullName?.toLowerCase().includes(q) ||
                o.email?.toLowerCase().includes(q) ||
                o.id?.toLowerCase().includes(q) ||
                o.transaction_id?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [data.orders, statusFilter, search]);

    const updateStatus = async (order: Order, nextStatus: string) => {
        setSaving(true);
        const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', order.id);
        setSaving(false);
        if (error) return toast.error('Update failed: ' + error.message);
        toast.success('Order updated');
        data.refresh();
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-end gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Orders</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{filtered.length} orders</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold-500 outline-none">
                        <option value="all">All statuses</option>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                <th className="p-4">Order</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Tier</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 50).map(o => (
                                <tr key={o.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                    <td className="p-4 font-mono text-xs text-zinc-400">#{o.id.slice(0, 8)}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-white">{o.fullName}</p>
                                        <p className="text-xs text-zinc-500">{o.email}</p>
                                    </td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold uppercase">{o.tier}</td>
                                    <td className="p-4 text-xs text-white font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                            o.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                            o.status === 'cancelled' || o.status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                                            o.status === 'shipped' || o.status === 'confirmed' ? 'bg-sky-500/10 text-sky-400' :
                                            'bg-amber-500/10 text-amber-400'
                                        }`}>{o.status}</span>
                                    </td>
                                    <td className="p-4 text-xs text-zinc-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setEditing(o)}
                                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all"
                                        >Manage</button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-zinc-600 text-sm font-bold">No orders found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail / manage drawer */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-end">
                    <div className="w-full max-w-lg h-full bg-zinc-950 border-s border-zinc-800 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-white uppercase text-lg">Order #{editing.id.slice(0, 8)}</h2>
                            <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">Customer</p>
                                <p className="text-white font-bold">{editing.fullName}</p>
                                <p className="text-sm text-zinc-400">{editing.email}</p>
                                <p className="text-xs text-zinc-500">{editing.address}, {editing.city}, {editing.country}</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">Order</p>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Tier</span><span className="text-white font-bold uppercase">{editing.tier}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Amount</span><span className="text-white font-bold">{fmtCurrency(Number(editing.amount || 0), 'USD')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Transaction</span><span className="text-zinc-400 font-mono text-xs">{editing.transaction_id || '—'}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">Shipping</span><span className="text-zinc-400 font-bold uppercase">{editing.shipping_provider || '—'}</span></div>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-3">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">Update Status</p>
                                <select
                                    value={editing.status}
                                    onChange={e => updateStatus(editing, e.target.value)}
                                    disabled={saving}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:border-gold-500 outline-none disabled:opacity-50"
                                >
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <input
                                    defaultValue={editing.shipping_provider || ''}
                                    placeholder="Tracking number / shipping provider"
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none"
                                />
                            </div>

                            <button onClick={() => setEditing(null)} className="w-full py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   CUSTOMERS (CRM)
   ════════════════════════════════════════════════════════════════════════ */
const CustomersSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string }> = ({ data, search }) => {
    const [selected, setSelected] = useState<Profile | null>(null);

    const enriched = useMemo(() => {
        const success = data.invoices.filter(i => i.status === 'success');
        let list = data.profiles.map(p => {
            const invs = success.filter(i => i.user_id === p.id);
            const spend = invs.reduce((s, i) => s + Number(i.amount || 0), 0);
            const orderCount = data.orders.filter(o => o.email === p.email).length;
            const total = invs.length;
            return { ...p, spend, total, orderCount };
        });
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                (p.full_name || '').toLowerCase().includes(q) ||
                (p.email || '').toLowerCase().includes(q) ||
                (p.user_name || '').toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) => b.spend - a.spend);
    }, [data.profiles, data.invoices, data.orders, search]);

    const selectedOrders = useMemo(() => {
        if (!selected) return [];
        return data.orders.filter(o => o.email === selected.email);
    }, [selected, data.orders]);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Customers</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{enriched.length} accounts</p>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                <th className="p-4">Customer</th>
                                <th className="p-4">Total Spent</th>
                                <th className="p-4">Purchases</th>
                                <th className="p-4">Orders</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enriched.slice(0, 50).map(p => (
                                <tr key={p.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{p.full_name || p.user_name || '—'}</p>
                                        <p className="text-xs text-zinc-500">{p.email || p.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="p-4 text-white font-bold">{fmtCurrency(p.spend, 'USD')}</td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{p.total}</td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{p.orderCount}</td>
                                    <td className="p-4 text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => setSelected(p)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">Profile</button>
                                    </td>
                                </tr>
                            ))}
                            {enriched.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-zinc-600 text-sm font-bold">No customers found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-end">
                    <div className="w-full max-w-lg h-full bg-zinc-950 border-s border-zinc-800 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-white uppercase text-lg">Customer Profile</h2>
                            <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-1">
                                <p className="text-white font-black text-lg">{selected.full_name || '—'}</p>
                                <p className="text-sm text-zinc-400">{selected.email || '—'}</p>
                                <p className="text-xs text-zinc-500">Role: <span className="text-gold-500 font-bold uppercase">{selected.role}</span></p>
                                <p className="text-xs text-zinc-500">Sub: <span className="text-emerald-400 font-bold uppercase">{selected.subscription_status || 'none'}</span> · {selected.subscription_tier || '—'}</p>
                                <p className="text-xs text-zinc-500">Premium: {selected.has_paid ? <span className="text-green-400 font-bold">Active</span> : <span className="text-zinc-600">Free</span>}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Order History ({selectedOrders.length})</p>
                                {selectedOrders.map(o => (
                                    <div key={o.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold text-white">#{o.id.slice(0, 8)} · {o.tier}</p>
                                            <p className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</span>
                                    </div>
                                ))}
                                {selectedOrders.length === 0 && <p className="text-sm text-zinc-600 font-bold text-center py-6">No orders for this customer</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   MESSAGES (Contact Center)
   ════════════════════════════════════════════════════════════════════════ */
const MessagesSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; onRefresh: () => void }> = ({ data, search, onRefresh }) => {
    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [busy, setBusy] = useState(false);

    const filtered = useMemo(() => {
        let list = data.messages;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                m.operator_name?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q) ||
                m.subject?.toLowerCase().includes(q) ||
                m.mission_type?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [data.messages, search]);

    const toggleHandled = async (m: ContactMessage) => {
        setBusy(true);
        const { error } = await supabase.from('contact_messages').update({ handled: !m.handled }).eq('id', m.id);
        setBusy(false);
        if (error) return toast.error('Update failed: ' + error.message);
        if (selected?.id === m.id) setSelected({ ...m, handled: !m.handled });
        toast.success(m.handled ? 'Marked as unread' : 'Marked as handled');
        onRefresh();
    };

    const deleteMessage = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error('Delete failed: ' + error.message);
        toast.success('Message deleted');
        setSelected(null);
        onRefresh();
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Contact Center</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{filtered.filter(m => !m.handled).length} unread of {filtered.length}</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                    <th className="p-4">From</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Subject</th>
                                    <th className="p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice(0, 40).map(m => (
                                    <tr key={m.id} onClick={() => setSelected(m)} className={`border-b border-zinc-800/60 last:border-0 cursor-pointer transition-colors ${m.handled ? '' : 'bg-gold-500/[0.03] hover:bg-zinc-950/40'} hover:bg-zinc-950/40`}>
                                        <td className="p-4">
                                            <p className="font-bold text-white text-sm">{m.operator_name}</p>
                                            <p className="text-xs text-zinc-500">{m.email}</p>
                                        </td>
                                        <td className="p-4"><span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-black uppercase">{m.mission_type}</span></td>
                                        <td className="p-4 text-xs text-zinc-300 font-bold">{m.subject}</td>
                                        <td className="p-4 text-xs text-zinc-500">{timeAgo(m.created_at)}</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-600 text-sm font-bold">No messages found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
                    {selected ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-black text-white">{selected.operator_name}</p>
                                    <p className="text-sm text-zinc-400">{selected.email}</p>
                                </div>
                                <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${selected.handled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {selected.handled ? 'Handled' : 'Unhandled'}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">{selected.mission_type}</span>
                                {selected.order_id && <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-400">Order: {selected.order_id}</span>}
                            </div>
                            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
                                <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">{selected.subject}</p>
                                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-mono">Received {new Date(selected.created_at).toLocaleString()}</p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => toggleHandled(selected)}
                                    disabled={busy}
                                    className="flex-1 py-2.5 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50"
                                >
                                    {selected.handled ? 'Mark Unhandled' : 'Mark Handled'}
                                </button>
                                <button
                                    onClick={() => deleteMessage(selected.id)}
                                    disabled={busy}
                                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-black text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                                >Delete</button>
                            </div>
                            <a href={`mailto:${selected.email}`} className="block w-full py-2.5 rounded-xl bg-zinc-800 text-white font-black text-sm text-center hover:bg-zinc-700 transition-all">Reply via Email</a>
                        </div>
                    ) : (
                        <div className="h-full min-h-[300px] flex items-center justify-center">
                            <p className="text-zinc-600 font-bold text-sm">Select a message to inspect</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   LOGISTICS
   ════════════════════════════════════════════════════════════════════════ */
const LogisticsSection: React.FC<{ data: ReturnType<typeof useAdminData> }> = ({ data }) => {
    const [assigning, setAssigning] = useState(false);

    const activeDelegates = data.delegates.filter(d => d.status === 'active');
    const unassigned = data.orders.filter(o => !data.assignments.some(a => a.order_id === o.id));

    const assignOrder = async (orderId: string, delegateId: string) => {
        if (!delegateId) return;
        setAssigning(true);
        const { error } = await supabase.from('delivery_assignments').insert({ order_id: orderId, delegate_id: delegateId, status: 'assigned' });
        setAssigning(false);
        if (error) return toast.error('Assignment failed: ' + error.message);
        toast.success('Order assigned');
        data.refresh();
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Logistics Command</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{activeDelegates.length} active units · {unassigned.length} unassigned orders</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Delegates */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" /> Active Units</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {data.delegates.map(d => (
                            <div key={d.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">{d.vehicle_type || 'UNIT'}</p>
                                        <p className="text-white font-black">{d.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${d.status === 'active' ? 'bg-green-500/10 text-green-400' : d.status === 'busy' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>{d.status}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 font-bold">{data.assignments.filter(a => a.delegate_id === d.id).length} active runs</span>
                                    <span className="text-zinc-600 font-mono">{d.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                        {data.delegates.length === 0 && <div className="col-span-2 p-10 text-center text-zinc-600 font-bold text-sm">No delegates registered</div>}
                    </div>
                </div>

                {/* Unassigned orders */}
                <div className="space-y-3">
                    <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Package className="w-4 h-4 text-gold-500" /> Unassigned Orders</h2>
                    <div className="space-y-2">
                        {unassigned.slice(0, 20).map(o => (
                            <div key={o.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-white font-black">#{o.id.slice(0, 8)}</span><span className="text-gold-500 font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</span></div>
                                <p className="text-xs text-zinc-500">{o.fullName} · {o.city}, {o.country}</p>
                                <select
                                    title="Assign to delegate"
                                    onChange={e => assignOrder(o.id, e.target.value)}
                                    disabled={assigning}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:border-gold-500 outline-none"
                                >
                                    <option value="">Assign delegate...</option>
                                    {activeDelegates.map(d => <option key={d.id} value={d.id}>{d.id.slice(0, 6).toUpperCase()}</option>)}
                                </select>
                            </div>
                        ))}
                        {unassigned.length === 0 && <div className="p-10 text-center text-zinc-600 font-bold text-sm bg-zinc-900/40 border border-zinc-800 rounded-2xl">All orders assigned</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   SETTINGS
   ════════════════════════════════════════════════════════════════════════ */
const SettingsSection: React.FC<{ data: ReturnType<typeof useAdminData> }> = ({ data }) => {
    const [local, setLocal] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const applySettings = () => {
        const map: Record<string, string> = {};
        data.settings.forEach(s => { map[s.key] = s.value; });
        setLocal(map);
    };
    React.useEffect(applySettings, [data.settings]);

    const saveAll = async () => {
        setSaving(true);
        const upserts = Object.entries(local).map(([key, value]) => ({
            key,
            value,
            section: key.includes('gateway') ? 'gateways' : key.includes('currency') ? 'general' : 'general',
            updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('admin_settings').upsert(upserts, { onConflict: 'key' });
        setSaving(false);
        if (error) return toast.error('Save failed: ' + error.message);
        toast.success('Settings saved');
        data.refresh();
    };

    const setVal = (key: string, value: string) => setLocal(prev => ({ ...prev, [key]: value }));

    const gatewayRow = (key: string, label: string) => (
        <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <span className="text-sm font-bold text-zinc-300">{label}</span>
            <select value={local[`gateway_${key}`] || 'disabled'} onChange={e => setVal(`gateway_${key}`, e.target.value)} className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:border-gold-500 outline-none">
                <option value="disabled">Disabled</option>
                <option value="sandbox">Sandbox / Test</option>
                <option value="live">Live</option>
            </select>
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Settings</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Store & gateway configuration</p>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Settings className="w-4 h-4 text-gold-500" /> General</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">Store Name</label>
                        <input value={local['store_name'] || ''} onChange={e => setVal('store_name', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none" placeholder="Mr. X Steroid" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">Base Currency</label>
                        <select value={local['currency'] || 'USD'} onChange={e => setVal('currency', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none">
                            <option value="USD">USD</option>
                            <option value="EGP">EGP</option>
                        </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">Support Email</label>
                        <input value={local['support_email'] || ''} onChange={e => setVal('support_email', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none" placeholder="support@mrxsteroid.com" />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Wallet className="w-4 h-4 text-gold-500" /> Payment Gateways</h2>
                {gatewayRow('stripe', 'Stripe (Global)')}
                {gatewayRow('paymob', 'Paymob (Egypt)')}
                {gatewayRow('spaceremit', 'SpaceRemit (Global)')}
            </div>

            <button
                onClick={saveAll}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
            </button>
        </div>
    );
};

export default MissionControl;