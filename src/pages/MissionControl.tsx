import React, { useCallback, useMemo, useState } from 'react';
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
    PackageSearch,
    Megaphone,
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
import { useAdminData, fmtCurrency, timeAgo, Order, ContactMessage, Profile, Product, Coupon, DiscountRule, Banner, CustomerNote } from '../features/admin/useAdminData';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import { ContentStrings } from '../shared/types/types';

type MC = NonNullable<ContentStrings['missionControl']>;
type SectionKey = 'overview' | 'orders' | 'catalog' | 'marketing' | 'customers' | 'messages' | 'logistics' | 'settings';

interface VariantForm {
    id?: string;
    name: string;
    sku: string;
    price: number;
    sale_price: string;
    stock: number;
}

interface ProductForm {
    id?: string;
    name: string;
    slug: string;
    sku: string;
    category_id: string;
    description: string;
    price: number;
    sale_price: string;
    tax_rate: number;
    stock: number;
    low_stock_threshold: number;
    status: string;
    image_url: string;
    seo_title: string;
    seo_description: string;
    variants: VariantForm[];
}

const GATEWAY_COLORS: Record<string, string> = {
    stripe: '#6366f1',
    paymob: '#10b981',
    spaceremit: '#0ea5e9',
};

const SECTIONS: { key: SectionKey; icon: React.ElementType }[] = [
    { key: 'overview', icon: LayoutDashboard },
    { key: 'orders', icon: ShoppingCart },
    { key: 'catalog', icon: PackageSearch },
    { key: 'marketing', icon: Megaphone },
    { key: 'customers', icon: Users },
    { key: 'messages', icon: Mail },
    { key: 'logistics', icon: Map },
    { key: 'settings', icon: Settings },
];

const MissionControl: React.FC = () => {
    const { isRTL, content } = usePreferences();
    const mc = content.missionControl!;
    const [section, setSection] = useState<SectionKey>('overview');
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState('');
    const data = useAdminData();

    const sections = SECTIONS.map(s => ({ ...s, label: mc.sections[s.key] }));

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
                            <p className="font-black text-sm tracking-tight text-white leading-none">{mc.appName.toUpperCase()}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{mc.tagline}</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                    {sections.map(s => (
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
                        {!collapsed && <span>{mc.collapse}</span>}
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
                            placeholder={mc.searchPlaceholder}
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
                            <p className="text-xs font-black text-white leading-none">{mc.adminRole}</p>
                            <p className="text-[9px] text-zinc-500 font-bold mt-1">{mc.clearance}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {data.loading ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                            <p className="text-sm font-black text-zinc-500 uppercase tracking-widest animate-pulse">{mc.loading}</p>
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
    const { content } = usePreferences();
    const mc = content.missionControl!;
    switch (section) {
        case 'overview': return <OverviewSection data={data} search={search} mc={mc} />;
        case 'orders': return <OrdersSection data={data} search={search} mc={mc} />;
        case 'catalog': return <CatalogSection data={data} search={search} onRefresh={onRefresh} mc={mc} />;
        case 'marketing': return <MarketingSection data={data} onRefresh={onRefresh} mc={mc} />;
        case 'customers': return <CustomersSection data={data} search={search} onRefresh={onRefresh} mc={mc} />;
        case 'messages': return <MessagesSection data={data} search={search} onRefresh={onRefresh} mc={mc} />;
        case 'logistics': return <LogisticsSection data={data} mc={mc} />;
        case 'settings': return <SettingsSection data={data} mc={mc} />;
        default: return null;
    }
};

/* ════════════════════════════════════════════════════════════════════════
   OVERVIEW
   ════════════════════════════════════════════════════════════════════════ */
const OverviewSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; mc: MC }> = ({ data, mc }) => {
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
        ...orders.slice(0, 5).map(o => ({ kind: 'order', title: `${mc.activityOrder} #${o.id.slice(0, 8)}`, sub: `${o.fullname || o.email || '—'} · ${fmtCurrency(Number(o.amount || 0), 'USD')}`, time: o.created_at || '' })),
        ...messages.slice(0, 5).map(m => ({ kind: 'message', title: `${mc.activityMessage}: ${m.operator_name}`, sub: m.subject, time: m.created_at })),
        ...profiles.slice(0, 4).map(p => ({ kind: 'user', title: `${mc.activityUser}: ${p.full_name || p.email || ''}`, sub: p.email || '', time: p.created_at })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.overviewTitle}</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{mc.overviewSubtitle}</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={DollarSign} label={mc.usdRevenue} value={fmtCurrency(stats.usdRevenue, 'USD')} sub={`${stats.success.length} ${mc.salesCount}`} tone="gold" />
                <KpiCard icon={Wallet} label={mc.egpRevenue} value={fmtCurrency(stats.egpRevenue, 'EGP')} sub={mc.egyptVolume} tone="emerald" />
                <KpiCard icon={Clock} label={mc.pending} value={String(stats.pending.length)} sub={`${stats.failed.length} ${mc.failedCount}`} tone="amber" />
                <KpiCard icon={Mail} label={mc.unreadMessages} value={String(stats.unhandledMessages)} sub={`${stats.totalOrders} ${mc.ordersCount}`} tone="rose" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-white uppercase text-sm tracking-wide">{mc.revenueChartTitle}</h3>
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
                    <h3 className="font-black text-white uppercase text-sm tracking-wide">{mc.salesByGateway}</h3>
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
                    <h3 className="font-black text-white uppercase text-sm tracking-wide mb-4">{mc.recentActivity}</h3>
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
                        {recentActivity.length === 0 && <p className="text-sm text-zinc-600 font-bold text-center py-8">{mc.noRecentActivity}</p>}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
                        <h3 className="font-black text-white uppercase text-sm tracking-wide mb-3">{mc.orderStatus}</h3>
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
                        <div><p className="text-[10px] font-black text-zinc-500 uppercase">{mc.totalUsers}</p><p className="text-2xl font-black text-white">{stats.totalUsers}</p></div>
                        <div><p className="text-[10px] font-black text-zinc-500 uppercase">{mc.activeDelegates}</p><p className="text-2xl font-black text-white">{stats.activeDelegates}</p></div>
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
   CATALOG & INVENTORY
   ════════════════════════════════════════════════════════════════════════ */
const CatalogSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; onRefresh: () => void; mc: MC }> = ({ data, search, onRefresh, mc }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [editing, setEditing] = useState<Product | 'new' | null>(null);
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [catBusy, setCatBusy] = useState(false);

    const categories = data.categories;
    const catName = (id: string | null) => id ? (categories.find(c => c.id === id)?.name || '—') : '—';
    const variantsOf = (id: string) => data.variants.filter(v => v.product_id === id);

    const filtered = useMemo(() => {
        let list = data.products;
        if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
        if (catFilter !== 'all') list = list.filter(p => p.category_id === catFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.slug?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [data.products, statusFilter, catFilter, search]);

    const stockBadge = (stock: number, threshold: number) => {
        if (stock <= 0) return <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-red-500/10 text-red-400">{mc.outOfStock}</span>;
        if (stock <= threshold) return <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-400">{mc.lowStock}</span>;
        return <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-green-500/10 text-green-400">{mc.inStock}</span>;
    };

    const statusBadge = (status: string) => (
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${status === 'active' ? 'bg-green-500/10 text-green-400' : status === 'draft' ? 'bg-zinc-800 text-zinc-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {status === 'active' ? mc.statusActive : status === 'draft' ? mc.statusDraft : mc.statusInactive}
        </span>
    );

    const effectivePrice = (p: { price: number; sale_price: number | null }) => Number(p.sale_price || p.price);

    const deleteProduct = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('products').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error(`${mc.productDeleteFailed} ${error.message}`);
        toast.success(mc.productDeleteSuccess);
        onRefresh();
    };

    const addCategory = async () => {
        if (!newCategory.trim()) return;
        setCatBusy(true);
        const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const { error } = await supabase.from('categories').insert({ name: newCategory.trim(), slug });
        setCatBusy(false);
        if (error) return toast.error(`${mc.categorySaveFailed} ${error.message}`);
        toast.success(mc.categorySaveSuccess);
        setNewCategory('');
        onRefresh();
    };

    const initForm = (): ProductForm => ({
        name: '', slug: '', sku: '', category_id: '', description: '',
        price: 0, sale_price: '', tax_rate: 0, stock: 0, low_stock_threshold: 5,
        status: 'active', image_url: '', seo_title: '', seo_description: '',
        variants: [],
    });

    const [form, setForm] = useState<ProductForm>(initForm());

    const openForm = (target: Product | 'new' | null) => {
        if (target === null) return;
        if (target === 'new') {
            setForm(initForm());
        } else {
            setForm({
                id: target.id, name: target.name, slug: target.slug, sku: target.sku || '',
                category_id: target.category_id || '', description: target.description || '',
                price: target.price, sale_price: target.sale_price == null ? '' : String(target.sale_price), tax_rate: target.tax_rate,
                stock: target.stock, low_stock_threshold: target.low_stock_threshold,
                status: target.status, image_url: target.image_url || '',
                seo_title: target.seo_title || '', seo_description: target.seo_description || '',
                variants: variantsOf(target.id).map(v => ({ id: v.id, name: v.name, sku: v.sku || '', price: v.price, sale_price: v.sale_price == null ? '' : String(v.sale_price), stock: v.stock })),
            });
        }
        setEditing(target);
    };

    const setF = (k: keyof ProductForm, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

    const saveProduct = async () => {
        if (!form.name || !form.slug) return toast.error(mc.missingRequired);
        setSaving(true);
        const base = {
            name: form.name, slug: form.slug, sku: form.sku || null,
            category_id: form.category_id || null, description: form.description || null,
            price: Number(form.price) || 0, sale_price: form.sale_price === '' ? null : Number(form.sale_price),
            tax_rate: Number(form.tax_rate) || 0, stock: Number(form.stock) || 0,
            low_stock_threshold: Number(form.low_stock_threshold) || 5,
            status: form.status, image_url: form.image_url || null,
            seo_title: form.seo_title || null, seo_description: form.seo_description || null,
        };
        if (editing === 'new') {
            const { data: ins, error } = await supabase.from('products').insert(base).select('id').single();
            setSaving(false);
            if (error) return toast.error(`${mc.productSaveFailed} ${error.message}`);
            const productId = (ins as { id: string }).id;
            const vs = form.variants.filter(v => v.name.trim().length > 0);
            if (vs.length) {
                const { error: verr } = await supabase.from('product_variants').insert(vs.map(v => ({ product_id: productId, name: v.name, sku: v.sku || null, price: Number(v.price) || 0, sale_price: v.sale_price === '' ? null : Number(v.sale_price), stock: Number(v.stock) || 0 })));
                if (verr) console.warn('[Catalog] variant insert:', verr.message);
            }
            toast.success(mc.productSaveSuccess);
        } else {
            const id = (editing as Product).id;
            const { error } = await supabase.from('products').update(base).eq('id', id);
            setSaving(false);
            if (error) return toast.error(`${mc.productSaveFailed} ${error.message}`);
            const vs = form.variants.filter(v => v.name.trim().length > 0);
            const { error: vdel } = await supabase.from('product_variants').delete().eq('product_id', id);
            if (vs.length) {
                const { error: verr } = await supabase.from('product_variants').insert(vs.map(v => ({ product_id: id, name: v.name, sku: v.sku || null, price: Number(v.price) || 0, sale_price: v.sale_price === '' ? null : Number(v.sale_price), stock: Number(v.stock) || 0 })));
                if (verr) console.warn('[Catalog] variant re-insert:', verr.message);
            }
            if (vdel) console.warn('[Catalog] variant delete:', vdel.message);
            toast.success(mc.productSaveSuccess);
        }
        setEditing(null);
        onRefresh();
    };

    const setVar = (i: number, k: keyof VariantForm, v: string | number) => {
        const vs = [...form.variants];
        vs[i] = { ...vs[i], [k]: v };
        setForm(prev => ({ ...prev, variants: vs }));
    };

    const addVariant = () => setForm(prev => ({ ...prev, variants: [...prev.variants, { name: '', sku: '', price: 0, sale_price: '', stock: 0 }] }));
    const removeVariant = (i: number) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));

    const inputCls = "w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none";
    const labelCls = "text-[10px] font-black text-zinc-500 uppercase";

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-end gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.catalogTitle}</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{mc.catalogSubtitle}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold-500 outline-none">
                        <option value="all">{mc.catalogFilterStatus}</option>
                        <option value="active">{mc.statusActive}</option>
                        <option value="inactive">{mc.statusInactive}</option>
                        <option value="draft">{mc.statusDraft}</option>
                    </select>
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold-500 outline-none">
                        <option value="all">{mc.catalogFilterCategory}</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={() => openForm('new')} className="px-4 py-2 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all flex items-center gap-2">
                        <Package className="w-4 h-4" /> {mc.addProductBtn}
                    </button>
                </div>
            </header>

            {/* Categories quick-add */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase">{mc.categoriesLabel}:</span>
                {categories.slice(0, 8).map(c => <span key={c.id} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300">{c.name}</span>)}
                {categories.length === 0 && <span className="text-xs text-zinc-600 font-bold">{mc.noCategories}</span>}
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder={mc.categoryName} className="w-44 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-gold-500 outline-none" />
                <button onClick={addCategory} disabled={catBusy} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all disabled:opacity-50">{mc.addCategoryBtn}</button>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                <th className="p-4">{mc.productImageCol}</th>
                                <th className="p-4">{mc.productCol}</th>
                                <th className="p-4">{mc.skuCol}</th>
                                <th className="p-4">{mc.categoryCol}</th>
                                <th className="p-4">{mc.priceCol}</th>
                                <th className="p-4">{mc.stockCol}</th>
                                <th className="p-4">{mc.statusCol}</th>
                                <th className="p-4">{mc.actionsCol}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 50).map(p => (
                                <tr key={p.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                    <td className="p-4">
                                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-11 h-11 rounded-lg object-cover border border-zinc-800" /> : <div className="w-11 h-11 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600"><Package className="w-5 h-5" /></div>}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-white">{p.name}</p>
                                        <p className="text-xs text-zinc-500">{variantsOf(p.id).length} {mc.variantsLabel.toLowerCase()}</p>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-zinc-400">{p.sku || '—'}</td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{catName(p.category_id)}</td>
                                    <td className="p-4">
                                        <p className="text-xs text-white font-bold">{fmtCurrency(effectivePrice(p), 'USD')}</p>
                                        {p.sale_price != null && Number(p.sale_price) < Number(p.price) && <p className="text-[10px] text-zinc-600 line-through">{fmtCurrency(Number(p.price), 'USD')}</p>}
                                    </td>
                                    <td className="p-4">{stockBadge(p.stock, p.low_stock_threshold)}</td>
                                    <td className="p-4">{statusBadge(p.status)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openForm(p)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.editProductTitle}</button>
                                            <button onClick={() => deleteProduct(p.id)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">{mc.removeBtn}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noProductsFound}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit drawer */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-end">
                    <div className="w-full max-w-2xl h-full bg-zinc-950 border-s border-zinc-800 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-white uppercase text-lg">{editing === 'new' ? mc.addProductTitle : mc.editProductTitle}</h2>
                            <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.productName}</label>
                                    <input value={form.name} onChange={e => setF('name', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.productSlug}</label>
                                    <input value={form.slug} onChange={e => setF('slug', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.skuCol}</label>
                                    <input value={form.sku} onChange={e => setF('sku', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.productCategory}</label>
                                    <select value={form.category_id} onChange={e => setF('category_id', e.target.value)} className={inputCls}>
                                        <option value="">—</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>{mc.productDescription}</label>
                                    <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={3} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.basePrice}</label>
                                    <input type="number" value={form.price} onChange={e => setF('price', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.salePrice}</label>
                                    <input type="number" value={form.sale_price} onChange={e => setF('sale_price', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.taxRate}</label>
                                    <input type="number" value={form.tax_rate} onChange={e => setF('tax_rate', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.productImageUrl}</label>
                                    <input value={form.image_url} onChange={e => setF('image_url', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.initialStock}</label>
                                    <input type="number" value={form.stock} onChange={e => setF('stock', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>{mc.lowStockThreshold}</label>
                                    <input type="number" value={form.low_stock_threshold} onChange={e => setF('low_stock_threshold', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>{mc.statusCol}</label>
                                    <select value={form.status} onChange={e => setF('status', e.target.value)} className={inputCls}>
                                        <option value="active">{mc.statusActive}</option>
                                        <option value="inactive">{mc.statusInactive}</option>
                                        <option value="draft">{mc.statusDraft}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>{mc.seoTitle}</label>
                                    <input value={form.seo_title} onChange={e => setF('seo_title', e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className={labelCls}>{mc.seoDescription}</label>
                                    <input value={form.seo_description} onChange={e => setF('seo_description', e.target.value)} className={inputCls} />
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="border-t border-zinc-800 pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white uppercase">{mc.variantsLabel}</h3>
                                    <button onClick={addVariant} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.addVariantBtn}</button>
                                </div>
                                {(form.variants).map((v, i) => (
                                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 grid sm:grid-cols-5 gap-3 items-end">
                                        <div className="sm:col-span-1 space-y-1"><label className={labelCls}>{mc.variantName}</label><input value={v.name} onChange={e => setVar(i, 'name', e.target.value)} className={inputCls} /></div>
                                        <div className="space-y-1"><label className={labelCls}>{mc.variantSku}</label><input value={v.sku} onChange={e => setVar(i, 'sku', e.target.value)} className={inputCls} /></div>
                                        <div className="space-y-1"><label className={labelCls}>{mc.priceCol}</label><input type="number" value={v.price} onChange={e => setVar(i, 'price', e.target.value)} className={inputCls} /></div>
                                        <div className="space-y-1"><label className={labelCls}>{mc.variantStock}</label><input type="number" value={v.stock} onChange={e => setVar(i, 'stock', e.target.value)} className={inputCls} /></div>
                                        <button onClick={() => removeVariant(i)} className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all">{mc.removeBtn}</button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-zinc-800">
                                <button onClick={saveProduct} disabled={saving} className="flex-1 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} {mc.saveProductBtn}
                                </button>
                                <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">{mc.cancelBtn}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   MARKETING & PROMOTIONS
   ════════════════════════════════════════════════════════════════════════ */
const MarketingSection: React.FC<{ data: ReturnType<typeof useAdminData>; onRefresh: () => void; mc: MC }> = ({ data, onRefresh, mc }) => {
    const [tab, setTab] = useState<'coupons' | 'rules' | 'banners'>('coupons');
    const [busy, setBusy] = useState(false);

    const discountTypeLabel = (t: string) => t === 'percentage' ? mc.discountTypePercentage : t === 'fixed' ? mc.discountTypeFixed : mc.discountTypeFreeShipping;

    // ── Coupons ──
    const [couponForm, setCouponForm] = useState<Coupon | 'new' | null>(null);
    const [cSaving, setCSaving] = useState(false);
    const couponInit = (): Partial<Coupon> => ({ code: '', discount_type: 'percentage', discount_value: 0, min_order_amount: null, max_uses: null, max_per_user: null, starts_at: null, ends_at: null, is_active: true });
    const [cForm, setCForm] = useState<Partial<Coupon>>(couponInit());
    const cSet = (k: keyof Coupon, v: string | number | boolean | null) => setCForm(prev => ({ ...prev, [k]: v }));

    const openCoupon = (target: Coupon | 'new' | null) => {
        if (!target) return;
        setCForm(target === 'new' ? couponInit() : { ...target });
        setCouponForm(target);
    };

    const saveCoupon = async () => {
        if (!cForm.code) return;
        setCSaving(true);
        const payload = {
            code: String(cForm.code).toUpperCase(),
            discount_type: cForm.discount_type || 'percentage',
            discount_value: Number(cForm.discount_value) || 0,
            min_order_amount: cForm.min_order_amount == null ? null : Number(cForm.min_order_amount),
            max_uses: cForm.max_uses == null ? null : Number(cForm.max_uses),
            max_per_user: cForm.max_per_user == null ? null : Number(cForm.max_per_user),
            starts_at: cForm.starts_at || null,
            ends_at: cForm.ends_at || null,
            is_active: !!cForm.is_active,
        };
        const { error } = couponForm === 'new'
            ? await supabase.from('coupon_codes').insert(payload)
            : await supabase.from('coupon_codes').update(payload).eq('id', (couponForm as Coupon).id);
        setCSaving(false);
        if (error) return toast.error(`${mc.couponSaveFailed} ${error.message}`);
        toast.success(mc.couponSaveSuccess);
        setCouponForm(null);
        onRefresh();
    };

    const deleteCoupon = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('coupon_codes').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error(`${mc.couponDeleteFailed} ${error.message}`);
        toast.success(mc.couponDeleteSuccess);
        onRefresh();
    };

    // ── Rules ──
    const [ruleForm, setRuleForm] = useState<DiscountRule | 'new' | null>(null);
    const [rSaving, setRSaving] = useState(false);
    const ruleInit = (): Partial<DiscountRule> => ({ name: '', rule_type: 'threshold', threshold_amount: null, buy_quantity: null, get_quantity: null, discount_percent: null, is_active: true });
    const [rForm, setRForm] = useState<Partial<DiscountRule>>(ruleInit());
    const rSet = (k: keyof DiscountRule, v: string | number | boolean | null) => setRForm(prev => ({ ...prev, [k]: v }));

    const openRule = (target: DiscountRule | 'new' | null) => {
        if (!target) return;
        setRForm(target === 'new' ? ruleInit() : { ...target });
        setRuleForm(target);
    };

    const saveRule = async () => {
        if (!rForm.name) return;
        setRSaving(true);
        const payload = {
            name: rForm.name,
            rule_type: rForm.rule_type || 'threshold',
            threshold_amount: rForm.threshold_amount == null ? null : Number(rForm.threshold_amount),
            buy_quantity: rForm.buy_quantity == null ? null : Number(rForm.buy_quantity),
            get_quantity: rForm.get_quantity == null ? null : Number(rForm.get_quantity),
            discount_percent: rForm.discount_percent == null ? null : Number(rForm.discount_percent),
            is_active: !!rForm.is_active,
        };
        const { error } = ruleForm === 'new'
            ? await supabase.from('discount_rules').insert(payload)
            : await supabase.from('discount_rules').update(payload).eq('id', (ruleForm as DiscountRule).id);
        setRSaving(false);
        if (error) return toast.error(`${mc.ruleSaveFailed} ${error.message}`);
        toast.success(mc.ruleSaveSuccess);
        setRuleForm(null);
        onRefresh();
    };

    const deleteRule = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('discount_rules').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error(`${mc.ruleDeleteFailed} ${error.message}`);
        toast.success(mc.ruleDeleteSuccess);
        onRefresh();
    };

    // ── Banners ──
    const [bannerForm, setBannerForm] = useState<Banner | 'new' | null>(null);
    const [bSaving, setBSaving] = useState(false);
    const bannerInit = (): Partial<Banner> => ({ title: '', subtitle: '', image_url: '', link_url: '', position: 'home', sort_order: 0, is_active: true });
    const [bForm, setBForm] = useState<Partial<Banner>>(bannerInit());
    const bSet = (k: keyof Banner, v: string | number | boolean | null) => setBForm(prev => ({ ...prev, [k]: v }));

    const openBanner = (target: Banner | 'new' | null) => {
        if (!target) return;
        setBForm(target === 'new' ? bannerInit() : { ...target });
        setBannerForm(target);
    };

    const saveBanner = async () => {
        setBSaving(true);
        const payload = {
            title: bForm.title || null,
            subtitle: bForm.subtitle || null,
            image_url: bForm.image_url || null,
            link_url: bForm.link_url || null,
            position: bForm.position || 'home',
            sort_order: Number(bForm.sort_order) || 0,
            is_active: !!bForm.is_active,
        };
        const { error } = bannerForm === 'new'
            ? await supabase.from('banners').insert(payload)
            : await supabase.from('banners').update(payload).eq('id', (bannerForm as Banner).id);
        setBSaving(false);
        if (error) return toast.error(`${mc.bannerSaveFailed} ${error.message}`);
        toast.success(mc.bannerSaveSuccess);
        setBannerForm(null);
        onRefresh();
    };

    const deleteBanner = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('banners').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error(`${mc.bannerDeleteFailed} ${error.message}`);
        toast.success(mc.bannerDeleteSuccess);
        onRefresh();
    };

    const inputCls = "w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none";
    const labelCls = "text-[10px] font-black text-zinc-500 uppercase";
    const tabCls = (active: boolean) => `px-4 py-2 rounded-xl text-sm font-black uppercase transition-all ${active ? 'bg-gold-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`;

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-end gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.marketingTitle}</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{mc.marketingSubtitle}</p>
                </div>
            </header>

            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setTab('coupons')} className={tabCls(tab === 'coupons')}>{mc.couponsTitle}</button>
                <button onClick={() => setTab('rules')} className={tabCls(tab === 'rules')}>{mc.rulesTitle}</button>
                <button onClick={() => setTab('banners')} className={tabCls(tab === 'banners')}>{mc.bannersTitle}</button>
            </div>

            {tab === 'coupons' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => openCoupon('new')} className="px-4 py-2 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all">{mc.addCouponBtn}</button>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[760px]">
                                <thead>
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                        <th className="p-4">{mc.couponCode}</th>
                                        <th className="p-4">{mc.discountType}</th>
                                        <th className="p-4">{mc.discountValue}</th>
                                        <th className="p-4">{mc.minOrderAmount}</th>
                                        <th className="p-4">{mc.maxUses}</th>
                                        <th className="p-4">{mc.endsAt}</th>
                                        <th className="p-4">{mc.statusCol}</th>
                                        <th className="p-4">{mc.actionsCol}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.coupons.map(c => (
                                        <tr key={c.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                            <td className="p-4"><span className="px-2 py-1 rounded bg-zinc-800 font-mono text-xs font-black text-gold-500">{c.code}</span></td>
                                            <td className="p-4 text-xs text-zinc-300 font-bold">{discountTypeLabel(c.discount_type)}</td>
                                            <td className="p-4 text-xs text-white font-bold">{c.discount_type === 'percentage' ? `${c.discount_value}%` : fmtCurrency(Number(c.discount_value), 'USD')}</td>
                                            <td className="p-4 text-xs text-zinc-400">{c.min_order_amount != null ? fmtCurrency(Number(c.min_order_amount), 'USD') : '—'}</td>
                                            <td className="p-4 text-xs text-zinc-400">{c.max_uses ?? '∞'}</td>
                                            <td className="p-4 text-xs text-zinc-500">{c.ends_at ? new Date(c.ends_at).toLocaleDateString() : '—'}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${c.is_active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>{c.is_active ? mc.yesLabel : mc.noLabel}</span></td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openCoupon(c)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.editProductTitle}</button>
                                                    <button onClick={() => deleteCoupon(c.id)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">{mc.removeBtn}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.coupons.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noCouponsFound}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'rules' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => openRule('new')} className="px-4 py-2 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all">{mc.addRuleBtn}</button>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[720px]">
                                <thead>
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                        <th className="p-4">{mc.ruleName}</th>
                                        <th className="p-4">{mc.ruleType}</th>
                                        <th className="p-4">{mc.thresholdAmount}</th>
                                        <th className="p-4">{mc.buyQuantity}</th>
                                        <th className="p-4">{mc.getQuantity}</th>
                                        <th className="p-4">{mc.discountPercent}</th>
                                        <th className="p-4">{mc.statusCol}</th>
                                        <th className="p-4">{mc.actionsCol}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.discountRules.map(r => (
                                        <tr key={r.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                            <td className="p-4 font-bold text-white">{r.name}</td>
                                            <td className="p-4 text-xs text-zinc-300 font-bold">{r.rule_type === 'threshold' ? mc.ruleTypeThreshold : mc.ruleTypeBuyXY}</td>
                                            <td className="p-4 text-xs text-zinc-400">{r.threshold_amount != null ? fmtCurrency(Number(r.threshold_amount), 'USD') : '—'}</td>
                                            <td className="p-4 text-xs text-zinc-400">{r.buy_quantity ?? '—'}</td>
                                            <td className="p-4 text-xs text-zinc-400">{r.get_quantity ?? '—'}</td>
                                            <td className="p-4 text-xs text-zinc-400">{r.discount_percent != null ? `${r.discount_percent}%` : '—'}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${r.is_active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>{r.is_active ? mc.yesLabel : mc.noLabel}</span></td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openRule(r)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.editProductTitle}</button>
                                                    <button onClick={() => deleteRule(r.id)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">{mc.removeBtn}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.discountRules.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noRulesFound}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'banners' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => openBanner('new')} className="px-4 py-2 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all">{mc.addBannerBtn}</button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.banners.map(b => (
                            <div key={b.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                                {b.image_url ? <img src={b.image_url} alt={b.title || ''} className="w-full h-36 object-cover" /> : <div className="w-full h-36 bg-zinc-800 flex items-center justify-center text-zinc-600"><Megaphone className="w-8 h-8" /></div>}
                                <div className="p-4 space-y-2">
                                    <p className="font-black text-white">{b.title || '—'}</p>
                                    <p className="text-xs text-zinc-500">{b.subtitle || ''}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 font-black uppercase">{b.position === 'home' ? mc.positionHome : b.position === 'promo' ? mc.positionPromo : mc.positionCategory}</span>
                                        <span className={`text-[10px] font-black uppercase ${b.is_active ? 'text-green-400' : 'text-zinc-600'}`}>{b.is_active ? mc.activeBadge : mc.noLabel}</span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => openBanner(b)} className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.editProductTitle}</button>
                                        <button onClick={() => deleteBanner(b.id)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase hover:bg-red-500/20 transition-all disabled:opacity-50">{mc.removeBtn}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.banners.length === 0 && <div className="col-span-full p-10 text-center text-zinc-600 font-bold text-sm">{mc.noBannersFound}</div>}
                    </div>
                </div>
            )}

            {/* ── Coupon modal ── */}
            {couponForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-black text-white uppercase text-lg">{couponForm === 'new' ? mc.couponAddTitle : mc.couponEditTitle}</h2>
                            <button onClick={() => setCouponForm(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className={labelCls}>{mc.couponCode}</label><input value={cForm.code || ''} onChange={e => cSet('code', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>{mc.discountType}</label>
                                <select value={cForm.discount_type || 'percentage'} onChange={e => cSet('discount_type', e.target.value)} className={inputCls}>
                                    <option value="percentage">{mc.discountTypePercentage}</option>
                                    <option value="fixed">{mc.discountTypeFixed}</option>
                                    <option value="free_shipping">{mc.discountTypeFreeShipping}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.discountValue}</label><input type="number" value={cForm.discount_value ?? 0} onChange={e => cSet('discount_value', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.minOrderAmount}</label><input type="number" value={cForm.min_order_amount ?? ''} onChange={e => cSet('min_order_amount', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.maxUses}</label><input type="number" value={cForm.max_uses ?? ''} onChange={e => cSet('max_uses', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.maxPerUser}</label><input type="number" value={cForm.max_per_user ?? ''} onChange={e => cSet('max_per_user', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.startsAt}</label><input type="date" value={cForm.starts_at ? cForm.starts_at.slice(0, 10) : ''} onChange={e => cSet('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.endsAt}</label><input type="date" value={cForm.ends_at ? cForm.ends_at.slice(0, 10) : ''} onChange={e => cSet('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputCls} /></div>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                            <input type="checkbox" checked={!!cForm.is_active} onChange={e => cSet('is_active', e.target.checked)} className="w-4 h-4 accent-gold-500" /> {mc.isActive}
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button onClick={saveCoupon} disabled={cSaving} className="flex-1 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{cSaving && <Loader2 className="w-4 h-4 animate-spin" />} {mc.saveCouponBtn}</button>
                            <button onClick={() => setCouponForm(null)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">{mc.cancelBtn}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Rule modal ── */}
            {ruleForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-black text-white uppercase text-lg">{ruleForm === 'new' ? mc.addRuleBtn : mc.editProductTitle}</h2>
                            <button onClick={() => setRuleForm(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.ruleName}</label><input value={rForm.name || ''} onChange={e => rSet('name', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className={labelCls}>{mc.ruleType}</label>
                                <select value={rForm.rule_type || 'threshold'} onChange={e => rSet('rule_type', e.target.value)} className={inputCls}>
                                    <option value="threshold">{mc.ruleTypeThreshold}</option>
                                    <option value="buy_x_get_y">{mc.ruleTypeBuyXY}</option>
                                </select>
                            </div>
                            {(rForm.rule_type || 'threshold') === 'threshold' ? (
                                <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.thresholdAmount}</label><input type="number" value={rForm.threshold_amount ?? ''} onChange={e => rSet('threshold_amount', e.target.value)} className={inputCls} /></div>
                            ) : (
                                <>
                                    <div className="space-y-1.5"><label className={labelCls}>{mc.buyQuantity}</label><input type="number" value={rForm.buy_quantity ?? ''} onChange={e => rSet('buy_quantity', e.target.value)} className={inputCls} /></div>
                                    <div className="space-y-1.5"><label className={labelCls}>{mc.getQuantity}</label><input type="number" value={rForm.get_quantity ?? ''} onChange={e => rSet('get_quantity', e.target.value)} className={inputCls} /></div>
                                </>
                            )}
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.discountPercent}</label><input type="number" value={rForm.discount_percent ?? ''} onChange={e => rSet('discount_percent', e.target.value)} className={inputCls} /></div>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                            <input type="checkbox" checked={!!rForm.is_active} onChange={e => rSet('is_active', e.target.checked)} className="w-4 h-4 accent-gold-500" /> {mc.isActive}
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button onClick={saveRule} disabled={rSaving} className="flex-1 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{rSaving && <Loader2 className="w-4 h-4 animate-spin" />} {mc.saveBtnGeneric}</button>
                            <button onClick={() => setRuleForm(null)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">{mc.cancelBtn}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Banner modal ── */}
            {bannerForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-black text-white uppercase text-lg">{bannerForm === 'new' ? mc.addBannerBtn : mc.editProductTitle}</h2>
                            <button onClick={() => setBannerForm(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.bannerTitle}</label><input value={bForm.title || ''} onChange={e => bSet('title', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.bannerSubtitle}</label><input value={bForm.subtitle || ''} onChange={e => bSet('subtitle', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.bannerImageUrl}</label><input value={bForm.image_url || ''} onChange={e => bSet('image_url', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5 sm:col-span-2"><label className={labelCls}>{mc.bannerLinkUrl}</label><input value={bForm.link_url || ''} onChange={e => bSet('link_url', e.target.value)} className={inputCls} /></div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>{mc.bannerPosition}</label>
                                <select value={bForm.position || 'home'} onChange={e => bSet('position', e.target.value)} className={inputCls}>
                                    <option value="home">{mc.positionHome}</option>
                                    <option value="promo">{mc.positionPromo}</option>
                                    <option value="category">{mc.positionCategory}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>{mc.bannerSortOrder}</label><input type="number" value={bForm.sort_order ?? 0} onChange={e => bSet('sort_order', e.target.value)} className={inputCls} /></div>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                            <input type="checkbox" checked={!!bForm.is_active} onChange={e => bSet('is_active', e.target.checked)} className="w-4 h-4 accent-gold-500" /> {mc.isActive}
                        </label>
                        <div className="flex gap-3 pt-2">
                            <button onClick={saveBanner} disabled={bSaving} className="flex-1 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{bSaving && <Loader2 className="w-4 h-4 animate-spin" />} {mc.saveBtnGeneric}</button>
                            <button onClick={() => setBannerForm(null)} className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">{mc.cancelBtn}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   ORDERS
   ════════════════════════════════════════════════════════════════════════ */
const ORDER_STATUSES = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrdersSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; mc: MC }> = ({ data, search, mc }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [editing, setEditing] = useState<Order | null>(null);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        let list = data.orders;
        if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(o =>
                o.fullname?.toLowerCase().includes(q) ||
                o.email?.toLowerCase().includes(q) ||
                o.phone?.toLowerCase().includes(q) ||
                o.id?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [data.orders, statusFilter, search]);

    const updateStatus = async (order: Order, nextStatus: string) => {
        setSaving(true);
        const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', order.id);
        setSaving(false);
        if (error) return toast.error(`${mc.updateFailed} ${error.message}`);
        toast.success(mc.orderUpdated);
        data.refresh();
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-end gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.ordersTitle}</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{filtered.length} {mc.ordersCount}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold-500 outline-none">
                        <option value="all">{mc.allStatuses}</option>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                <th className="p-4">{mc.orderCol}</th>
                                <th className="p-4">{mc.customerCol}</th>
                                <th className="p-4">{mc.itemsCol}</th>
                                <th className="p-4">{mc.amountCol}</th>
                                <th className="p-4">{mc.statusCol}</th>
                                <th className="p-4">{mc.dateCol}</th>
                                <th className="p-4">{mc.actionsCol}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 50).map(o => (
                                <tr key={o.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                    <td className="p-4 font-mono text-xs text-zinc-400">#{o.id.slice(0, 8)}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-white">{o.fullname || o.email || '—'}</p>
                                        <p className="text-xs text-zinc-500">{o.email}</p>
                                    </td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold uppercase">{Array.isArray(o.items) ? o.items.length : '—'}</td>
                                    <td className="p-4 text-xs text-white font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                            o.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                            o.status === 'cancelled' || o.status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                                            o.status === 'shipped' || o.status === 'confirmed' ? 'bg-sky-500/10 text-sky-400' :
                                            'bg-amber-500/10 text-amber-400'
                                        }`}>{o.status}</span>
                                    </td>
                                    <td className="p-4 text-xs text-zinc-500">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setEditing(o)}
                                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all"
                                        >{mc.manageBtn}</button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noOrdersFound}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order detail / manage drawer */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-end">
                    <div className="w-full max-w-lg h-full bg-zinc-950 border-s border-zinc-800 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-white uppercase text-lg">{mc.orderCol} #{editing.id.slice(0, 8)}</h2>
                            <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">{mc.customerInfo}</p>
                                <p className="text-white font-bold">{editing.fullname || editing.email || '—'}</p>
                                <p className="text-sm text-zinc-400">{editing.email}</p>
                                <p className="text-xs text-zinc-500">{editing.address}, {editing.city}, {editing.country}</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">{mc.orderInfo}</p>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">{mc.phoneCol}</span><span className="text-zinc-400" dir="ltr">{editing.phone || '—'}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">{mc.amountCol}</span><span className="text-white font-bold">{fmtCurrency(Number(editing.amount || 0), 'USD')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-zinc-400">{mc.statusCol}</span><span className="text-white font-bold uppercase">{editing.status || '—'}</span></div>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-3">
                                <p className="text-[10px] font-black text-zinc-500 uppercase">{mc.updateStatus}</p>
                                <select
                                    value={editing.status || 'pending'}
                                    onChange={e => updateStatus(editing, e.target.value)}
                                    disabled={saving}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:border-gold-500 outline-none disabled:opacity-50"
                                >
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <button onClick={() => setEditing(null)} className="w-full py-3 rounded-xl bg-zinc-800 text-white font-black text-sm hover:bg-zinc-700 transition-all">{mc.closeBtn}</button>
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
const CustomersSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; onRefresh: () => void; mc: MC }> = ({ data, search, onRefresh, mc }) => {
    const { user } = useAuth();
    const [selected, setSelected] = useState<Profile | null>(null);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);
    const [noteBusy, setNoteBusy] = useState(false);

    const VIP_SPEND = 500;
    const ACTIVE_WINDOW_DAYS = 90;

    type Segment = 'vip' | 'active' | 'inactive' | 'new';

    const activeCutoff = useMemo(() => {
        let latest = 0;
        data.orders.forEach(o => { const t = new Date(o.created_at).getTime(); if (t > latest) latest = t; });
        data.invoices.forEach(i => { const t = new Date(i.created_at).getTime(); if (t > latest) latest = t; });
        if (!latest) return 0;
        return latest - ACTIVE_WINDOW_DAYS * 86400000;
    }, [data.orders, data.invoices]);

    const segmentOf = useCallback((p: Profile & { spend: number; total: number; orderCount: number }): Segment => {
        if (p.spend >= VIP_SPEND || p.total >= 3 || p.has_paid) return 'vip';
        const lastActivity = p.orderCount > 0;
        const hasRecentInvoice = activeCutoff > 0 && data.invoices.some(i => i.user_id === p.id && new Date(i.created_at).getTime() >= activeCutoff);
        if (lastActivity || hasRecentInvoice) return 'active';
        return p.total === 0 && p.orderCount === 0 ? 'new' : 'inactive';
    }, [data.invoices, activeCutoff]);

    const enriched = useMemo(() => {
        const success = data.invoices.filter(i => i.status === 'success');
        let list = data.profiles.map(p => {
            const invs = success.filter(i => i.user_id === p.id);
            const spend = invs.reduce((s, i) => s + Number(i.amount || 0), 0);
            const orderCount = data.orders.filter(o => o.email === p.email).length;
            const total = invs.length;
            const segment = segmentOf({ ...p, spend, total, orderCount });
            return { ...p, spend, total, orderCount, segment };
        });
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                (p.full_name || '').toLowerCase().includes(q) ||
                (p.email || '').toLowerCase().includes(q) ||
                (p.user_name || '').toLowerCase().includes(q) ||
                (p.phone_number || '').toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) => b.spend - a.spend);
    }, [data.profiles, data.invoices, data.orders, search, segmentOf]);

    const selectedOrders = useMemo(() => {
        if (!selected) return [];
        return data.orders.filter(o => o.email === selected.email);
    }, [selected, data.orders]);

    const selectedNotes = useMemo(() => {
        if (!selected) return [];
        return data.customerNotes.filter(n => n.user_id === selected.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [selected, data.customerNotes]);

    const segBadge = (seg: Segment) => {
        const map: Record<Segment, { txt: string; cls: string }> = {
            vip: { txt: mc.segmentVip, cls: 'bg-gold-500/15 text-gold-500 border-gold-500/40' },
            active: { txt: mc.segmentActive, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' },
            inactive: { txt: mc.segmentInactive, cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
            new: { txt: mc.segmentNew, cls: 'bg-sky-500/15 text-sky-400 border-sky-500/40' },
        };
        const m = map[seg];
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${m.cls}`}>
                {m.txt}
            </span>
        );
    };

    const addNote = async () => {
        if (!selected || !noteText.trim()) return;
        setNoteBusy(true);
        const { error } = await supabase.from('customer_notes').insert({ user_id: selected.id, note: noteText.trim(), created_by: user?.id || null });
        setNoteBusy(false);
        if (error) return toast.error(`${mc.noteAddFailed} ${error.message}`);
        setNoteText('');
        toast.success(mc.noteAdded);
        onRefresh();
    };

    const deleteNote = async (id: string) => {
        setNoteBusy(true);
        const { error } = await supabase.from('customer_notes').delete().eq('id', id);
        setNoteBusy(false);
        if (error) return toast.error(`${mc.noteDeleteFailed} ${error.message}`);
        if (editingNote?.id === id) setEditingNote(null);
        toast.success(mc.noteDeleted);
        onRefresh();
    };

    const saveNoteEdit = async () => {
        if (!editingNote || !editingNote.note.trim()) return;
        setNoteBusy(true);
        const { error } = await supabase.from('customer_notes').update({ note: editingNote.note.trim() }).eq('id', editingNote.id);
        setNoteBusy(false);
        if (error) return toast.error(`${mc.noteSaveFailed} ${error.message}`);
        setEditingNote(null);
        toast.success(mc.noteSaved);
        onRefresh();
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.customersTitle}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{enriched.length} {mc.accountsCount}</p>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                <th className="p-4">{mc.customerCol}</th>
                                <th className="p-4">{mc.phoneCol}</th>
                                <th className="p-4">{mc.segmentCol}</th>
                                <th className="p-4">{mc.totalSpent}</th>
                                <th className="p-4">{mc.purchasesCol}</th>
                                <th className="p-4">{mc.ordersCol}</th>
                                <th className="p-4">{mc.joinedCol}</th>
                                <th className="p-4">{mc.actionsCol}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enriched.slice(0, 50).map(p => (
                                <tr key={p.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/40 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{p.full_name || p.user_name || '—'}</p>
                                        <p className="text-xs text-zinc-500">{p.email || p.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{p.phone_number || '—'}</td>
                                    <td className="p-4">{segBadge(p.segment)}</td>
                                    <td className="p-4 text-white font-bold">{fmtCurrency(p.spend, 'USD')}</td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{p.total}</td>
                                    <td className="p-4 text-xs text-zinc-400 font-bold">{p.orderCount}</td>
                                    <td className="p-4 text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => setSelected(p)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase hover:bg-gold-500 hover:text-black transition-all">{mc.profileBtn}</button>
                                    </td>
                                </tr>
                            ))}
                            {enriched.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noCustomersFound}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-end">
                    <div className="w-full max-w-lg h-full bg-zinc-950 border-s border-zinc-800 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-white uppercase text-lg">{mc.customerProfile}</h2>
                            <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-white font-black text-lg">{selected.full_name || '—'}</p>
                                    {segBadge(segmentOf({ ...selected, spend: enriched.find(e => e.id === selected.id)?.spend || 0, total: enriched.find(e => e.id === selected.id)?.total || 0, orderCount: enriched.find(e => e.id === selected.id)?.orderCount || 0 }))}
                                </div>
                                <p className="text-sm text-zinc-400">{selected.email || '—'}</p>
                                {selected.phone_number && <p className="text-sm text-zinc-400" dir="ltr">{selected.phone_number}</p>}
                                <p className="text-xs text-zinc-500">{mc.roleLabel}: <span className="text-gold-500 font-bold uppercase">{selected.role}</span></p>
                                <p className="text-xs text-zinc-500">{mc.subLabel}: <span className="text-emerald-400 font-bold uppercase">{selected.subscription_status || 'none'}</span> · {selected.subscription_tier || '—'}</p>
                                <p className="text-xs text-zinc-500">{mc.premiumLabel}: {selected.has_paid ? <span className="text-green-400 font-bold">{mc.activeBadge}</span> : <span className="text-zinc-600">{mc.freeBadge}</span>}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{mc.orderHistory} ({selectedOrders.length})</p>
                                {selectedOrders.map(o => (
                                    <div key={o.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold text-white">#{o.id.slice(0, 8)} · {Array.isArray(o.items) ? o.items.length : o.status || '—'}</p>
                                            <p className="text-xs text-zinc-500">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</p>
                                        </div>
                                        <span className="text-xs font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</span>
                                    </div>
                                ))}
                                {selectedOrders.length === 0 && <p className="text-sm text-zinc-600 font-bold text-center py-6">{mc.noOrdersForCustomer}</p>}
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{mc.adminNotes} ({selectedNotes.length})</p>
                                <div className="flex gap-2">
                                    <textarea
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder={mc.addNotePlaceholder}
                                        rows={2}
                                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none resize-none"
                                    />
                                    <button
                                        onClick={addNote}
                                        disabled={noteBusy || !noteText.trim()}
                                        className="self-end px-3 py-2 rounded-lg bg-gold-500 text-black text-[11px] font-black uppercase hover:bg-gold-400 disabled:opacity-40 transition-all"
                                    >
                                        {mc.addNoteBtn}
                                    </button>
                                </div>
                                {selectedNotes.map(n => (
                                    <div key={n.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                                        {editingNote?.id === n.id ? (
                                            <>
                                                <textarea
                                                    value={editingNote.note}
                                                    onChange={e => setEditingNote({ ...editingNote, note: e.target.value })}
                                                    rows={3}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none resize-none"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={saveNoteEdit} disabled={noteBusy} className="px-3 py-1.5 rounded-lg bg-gold-500 text-black text-[10px] font-black uppercase hover:bg-gold-400 disabled:opacity-40 transition-all">{mc.saveChanges}</button>
                                                    <button onClick={() => setEditingNote(null)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase hover:bg-zinc-700 transition-all">{mc.cancelBtn}</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{n.note}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-[10px] text-zinc-600 font-bold">{new Date(n.created_at).toLocaleString()}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingNote(n)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-gold-500 transition-colors">{mc.editNote}</button>
                                                        <button onClick={() => deleteNote(n.id)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-500 transition-colors">{mc.deleteNote}</button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {selectedNotes.length === 0 && <p className="text-sm text-zinc-600 font-bold text-center py-3">{mc.noNotes}</p>}
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
const MessagesSection: React.FC<{ data: ReturnType<typeof useAdminData>; search: string; onRefresh: () => void; mc: MC }> = ({ data, search, onRefresh, mc }) => {
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
        if (error) return toast.error(`${mc.updateFailed} ${error.message}`);
        if (selected?.id === m.id) setSelected({ ...m, handled: !m.handled });
        toast.success(m.handled ? mc.markUnhandled : mc.markHandled);
        onRefresh();
    };

    const deleteMessage = async (id: string) => {
        setBusy(true);
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        setBusy(false);
        if (error) return toast.error(`${mc.deleteFailed} ${error.message}`);
        toast.success(mc.deletedSuccess);
        setSelected(null);
        onRefresh();
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.messagesTitle}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{filtered.filter(m => !m.handled).length} {mc.unreadCount} · {filtered.length}</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                                    <th className="p-4">{mc.fromCol}</th>
                                    <th className="p-4">{mc.typeCol}</th>
                                    <th className="p-4">{mc.subjectCol}</th>
                                    <th className="p-4">{mc.dateCol}</th>
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
                                {filtered.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-600 text-sm font-bold">{mc.noMessagesFound}</td></tr>}
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
                                    {selected.handled ? mc.handled : mc.unhandled}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">{selected.mission_type}</span>
                                {selected.order_id && <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-400">{mc.orderRef}: {selected.order_id}</span>}
                            </div>
                            <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
                                <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">{selected.subject}</p>
                                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-mono">{mc.receivedAt} {new Date(selected.created_at).toLocaleString()}</p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => toggleHandled(selected)}
                                    disabled={busy}
                                    className="flex-1 py-2.5 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50"
                                >
                                    {selected.handled ? mc.markUnhandled : mc.markHandled}
                                </button>
                                <button
                                    onClick={() => deleteMessage(selected.id)}
                                    disabled={busy}
                                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-black text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                                >{mc.deleteBtn}</button>
                            </div>
                            <a href={`mailto:${selected.email}`} className="block w-full py-2.5 rounded-xl bg-zinc-800 text-white font-black text-sm text-center hover:bg-zinc-700 transition-all">{mc.replyByEmail}</a>
                        </div>
                    ) : (
                        <div className="h-full min-h-[300px] flex items-center justify-center">
                            <p className="text-zinc-600 font-bold text-sm">{mc.selectMessageHint}</p>
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
const LogisticsSection: React.FC<{ data: ReturnType<typeof useAdminData>; mc: MC }> = ({ data, mc }) => {
    const [assigning, setAssigning] = useState(false);

    const activeDelegates = data.delegates.filter(d => d.status === 'active');
    const unassigned = data.orders.filter(o => !data.assignments.some(a => a.order_id === o.id));

    const assignOrder = async (orderId: string, delegateId: string) => {
        if (!delegateId) return;
        setAssigning(true);
        const { error } = await supabase.from('delivery_assignments').insert({ order_id: orderId, delegate_id: delegateId, status: 'assigned' });
        setAssigning(false);
        if (error) return toast.error(`${mc.assignmentFailed} ${error.message}`);
        toast.success(mc.assignmentSuccess);
        data.refresh();
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.logisticsTitle}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{mc.logisticsSubtitle} · {activeDelegates.length} {mc.activeUnits} · {unassigned.length} {mc.unassignedOrders}</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Delegates */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" /> {mc.activeUnits}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {data.delegates.map(d => (
                            <div key={d.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">{d.vehicle_type || mc.unit}</p>
                                        <p className="text-white font-black">{d.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${d.status === 'active' ? 'bg-green-500/10 text-green-400' : d.status === 'busy' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>{d.status}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 font-bold">{data.assignments.filter(a => a.delegate_id === d.id).length} {mc.activeRuns}</span>
                                    <span className="text-zinc-600 font-mono">{d.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                        {data.delegates.length === 0 && <div className="col-span-2 p-10 text-center text-zinc-600 font-bold text-sm">{mc.noDelegates}</div>}
                    </div>
                </div>

                {/* Unassigned orders */}
                <div className="space-y-3">
                    <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Package className="w-4 h-4 text-gold-500" /> {mc.unassignedOrders}</h2>
                    <div className="space-y-2">
                        {unassigned.slice(0, 20).map(o => (
                            <div key={o.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-white font-black">#{o.id.slice(0, 8)}</span><span className="text-gold-500 font-bold">{fmtCurrency(Number(o.amount || 0), 'USD')}</span></div>
                                <p className="text-xs text-zinc-500">{o.fullname || o.email || '—'} · {o.city}, {o.country}</p>
                                <select
                                    title={mc.assignDelegate}
                                    onChange={e => assignOrder(o.id, e.target.value)}
                                    disabled={assigning}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:border-gold-500 outline-none"
                                >
                                    <option value="">{mc.assignDelegate}...</option>
                                    {activeDelegates.map(d => <option key={d.id} value={d.id}>{d.id.slice(0, 6).toUpperCase()}</option>)}
                                </select>
                            </div>
                        ))}
                        {unassigned.length === 0 && <div className="p-10 text-center text-zinc-600 font-bold text-sm bg-zinc-900/40 border border-zinc-800 rounded-2xl">{mc.allOrdersAssigned}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   SETTINGS
   ════════════════════════════════════════════════════════════════════════ */
const SettingsSection: React.FC<{ data: ReturnType<typeof useAdminData>; mc: MC }> = ({ data, mc }) => {
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
        if (error) return toast.error(`${mc.saveFailed} ${error.message}`);
        toast.success(mc.savedSuccess);
        data.refresh();
    };

    const setVal = (key: string, value: string) => setLocal(prev => ({ ...prev, [key]: value }));

    const gatewayRow = (key: string, label: string) => (
        <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <span className="text-sm font-bold text-zinc-300">{label}</span>
            <select value={local[`gateway_${key}`] || 'disabled'} onChange={e => setVal(`gateway_${key}`, e.target.value)} className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:border-gold-500 outline-none">
                <option value="disabled">{mc.disabledState}</option>
                <option value="sandbox">{mc.sandboxState}</option>
                <option value="live">{mc.liveState}</option>
            </select>
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <header>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">{mc.settingsTitle}</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{mc.settingsSubtitle}</p>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Settings className="w-4 h-4 text-gold-500" /> {mc.generalSection}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">{mc.storeName}</label>
                        <input value={local['store_name'] || ''} onChange={e => setVal('store_name', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none" placeholder="Mr. X Steroid" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">{mc.baseCurrency}</label>
                        <select value={local['currency'] || 'USD'} onChange={e => setVal('currency', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none">
                            <option value="USD">USD</option>
                            <option value="EGP">EGP</option>
                        </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">{mc.supportEmail}</label>
                        <input value={local['support_email'] || ''} onChange={e => setVal('support_email', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold-500 outline-none" placeholder="support@mrxsteroid.com" />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-sm font-black text-white uppercase flex items-center gap-2"><Wallet className="w-4 h-4 text-gold-500" /> {mc.paymentGateways}</h2>
                {gatewayRow('stripe', `${mc.gatewayStripe} (Global)`)}
                {gatewayRow('paymob', `${mc.gatewayPaymob} (Egypt)`)}
                {gatewayRow('spaceremit', `${mc.gatewaySpaceRemit} (Global)`)}
            </div>

            <button
                onClick={saveAll}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gold-500 text-black font-black text-sm hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {mc.saveSettings}
            </button>
        </div>
    );
};

export default MissionControl;