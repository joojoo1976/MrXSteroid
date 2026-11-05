'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    ChevronRight,
    Crown,
    Database,
    FileText,
    HeartPulse,
    History as HistoryIcon,
    LayoutDashboard,
    LogOut,
    Menu,
    Monitor,
    RefreshCw,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    Sparkles,
    Target,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import { supabase } from '@/shared/lib/supabase';
import { getAvatarUrl } from '@/shared/lib/avatar-service';
import { adminCopy } from './admin-copy';

type AdminSection =
    | 'overview'
    | 'users'
    | 'smarttools'
    | 'activity'
    | 'reports'
    | 'health'
    | 'settings';

interface AdminNavItem {
    id: AdminSection;
    icon: LucideIcon;
}

const WORKSPACE_NAV: AdminNavItem[] = [
    { id: 'overview', icon: LayoutDashboard },
    { id: 'users', icon: Users },
    { id: 'smarttools', icon: Sparkles },
    { id: 'activity', icon: Activity },
    { id: 'reports', icon: FileText },
    { id: 'health', icon: HeartPulse },
    { id: 'settings', icon: Settings },
];

interface ProfileRow {
    id: string;
    full_name: string | null;
    user_name: string | null;
    email: string | null;
    role: string | null;
    subscription_status: string | null;
    subscription_tier: string | null;
    created_at: string | null;
}

interface HistoryRow {
    id: string;
    tool: string;
    title: string | null;
    created_at: string;
}

interface RegistryRow {
    sequence_number: number;
    slug: string;
    name_en: string | null;
    name_ar: string | null;
    is_active: boolean;
}

interface PaymentRow {
    id: string;
    amount: number | null;
    status: string | null;
    created_at: string;
}

interface MetricRow {
    [key: string]: unknown;
}

function SectionShell({ children }: { children: React.ReactNode }) {
    return <section className="animate-fadeIn">{children}</section>;
}

function KpiCard({ testId, label, value, hint, icon: Icon }: { testId: string; label: string; value: string | number; hint?: string; icon: LucideIcon }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-xl transition hover:border-gold-500/40">
            <div className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl transition group-hover:bg-gold-500/20" />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p data-testid={testId} className="mt-2 truncate text-2xl font-black tracking-tight text-foreground">{value}</p>
                    {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-500">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

function EmptyState({ testId, icon: Icon, title, description, action }: { testId?: string; icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
    return (
        <div data-testid={testId} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/10 text-gold-500">
                <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

export default function AdminDashboard() {
    const { user, profileData, signOut } = useAuth();
    const { language, isRTL, setLanguage } = usePreferences();
    const copy = adminCopy[language === 'ar' ? 'ar' : 'en'];

    const [activeSection, setActiveSection] = useState<AdminSection>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [profiles, setProfiles] = useState<ProfileRow[]>([]);
    const [history, setHistory] = useState<HistoryRow[]>([]);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [registry, setRegistry] = useState<RegistryRow[]>([]);
    const [metrics, setMetrics] = useState<MetricRow | null>(null);

    const [counts, setCounts] = useState({
        users: 0,
        results: 0,
        payments: 0,
        metrics: 0,
        admins: 0,
        activeSubs: 0,
    });

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [dbReachable, setDbReachable] = useState<boolean | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(false);

        const [profilesRes, historyRes, paymentsRes, registryRes, metricsRes] = await Promise.allSettled([
            supabase.from('profiles').select('id, full_name, user_name, email, role, subscription_status, subscription_tier, created_at').order('created_at', { ascending: false }).limit(50),
            supabase.from('calculator_history').select('id, tool, title, created_at').order('created_at', { ascending: false }).limit(20),
            supabase.from('payment_intents').select('id, amount, status, created_at').order('created_at', { ascending: false }).limit(20),
            supabase.from('tool_registry').select('sequence_number, slug, name_en, name_ar, is_active').order('sequence_number', { ascending: true }),
            supabase.from('admin_dashboard_metrics').select('*').limit(1).maybeSingle(),
        ]);

        let hasError = false;

        if (profilesRes.status === 'fulfilled') {
            const { data, error, count } = profilesRes.value as { data: ProfileRow[] | null; error: { message?: string } | null; count?: number | null };
            if (error) {
                hasError = true;
            } else {
                const rows = data || [];
                setProfiles(rows);
                setCounts((prev) => ({
                    ...prev,
                    users: count ?? rows.length,
                    admins: rows.filter((row) => row.role === 'admin').length,
                    activeSubs: rows.filter((row) => row.subscription_status === 'active').length,
                }));
            }
        } else {
            hasError = true;
        }

        if (historyRes.status === 'fulfilled') {
            const { data, error, count } = historyRes.value as { data: HistoryRow[] | null; error: { message?: string } | null; count?: number | null };
            if (error) {
                hasError = true;
            } else {
                setHistory(data || []);
                setCounts((prev) => ({ ...prev, results: count ?? (data?.length ?? 0) }));
            }
        } else {
            hasError = true;
        }

        if (paymentsRes.status === 'fulfilled') {
            const { data, error, count } = paymentsRes.value as { data: PaymentRow[] | null; error: { message?: string } | null; count?: number | null };
            if (error) {
                // Payment data is optional for admin visibility; do not mark the whole dashboard as failed.
                setPayments([]);
            } else {
                setPayments(data || []);
                setCounts((prev) => ({ ...prev, payments: count ?? (data?.length ?? 0) }));
            }
        }

        if (registryRes.status === 'fulfilled') {
            const { data, error } = registryRes.value as { data: RegistryRow[] | null; error: { message?: string } | null };
            if (error) {
                hasError = true;
            } else {
                setRegistry(data || []);
            }
        } else {
            hasError = true;
        }

        if (metricsRes.status === 'fulfilled') {
            const { data, error } = metricsRes.value as { data: MetricRow | null; error: { message?: string } | null };
            if (!error && data) {
                setMetrics(data);
                setCounts((prev) => ({ ...prev, metrics: 1 }));
            } else {
                setMetrics(null);
                setCounts((prev) => ({ ...prev, metrics: 0 }));
            }
        }

        setDbReachable(!hasError);
        setLoadError(hasError);
        setLoading(false);
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const displayName = profileData?.full_name?.trim() || profileData?.user_name?.trim() || user?.email?.split('@')[0] || 'Admin';
    const email = profileData?.email || user?.email || '';
    const avatarUrl = getAvatarUrl({ email, providerAvatarUrl: profileData?.avatar_url ?? undefined, size: 160 });

    const navigate = (section: AdminSection) => {
        setActiveSection(section);
        setSidebarOpen(false);
        setSearchQuery('');
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return profiles;
        return profiles.filter((row) =>
            `${row.full_name ?? ''} ${row.user_name ?? ''} ${row.email ?? ''} ${row.role ?? ''}`.toLowerCase().includes(query),
        );
    }, [profiles, searchQuery]);

    const filteredRegistry = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return registry;
        return registry.filter((row) =>
            `${row.slug} ${row.name_en ?? ''} ${row.name_ar ?? ''}`.toLowerCase().includes(query),
        );
    }, [registry, searchQuery]);

    const navButton = (item: AdminNavItem) => {
        const Icon = item.icon;
        const active = activeSection === item.id;
        return (
            <button
                key={item.id}
                type="button"
                data-testid={`admin-nav-${item.id}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                        ? 'border border-gold-500/30 bg-gold-500/15 text-gold-500 shadow-[0_0_24px_-10px_rgba(234,179,8,0.6)]'
                        : 'border border-transparent text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
            >
                <Icon className={`h-4 w-4 ${active ? 'text-gold-500' : 'text-muted-foreground group-hover:text-foreground'}`} aria-hidden="true" />
                <span className="truncate">{copy[item.id]}</span>
                {active ? <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold-500" /> : null}
            </button>
        );
    };

    const renderOverview = () => (
        <SectionShell>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-500">{copy.overview}</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{copy.welcome}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{copy.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate('users')} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40">
                        <Users className="h-4 w-4 text-gold-500" /> {copy.users}
                    </button>
                    <button type="button" onClick={() => navigate('reports')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2 text-sm font-black text-black transition hover:brightness-110">
                        <BarChart3 className="h-4 w-4" /> {copy.reports}
                    </button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <KpiCard testId="admin-kpi-users" label={copy.kpiUsers} value={counts.users} hint={copy.kpiUsersHint} icon={Users} />
                <KpiCard testId="admin-kpi-results" label={copy.kpiResults} value={counts.results} hint={copy.kpiResultsHint} icon={HistoryIcon} />
                <KpiCard testId="admin-kpi-payments" label={copy.kpiPayments} value={counts.payments} hint={copy.kpiPaymentsHint} icon={BarChart3} />
                <KpiCard testId="admin-kpi-metrics" label={copy.kpiMetrics} value={counts.metrics} hint={copy.kpiMetricsHint} icon={Database} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-foreground">{copy.recentUsers}</h3>
                            <button type="button" onClick={() => navigate('users')} className="inline-flex items-center gap-1 text-xs font-bold text-gold-500 hover:underline">
                                {copy.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {profiles.length === 0 ? (
                            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{copy.noUsers}</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-border">
                                {profiles.slice(0, 6).map((row) => (
                                    <li key={row.id} className="flex items-center gap-3 py-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                            <Users className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">{row.full_name || row.user_name || row.email || row.id}</p>
                                            <p className="truncate text-xs text-muted-foreground">{row.email || '—'}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.role === 'admin' ? 'bg-gold-500/15 text-gold-500' : 'bg-muted text-muted-foreground'}`}>
                                            {row.role || 'user'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-foreground">{copy.recentActivity}</h3>
                            <button type="button" onClick={() => navigate('activity')} className="inline-flex items-center gap-1 text-xs font-bold text-gold-500 hover:underline">
                                {copy.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {history.length === 0 ? (
                            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{copy.noActivity}</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-border">
                                {history.slice(0, 6).map((row) => (
                                    <li key={row.id} className="flex items-center gap-3 py-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                            <HistoryIcon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">{row.title || row.tool}</p>
                                            <p className="truncate text-xs text-muted-foreground">{row.tool}</p>
                                        </div>
                                        <time className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</time>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <img src={avatarUrl} alt="" className="h-12 w-12 rounded-xl border border-gold-500/30 object-cover" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                                <p className="truncate text-xs text-muted-foreground">{email}</p>
                            </div>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-lg border border-border bg-background/30 p-2.5">
                                <dt className="text-muted-foreground">{copy.kpiAdmins}</dt>
                                <dd className="mt-0.5 font-bold text-foreground">{counts.admins}</dd>
                            </div>
                            <div className="rounded-lg border border-border bg-background/30 p-2.5">
                                <dt className="text-muted-foreground">{copy.kpiActiveSubs}</dt>
                                <dd className="mt-0.5 font-bold text-foreground">{counts.activeSubs}</dd>
                            </div>
                        </dl>
                        <div className="mt-4 rounded-xl border border-border bg-background/30 p-3 text-xs">
                            <p className="font-semibold text-foreground">{copy.databaseStatus}</p>
                            <p className={`mt-1 font-bold ${dbReachable === false ? 'text-red-500' : 'text-emerald-500'}`}>
                                {dbReachable === false ? copy.databaseDown : copy.databaseUp}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <h3 className="text-sm font-bold text-foreground">{copy.platformHealth}</h3>
                        <p className="text-xs text-muted-foreground">{copy.platformHealthDesc}</p>
                        <ul className="mt-4 space-y-2 text-xs">
                            <li className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
                                <span className="text-muted-foreground">{copy.profilesTable}</span>
                                <span className="font-bold text-foreground">{counts.users}</span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
                                <span className="text-muted-foreground">{copy.historyTable}</span>
                                <span className="font-bold text-foreground">{counts.results}</span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
                                <span className="text-muted-foreground">{copy.paymentsTable}</span>
                                <span className="font-bold text-foreground">{counts.payments}</span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2">
                                <span className="text-muted-foreground">{copy.metricsTable}</span>
                                <span className="font-bold text-foreground">{counts.metrics}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </SectionShell>
    );

    const renderUsers = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
                <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground">{copy.users}</h2>
                        <p className="text-sm text-muted-foreground">{copy.usersDesc}</p>
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={copy.searchUsers}
                            aria-label={copy.searchUsers}
                            className="w-full rounded-xl border border-border bg-card/60 py-2 pe-3 ps-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-gold-500/50 sm:w-64"
                        />
                    </div>
                </div>
                {filteredUsers.length === 0 ? (
                    <div className="p-5">
                        <EmptyState testId="admin-users-empty" icon={Users} title={copy.noUsers} description={copy.noUsersDesc} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-border bg-background/30 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnUser}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnRole}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnSubscription}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnJoined}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((row) => (
                                    <tr key={row.id} className="hover:bg-background/20">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-xs font-bold text-gold-500">
                                                    {(row.full_name || row.email || '?').slice(0, 2).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-foreground">{row.full_name || row.user_name || copy.unnamed}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{row.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.role === 'admin' ? 'bg-gold-500/15 text-gold-500' : 'bg-muted text-muted-foreground'}`}>
                                                {row.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">{row.subscription_status || 'inactive'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </SectionShell>
    );

    const renderSmartTools = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
                <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground">{copy.smartTools}</h2>
                        <p className="text-sm text-muted-foreground">{copy.smartToolsDesc}</p>
                    </div>
                    <div className="relative">
                        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={copy.searchTools}
                            aria-label={copy.searchTools}
                            className="w-full rounded-xl border border-border bg-card/60 py-2 pe-3 ps-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-gold-500/50 sm:w-64"
                        />
                    </div>
                </div>
                {filteredRegistry.length === 0 ? (
                    <div className="p-5">
                        <EmptyState testId="admin-tools-empty" icon={Sparkles} title={copy.noTools} description={copy.noToolsDesc} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-border bg-background/30 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnSequence}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnSlug}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnName}</th>
                                    <th className="px-4 py-3 text-start font-semibold">{copy.columnStatus}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredRegistry.map((row) => (
                                    <tr key={row.slug} className="hover:bg-background/20">
                                        <td className="px-4 py-3 font-mono text-foreground">{row.sequence_number}</td>
                                        <td className="px-4 py-3 text-foreground">{row.slug}</td>
                                        <td className="px-4 py-3 text-foreground">{language === 'ar' ? row.name_ar || row.name_en : row.name_en || row.name_ar || row.slug}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.is_active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                                {row.is_active ? copy.active : copy.inactive}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-border p-4 text-xs text-muted-foreground">
                    {copy.registryNote}
                </div>
            </div>
        </SectionShell>
    );

    const renderActivity = () => (
        <SectionShell>
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                    <h2 className="text-lg font-black text-foreground">{copy.recentActivity}</h2>
                    <p className="text-sm text-muted-foreground">{copy.activityDesc}</p>
                    {history.length === 0 ? (
                        <div className="mt-4">
                            <EmptyState testId="admin-activity-empty" icon={Activity} title={copy.noActivity} description={copy.noActivityDesc} />
                        </div>
                    ) : (
                        <ul className="mt-4 divide-y divide-border">
                            {history.map((row) => (
                                <li key={row.id} className="flex items-center gap-3 py-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                        <Activity className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">{row.title || row.tool}</p>
                                        <p className="truncate text-xs text-muted-foreground">{row.tool}</p>
                                    </div>
                                    <time className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</time>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                    <h2 className="text-lg font-black text-foreground">{copy.paymentsActivity}</h2>
                    <p className="text-sm text-muted-foreground">{copy.paymentsDesc}</p>
                    {payments.length === 0 ? (
                        <div className="mt-4">
                            <EmptyState testId="admin-payments-empty" icon={BarChart3} title={copy.noPayments} description={copy.noPaymentsDesc} />
                        </div>
                    ) : (
                        <ul className="mt-4 divide-y divide-border">
                            {payments.map((row) => (
                                <li key={row.id} className="flex items-center gap-3 py-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                        <BarChart3 className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">{row.status || '—'}</p>
                                        <p className="truncate text-xs text-muted-foreground">{row.id}</p>
                                    </div>
                                    <span className="text-xs font-bold text-foreground">{row.amount ?? '—'}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </SectionShell>
    );

    const renderReports = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                <h2 className="text-lg font-black text-foreground">{copy.reports}</h2>
                <p className="text-sm text-muted-foreground">{copy.reportsDesc}</p>
                {metrics ? (
                    <pre className="mt-4 overflow-auto rounded-xl border border-border bg-background/40 p-4 text-xs text-foreground">
                        {JSON.stringify(metrics, null, 2)}
                    </pre>
                ) : (
                    <div className="mt-4">
                        <EmptyState testId="admin-reports-empty" icon={FileText} title={copy.noMetrics} description={copy.noMetricsDesc} />
                    </div>
                )}
            </div>
        </SectionShell>
    );

    const renderHealth = () => (
        <SectionShell>
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                    <h2 className="text-lg font-black text-foreground">{copy.platformHealth}</h2>
                    <p className="text-sm text-muted-foreground">{copy.platformHealthDesc}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.databaseStatus}</span>
                            <span className={`font-bold ${dbReachable === false ? 'text-red-500' : 'text-emerald-500'}`}>
                                {dbReachable === false ? copy.databaseDown : copy.databaseUp}
                            </span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.supabaseHost}</span>
                            <span className="font-mono text-xs text-foreground">alghvtpkpspnqupbvodu.supabase.co</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.environment}</span>
                            <span className="font-bold text-foreground">{process.env.NODE_ENV || 'production'}</span>
                        </li>
                    </ul>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                    <h2 className="text-lg font-black text-foreground">{copy.countsTitle}</h2>
                    <p className="text-sm text-muted-foreground">{copy.countsDesc}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.profilesTable}</span>
                            <span className="font-bold text-foreground">{counts.users}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.historyTable}</span>
                            <span className="font-bold text-foreground">{counts.results}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.paymentsTable}</span>
                            <span className="font-bold text-foreground">{counts.payments}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl border border-border bg-background/30 px-4 py-3">
                            <span className="text-muted-foreground">{copy.registryTable}</span>
                            <span className="font-bold text-foreground">{registry.length}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </SectionShell>
    );

    const renderSettings = () => (
        <SectionShell>
            <div className="max-w-3xl rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-black text-foreground">{copy.settings}</h2>
                <p className="text-sm text-muted-foreground">{copy.settingsDesc}</p>
                <ul className="mt-5 space-y-3 text-sm">
                    <li className="rounded-xl border border-border bg-background/30 px-4 py-3">
                        <p className="font-semibold text-foreground">{copy.readOnlyNote}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{copy.readOnlyDesc}</p>
                    </li>
                    <li className="rounded-xl border border-border bg-background/30 px-4 py-3">
                        <p className="font-semibold text-foreground">{copy.securityNote}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{copy.securityDesc}</p>
                    </li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40">
                        <ArrowUpRight className="h-4 w-4 text-gold-500" /> {copy.backToSite}
                    </Link>
                    <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/20">
                        <LogOut className="h-4 w-4" /> {copy.signOut}
                    </button>
                </div>
            </div>
        </SectionShell>
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'users':
                return renderUsers();
            case 'smarttools':
                return renderSmartTools();
            case 'activity':
                return renderActivity();
            case 'reports':
                return renderReports();
            case 'health':
                return renderHealth();
            case 'settings':
                return renderSettings();
            case 'overview':
            default:
                return renderOverview();
        }
    };

    const sectionTitle = copy[activeSection];

    return (
        <div data-testid="admin-dashboard-root" dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 end-0 h-96 w-96 rounded-full bg-gold-500/10 blur-[130px]" />
                <div className="absolute bottom-0 start-0 h-80 w-80 rounded-full bg-amber-500/5 blur-[110px]" />
            </div>

            {sidebarOpen ? (
                <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
            ) : null}

            <div className="relative flex min-h-screen">
                <aside className={`fixed inset-y-0 start-0 z-50 flex w-72 shrink-0 flex-col border-e border-border bg-card/80 backdrop-blur-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}>
                    <div className="flex items-center gap-3 border-b border-border px-5 py-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 text-sm font-black text-black shadow-lg shadow-gold-500/20">
                            AD
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black tracking-[0.18em] text-foreground">{copy.brand}</p>
                            <p className="truncate text-[11px] font-semibold text-gold-500">{copy.brandSub}</p>
                        </div>
                        <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                        <div>
                            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">{copy.navGroup}</p>
                            <div className="space-y-1">{WORKSPACE_NAV.map(navButton)}</div>
                        </div>
                    </nav>

                    <div className="border-t border-border p-3">
                        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground">
                            <ArrowUpRight className={`h-4 w-4 ${isRTL ? 'rotate-90' : ''}`} /> {copy.backToSite}
                        </Link>
                        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10">
                            <LogOut className="h-4 w-4" /> {copy.signOut}
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
                        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-6 xl:px-8">
                            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 text-foreground lg:hidden">
                                <Menu className="h-5 w-5" />
                            </button>

                            <div className="min-w-0">
                                <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-gold-500">{copy.brand}</p>
                                <h1 className="truncate text-lg font-black tracking-tight text-foreground">{sectionTitle}</h1>
                            </div>

                            <div className="ms-auto flex items-center gap-2">
                                <div className="relative hidden md:block">
                                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                    <input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder={copy.searchPlaceholder}
                                        aria-label={copy.searchPlaceholder}
                                        className="w-56 rounded-xl border border-border bg-card/60 py-2 pe-3 ps-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:w-72 focus:border-gold-500/50"
                                    />
                                </div>

                                <button type="button" onClick={() => setLanguage(language === 'ar' ? Language.EN : Language.AR)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 text-xs font-black text-foreground transition hover:border-gold-500/40" aria-label={copy.language}>
                                    <Shield className="h-4 w-4 text-gold-500" />
                                    {language === 'ar' ? 'EN' : 'AR'}
                                </button>

                                <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 py-1 pe-3 ps-1">
                                    <img src={avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                    <span className="hidden max-w-[140px] truncate text-xs font-bold text-foreground sm:block">{displayName}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto w-full max-w-[1500px] px-4 py-5 md:px-6 md:py-6 xl:px-8">
                        {loadError ? (
                            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-300">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold">{copy.errorTitle}</p>
                                    <p className="text-xs opacity-80">{copy.errorDesc}</p>
                                </div>
                                <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-bold">
                                    <RefreshCw className="h-3.5 w-3.5" /> {copy.retry}
                                </button>
                            </div>
                        ) : null}

                        {loading ? (
                            <div className="space-y-4" aria-busy="true" aria-live="polite">
                                <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
                                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                    {[0, 1, 2, 3].map((key) => (
                                        <div key={key} className="h-28 animate-pulse rounded-2xl border border-border bg-card/40" />
                                    ))}
                                </div>
                                <div className="h-72 animate-pulse rounded-2xl border border-border bg-card/40" />
                                <span className="sr-only">{copy.loading}</span>
                            </div>
                        ) : (
                            renderSection()
                        )}
                    </main>

                    <footer className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6 xl:px-8">
                        <span>{copy.brand} · {copy.brandSub}</span>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" /> {copy.privateNote}
                        </span>
                    </footer>
                </div>
            </div>
        </div>
    );
}
