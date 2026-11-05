'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    Calculator,
    CheckCircle2,
    ChevronRight,
    Crown,
    Droplets,
    Dumbbell,
    FileText,
    Flame,
    FlaskConical,
    HeartPulse,
    History as HistoryIcon,
    LayoutDashboard,
    Languages,
    LogOut,
    Menu,
    Monitor,
    Moon,
    Pill,
    RefreshCw,
    Ruler,
    Save,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    Sparkles,
    Sun,
    Target,
    Timer,
    Trash2,
    TrendingUp,
    User,
    Utensils,
    X,
    type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { Language, Theme } from '@/shared/types/types';
import { supabase } from '@/shared/lib/supabase';
import { deleteCalculatorHistory, getCalculatorHistory } from '@/shared/lib/calculator-history';
import { getAvatarUrl } from '@/shared/lib/avatar-service';
import { dashboardCopy } from './dashboard-copy';
import {
    buildWeeklyActivity,
    countThisWeek,
    countUniqueTools,
    formatDateTime,
    formatMemberSince,
    groupToolUsage,
    isNutritionOrTrainingTool,
    phaseFromCustomGoals,
    PHASE_KEYS,
    type DashboardHistoryRow,
    type PhaseKey,
} from './dashboard-utils';

type DashboardSection =
    | 'overview'
    | 'profile'
    | 'smarttools'
    | 'history'
    | 'reports'
    | 'goals'
    | 'training'
    | 'preferences';

interface NavItem {
    id: DashboardSection;
    icon: LucideIcon;
}

const WORKSPACE_NAV: NavItem[] = [
    { id: 'overview', icon: LayoutDashboard },
    { id: 'smarttools', icon: Sparkles },
    { id: 'history', icon: HistoryIcon },
    { id: 'reports', icon: FileText },
    { id: 'training', icon: Dumbbell },
    { id: 'goals', icon: Target },
];

const ACCOUNT_NAV: NavItem[] = [
    { id: 'profile', icon: User },
    { id: 'preferences', icon: Settings },
];

interface ToolEntry {
    titleEn: string;
    titleAr: string;
    categoryEn: string;
    categoryAr: string;
    href: string;
    icon: LucideIcon;
}

const TOOLS: ToolEntry[] = [
    { titleEn: 'Adaptive Macro Calculator', titleAr: 'حاسبة الماكروز التكيفية', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/nutrition/macro', icon: Calculator },
    { titleEn: 'Calorie Adjuster', titleAr: 'ضبط السعرات', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/tool-012-calorie-adjuster', icon: Flame },
    { titleEn: 'Protein Needs', titleAr: 'احتياج البروتين', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/nutrition/protein-needs', icon: Utensils },
    { titleEn: 'Water Intake', titleAr: 'احتياج الماء', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/nutrition/water-intake', icon: Droplets },
    { titleEn: 'BMR & TDEE', titleAr: 'معدل الأيض', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/nutrition/bmr-tdee', icon: BarChart3 },
    { titleEn: 'Bloodwork Analyzer', titleAr: 'تحليل التحاليل', categoryEn: 'Health', categoryAr: 'الصحة', href: '/smarttools/tool-007-bloodwork-analyzer', icon: HeartPulse },
    { titleEn: 'Estrogen & Prolactin', titleAr: 'الإستروجين والبرولاكتين', categoryEn: 'Health', categoryAr: 'الصحة', href: '/smarttools/tool-006-estrogen-prolactin', icon: FlaskConical },
    { titleEn: 'Progress Tracker', titleAr: 'متابعة التقدم', categoryEn: 'Training', categoryAr: 'التدريب', href: '/smarttools/tool-011-progress-tracker', icon: TrendingUp },
    { titleEn: 'Injection Schedule', titleAr: 'جدول الحقن', categoryEn: 'Protocol', categoryAr: 'البروتوكول', href: '/smarttools/tool-036-injection-schedule', icon: CalendarDays },
    { titleEn: 'Aromatization Risk', titleAr: 'خطر الأروماتيزيشن', categoryEn: 'Protocol', categoryAr: 'البروتوكول', href: '/smarttools/aromatization-risk', icon: Shield },
    { titleEn: 'PCT Timing', titleAr: 'توقيت PCT', categoryEn: 'Protocol', categoryAr: 'البروتوكول', href: '/smarttools/pct-timing', icon: Timer },
    { titleEn: 'HCG / SERM Protocol', titleAr: 'بروتوكول HCG/SERM', categoryEn: 'Protocol', categoryAr: 'البروتوكول', href: '/smarttools/hcg-serm-protocol', icon: Pill },
    { titleEn: 'AI Safety Gate', titleAr: 'بوابة السلامة الذكية', categoryEn: 'Safety', categoryAr: 'السلامة', href: '/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol', icon: ShieldCheck },
    { titleEn: 'Macro Optimizer', titleAr: 'محسّن الماكروز', categoryEn: 'Nutrition', categoryAr: 'التغذية', href: '/smarttools/tool-013-macro-optimizer', icon: Activity },
];

const PHASE_FALLBACK = 'cutting';

function SectionShell({ children }: { children: React.ReactNode }) {
    return <section className="animate-fadeIn">{children}</section>;
}

interface KpiCardProps {
    testId: string;
    label: string;
    value: string | number;
    hint?: string;
    icon: LucideIcon;
}

function KpiCard({ testId, label, value, hint, icon: Icon }: KpiCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-xl transition hover:border-gold-500/40">
            <div className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl transition group-hover:bg-gold-500/20" />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {label}
                    </p>
                    <p data-testid={testId} className="mt-2 truncate text-2xl font-black tracking-tight text-foreground">
                        {value}
                    </p>
                    {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-500">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

interface EmptyStateProps {
    testId?: string;
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

function EmptyState({ testId, icon: Icon, title, description, action }: EmptyStateProps) {
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

export default function UserDashboard() {
    const { user, profileData, signOut } = useAuth();
    const { language, isRTL, unitSystem, theme, setLanguage, setUnitSystem, setTheme } = usePreferences();
    const copy = dashboardCopy[language === 'ar' ? 'ar' : 'en'];

    const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [history, setHistory] = useState<DashboardHistoryRow[]>([]);
    const [notes, setNotes] = useState('');
    const [phase, setPhase] = useState<PhaseKey>(PHASE_FALLBACK);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [savingGoals, setSavingGoals] = useState(false);

    const loadDashboard = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setLoadError(false);

        const [snapshotResult, historyResult] = await Promise.allSettled([
            supabase
                .from('user_dashboard_data')
                .select('saved_notes, custom_goals, updated_at')
                .eq('user_id', user.id)
                .maybeSingle(),
            getCalculatorHistory(60),
        ]);

        if (snapshotResult.status === 'fulfilled') {
            const { data, error } = snapshotResult.value;
            if (error) {
                setLoadError(true);
            } else if (data) {
                const row = data as {
                    saved_notes?: string | null;
                    custom_goals?: unknown;
                    updated_at?: string | null;
                };
                setNotes(row.saved_notes ?? '');
                setPhase(phaseFromCustomGoals(row.custom_goals));
                setUpdatedAt(row.updated_at ?? null);
            }
        } else {
            setLoadError(true);
        }

        if (historyResult.status === 'fulfilled') {
            setHistory(historyResult.value as DashboardHistoryRow[]);
        } else {
            setLoadError(true);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const weekly = useMemo(() => buildWeeklyActivity(history, language), [history, language]);
    const weekCount = useMemo(() => countThisWeek(history), [history]);
    const toolsUsed = useMemo(() => countUniqueTools(history), [history]);
    const usage = useMemo(() => groupToolUsage(history), [history]);
    const trainingRows = useMemo(
        () => history.filter((row) => isNutritionOrTrainingTool(`${row.tool} ${row.title ?? ''}`)),
        [history],
    );

    const displayName =
        profileData?.full_name?.trim() ||
        profileData?.user_name?.trim() ||
        user?.email?.split('@')[0] ||
        copy.welcomeFallback;
    const firstName = displayName.split(/\s+/)[0];
    const email = profileData?.email || user?.email || '';
    const avatarUrl = getAvatarUrl({ email, providerAvatarUrl: profileData?.avatar_url ?? undefined, size: 160 });

    const phaseLabel = copy.phases[phase];
    const subscriptionLabel = profileData?.subscription_status === 'active' ? copy.active : copy.inactive;

    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];
        return TOOLS.filter((tool) =>
            `${tool.titleEn} ${tool.titleAr} ${tool.categoryEn} ${tool.categoryAr}`.toLowerCase().includes(query),
        ).slice(0, 6);
    }, [searchQuery]);

    const navigate = (section: DashboardSection) => {
        setActiveSection(section);
        setSidebarOpen(false);
        setSearchQuery('');
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSaveGoals = async () => {
        if (!user) return;
        setSavingGoals(true);
        try {
            const timestamp = new Date().toISOString();
            const { error } = await supabase
                .from('user_dashboard_data')
                .upsert(
                    {
                        user_id: user.id,
                        saved_notes: notes,
                        custom_goals: { currentPhase: phase },
                        updated_at: timestamp,
                    },
                    { onConflict: 'user_id' },
                );

            if (error) throw error;
            setUpdatedAt(timestamp);
            toast.success(copy.goalsSaved);
        } catch {
            toast.error(copy.goalsSaveError);
        } finally {
            setSavingGoals(false);
        }
    };

    const handleDeleteHistory = async (id: string) => {
        const deleted = await deleteCalculatorHistory(id);
        if (deleted) {
            setHistory((rows) => rows.filter((row) => row.id !== id));
            toast.success(copy.deleteSuccess);
        } else {
            toast.error(copy.deleteError);
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const sectionTitle = copy[activeSection];

    const navButton = (item: NavItem) => {
        const Icon = item.icon;
        const active = activeSection === item.id;
        return (
            <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
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
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {copy.welcome}, {firstName}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{copy.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('history')}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40"
                    >
                        <HistoryIcon className="h-4 w-4 text-gold-500" /> {copy.quickHistory}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('goals')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2 text-sm font-black text-black transition hover:brightness-110"
                    >
                        <Target className="h-4 w-4" /> {copy.quickGoals}
                    </button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <KpiCard testId="kpi-saved-results" label={copy.kpiSavedResults} value={history.length} hint={copy.historyDesc} icon={HistoryIcon} />
                <KpiCard testId="kpi-tools-used" label={copy.kpiToolsUsed} value={toolsUsed} hint={copy.toolUsageDesc} icon={Sparkles} />
                <KpiCard testId="kpi-this-week" label={copy.kpiThisWeek} value={weekCount} hint={copy.activityDesc} icon={TrendingUp} />
                <KpiCard testId="kpi-current-phase" label={copy.kpiCurrentPhase} value={phaseLabel} hint={updatedAt ? `${copy.lastUpdated}: ${formatDateTime(updatedAt, language)}` : copy.noData} icon={Target} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">{copy.activityTitle}</h3>
                                <p className="text-xs text-muted-foreground">{copy.activityDesc}</p>
                            </div>
                            <span className="rounded-lg border border-border bg-background/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                7D
                            </span>
                        </div>
                        {weekCount === 0 ? (
                            <p className="mt-8 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                {copy.noActivity}
                            </p>
                        ) : (
                            <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label={copy.activityTitle}>
                                {weekly.map((bucket) => {
                                    const max = Math.max(...weekly.map((entry) => entry.count), 1);
                                    const height = Math.max(6, Math.round((bucket.count / max) * 100));
                                    return (
                                        <div key={bucket.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                            <span className="text-[10px] font-bold text-gold-500">{bucket.count}</span>
                                            <div className="flex h-32 w-full items-end">
                                                <div
                                                    className="w-full rounded-t-lg bg-gradient-to-t from-gold-600/30 via-gold-500/70 to-amber-300 transition-all"
                                                    style={{ height: `${height}%` }}
                                                    title={`${bucket.label}: ${bucket.count}`}
                                                />
                                            </div>
                                            <span className="truncate text-[10px] text-muted-foreground">{bucket.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-foreground">{copy.recentActivity}</h3>
                            {history.length > 0 ? (
                                <button type="button" onClick={() => navigate('history')} className="inline-flex items-center gap-1 text-xs font-bold text-gold-500 hover:underline">
                                    {copy.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            ) : null}
                        </div>
                        {history.length === 0 ? (
                            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                                {copy.emptyHistoryDesc}
                            </p>
                        ) : (
                            <ul className="mt-3 divide-y divide-border">
                                {history.slice(0, 5).map((row) => (
                                    <li key={row.id} className="flex items-center gap-3 py-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                            <Calculator className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">{row.title || row.tool}</p>
                                            <p className="truncate text-xs text-muted-foreground">{formatDateTime(row.created_at, language)}</p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
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
                                <dt className="text-muted-foreground">{copy.subscription}</dt>
                                <dd className={`mt-0.5 font-bold ${profileData?.subscription_status === 'active' ? 'text-emerald-500' : 'text-gold-500'}`}>{subscriptionLabel}</dd>
                            </div>
                            <div className="rounded-lg border border-border bg-background/30 p-2.5">
                                <dt className="text-muted-foreground">{copy.memberSince}</dt>
                                <dd className="mt-0.5 font-bold text-foreground">{formatMemberSince(profileData?.created_at, language)}</dd>
                            </div>
                        </dl>
                        <button type="button" onClick={() => navigate('profile')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:border-gold-500/40">
                            <User className="h-4 w-4 text-gold-500" /> {copy.profile}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                        <h3 className="text-sm font-bold text-foreground">{copy.toolUsageTitle}</h3>
                        <p className="text-xs text-muted-foreground">{copy.toolUsageDesc}</p>
                        {usage.length === 0 ? (
                            <p className="mt-4 text-xs text-muted-foreground">{copy.noToolUsage}</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {usage.map((group) => {
                                    const max = Math.max(...usage.map((entry) => entry.count), 1);
                                    return (
                                        <li key={group.tool}>
                                            <div className="flex items-center justify-between gap-2 text-xs">
                                                <span className="truncate font-semibold text-foreground">{group.label}</span>
                                                <span className="text-muted-foreground">{group.count}</span>
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-amber-300" style={{ width: `${Math.round((group.count / max) * 100)}%` }} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </SectionShell>
    );

    const renderProfile = () => (
        <SectionShell>
            <div className="max-w-3xl space-y-4">
                <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <img src={avatarUrl} alt="" className="h-20 w-20 rounded-2xl border-2 border-gold-500/40 object-cover" />
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-black text-foreground">{displayName}</h2>
                            <p data-testid="profile-email" className="truncate text-sm text-muted-foreground">{email || copy.notProvided}</p>
                            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-[11px] font-bold text-gold-500">
                                <Crown className="h-3 w-3" /> {subscriptionLabel}
                            </span>
                        </div>
                    </div>

                    <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.email}</dt>
                            <dd className="mt-1 break-all text-sm font-semibold text-foreground">{email || copy.notProvided}</dd>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.phone}</dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">{profileData?.phone_number || copy.notProvided}</dd>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.subscriptionStatus}</dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">{subscriptionLabel}</dd>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.memberSince}</dt>
                            <dd className="mt-1 text-sm font-semibold text-foreground">{formatMemberSince(profileData?.created_at, language)}</dd>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.role}</dt>
                            <dd className="mt-1 text-sm font-semibold capitalize text-foreground">{profileData?.role || 'user'}</dd>
                        </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2 text-sm font-black text-black transition hover:brightness-110">
                            {copy.manageProfile} <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <Link href="/reset-password" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40">
                            {copy.resetPassword}
                        </Link>
                    </div>
                </div>

                <p className="rounded-xl border border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
                    <ShieldCheck className="me-1.5 inline h-3.5 w-3.5 text-gold-500" /> {copy.privateNote}
                </p>
            </div>
        </SectionShell>
    );

    const renderSmartTools = () => (
        <SectionShell>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-black text-foreground">{copy.smartToolsTitle}</h2>
                    <p className="text-sm text-muted-foreground">{copy.smartToolsDesc}</p>
                </div>
                <div className="relative">
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={copy.searchPlaceholder}
                        aria-label={copy.searchPlaceholder}
                        className="w-full rounded-xl border border-border bg-card/60 py-2 pe-3 ps-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-gold-500/50 sm:w-64"
                    />
                </div>
            </div>
            {searchResults.length === 0 && searchQuery.trim() ? (
                <EmptyState icon={Search} title={copy.noSearchResults} description={copy.searchPlaceholder} />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(searchQuery.trim() ? searchResults : TOOLS).map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 transition hover:border-gold-500/40 hover:bg-card"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-foreground">{language === 'ar' ? tool.titleAr : tool.titleEn}</p>
                                    <p className="truncate text-xs text-muted-foreground">{language === 'ar' ? tool.categoryAr : tool.categoryEn}</p>
                                </div>
                                <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-gold-500 ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </SectionShell>
    );

    const renderHistory = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                    <div>
                        <h2 className="text-lg font-black text-foreground">{copy.historyTitle}</h2>
                        <p className="text-sm text-muted-foreground">{copy.historyDesc}</p>
                    </div>
                    <span className="rounded-lg border border-border bg-background/40 px-2.5 py-1 text-xs font-bold text-muted-foreground">
                        {history.length}
                    </span>
                </div>
                {history.length === 0 ? (
                    <div className="p-5">
                        <EmptyState
                            testId="empty-history"
                            icon={HistoryIcon}
                            title={copy.emptyHistoryTitle}
                            description={copy.emptyHistoryDesc}
                            action={
                                <Link href="/smarttools" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2 text-sm font-black text-black">
                                    {copy.browseTools} <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            }
                        />
                    </div>
                ) : (
                    <ul data-testid="history-list" className="divide-y divide-border">
                        {history.map((row) => (
                            <li key={row.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-foreground">{row.title || row.tool}</p>
                                    <p className="truncate text-xs text-muted-foreground">{row.tool}</p>
                                </div>
                                <time className="text-xs text-muted-foreground" dateTime={row.created_at}>
                                    {formatDateTime(row.created_at, language)}
                                </time>
                                <button
                                    type="button"
                                    onClick={() => void handleDeleteHistory(row.id)}
                                    aria-label={`${copy.delete}: ${row.title || row.tool}`}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-red-500/40 hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </SectionShell>
    );

    const renderReports = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                <h2 className="text-lg font-black text-foreground">{copy.reportsTitle}</h2>
                <p className="text-sm text-muted-foreground">{copy.reportsDesc}</p>
                <div className="mt-4">
                    <EmptyState
                        testId="reports-empty"
                        icon={FileText}
                        title={copy.reportsEmptyTitle}
                        description={copy.reportsEmptyDesc}
                        action={
                            <Link href="/smarttools" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40">
                                {copy.browseTools} <ArrowUpRight className="h-4 w-4 text-gold-500" />
                            </Link>
                        }
                    />
                </div>
            </div>
        </SectionShell>
    );

    const renderGoals = () => (
        <SectionShell>
            <div className="max-w-2xl rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-black text-foreground">{copy.goalsTitle}</h2>
                <p className="text-sm text-muted-foreground">{copy.goalsDesc}</p>

                <div className="mt-5 grid gap-2">
                    <label htmlFor="goal-phase" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {copy.phaseLabel}
                    </label>
                    <select
                        id="goal-phase"
                        data-testid="goal-phase"
                        value={phase}
                        onChange={(event) => setPhase(event.target.value as PhaseKey)}
                        className="rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-gold-500/50"
                    >
                        {PHASE_KEYS.map((key) => (
                            <option key={key} value={key}>
                                {copy.phases[key]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 grid gap-2">
                    <label htmlFor="goal-notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {copy.notesLabel}
                    </label>
                    <textarea
                        id="goal-notes"
                        data-testid="goal-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={5}
                        placeholder={copy.notesPlaceholder}
                        className="resize-y rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-500/50"
                    />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        data-testid="save-goals"
                        onClick={() => void handleSaveGoals()}
                        disabled={savingGoals}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2.5 text-sm font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" /> {savingGoals ? copy.saving : copy.save}
                    </button>
                    {updatedAt ? (
                        <span className="text-xs text-muted-foreground">
                            {copy.lastUpdated}: {formatDateTime(updatedAt, language)}
                        </span>
                    ) : null}
                </div>
            </div>
        </SectionShell>
    );

    const renderTraining = () => (
        <SectionShell>
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
                <h2 className="text-lg font-black text-foreground">{copy.trainingTitle}</h2>
                <p className="text-sm text-muted-foreground">{copy.trainingDesc}</p>
                {trainingRows.length === 0 ? (
                    <div className="mt-4">
                        <EmptyState
                            icon={Dumbbell}
                            title={copy.trainingEmptyTitle}
                            description={copy.trainingEmptyDesc}
                            action={
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Link href="/smarttools/nutrition/macro" className="rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 px-4 py-2 text-sm font-black text-black">
                                        {language === 'ar' ? 'حاسبة الماكروز' : 'Macro Calculator'}
                                    </Link>
                                    <Link href="/smarttools/tool-011-progress-tracker" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
                                        {language === 'ar' ? 'متابعة التقدم' : 'Progress Tracker'}
                                    </Link>
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <ul className="mt-4 divide-y divide-border">
                        {trainingRows.map((row) => (
                            <li key={row.id} className="flex items-center gap-3 py-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10 text-gold-500">
                                    <Activity className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">{row.title || row.tool}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateTime(row.created_at, language)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </SectionShell>
    );

    const renderPreferences = () => (
        <SectionShell>
            <div className="grid max-w-3xl gap-4">
                <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
                    <h2 className="text-lg font-black text-foreground">{copy.prefsTitle}</h2>
                    <p className="text-sm text-muted-foreground">{copy.prefsDesc}</p>

                    <div className="mt-5 grid gap-5">
                        <div>
                            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Languages className="h-4 w-4 text-gold-500" /> {copy.language}
                            </p>
                            <div className="inline-flex rounded-xl border border-border bg-background/40 p-1">
                                {[
                                    { value: Language.EN, label: 'English' },
                                    { value: Language.AR, label: 'العربية' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setLanguage(option.value)}
                                        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${
                                            language === option.value ? 'bg-gold-500 text-black' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Ruler className="h-4 w-4 text-gold-500" /> {copy.units}
                            </p>
                            <div className="inline-flex rounded-xl border border-border bg-background/40 p-1">
                                <button
                                    type="button"
                                    onClick={() => setUnitSystem('metric')}
                                    className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${unitSystem === 'metric' ? 'bg-gold-500 text-black' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {copy.metric}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUnitSystem('imperial')}
                                    className={`rounded-lg px-4 py-1.5 text-sm font-bold transition ${unitSystem === 'imperial' ? 'bg-gold-500 text-black' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {copy.imperial}
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Sun className="h-4 w-4 text-gold-500" /> {copy.theme}
                            </p>
                            <div className="inline-flex flex-wrap rounded-xl border border-border bg-background/40 p-1">
                                {[
                                    { value: Theme.DARK, label: copy.dark, icon: Moon },
                                    { value: Theme.LIGHT, label: copy.light, icon: Sun },
                                    { value: Theme.SYSTEM, label: copy.system, icon: Monitor },
                                ].map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTheme(option.value)}
                                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                                                theme === option.value ? 'bg-gold-500 text-black' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className="h-3.5 w-3.5" /> {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
                    <h3 className="text-sm font-bold text-foreground">{copy.accountSecurity}</h3>
                    <p className="text-sm text-muted-foreground">{copy.accountSecurityDesc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link href="/reset-password" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-gold-500/40">
                            <Shield className="h-4 w-4 text-gold-500" /> {copy.resetPassword}
                        </Link>
                        <button
                            type="button"
                            onClick={() => void handleSignOut()}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/20"
                        >
                            <LogOut className="h-4 w-4" /> {copy.signOut}
                        </button>
                    </div>
                </div>
            </div>
        </SectionShell>
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return renderProfile();
            case 'smarttools':
                return renderSmartTools();
            case 'history':
                return renderHistory();
            case 'reports':
                return renderReports();
            case 'goals':
                return renderGoals();
            case 'training':
                return renderTraining();
            case 'preferences':
                return renderPreferences();
            case 'overview':
            default:
                return renderOverview();
        }
    };

    return (
        <div data-testid="dashboard-root" dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 end-0 h-96 w-96 rounded-full bg-gold-500/10 blur-[130px]" />
                <div className="absolute bottom-0 start-0 h-80 w-80 rounded-full bg-amber-500/5 blur-[110px]" />
            </div>

            {sidebarOpen ? (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            ) : null}

            <div className="relative flex min-h-screen">
                <aside
                    className={`fixed inset-y-0 start-0 z-50 flex w-72 shrink-0 flex-col border-e border-border bg-card/80 backdrop-blur-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center gap-3 border-b border-border px-5 py-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 text-sm font-black text-black shadow-lg shadow-gold-500/20">
                            MX
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black tracking-[0.18em] text-foreground">{copy.brand}</p>
                            <p className="truncate text-[11px] font-semibold text-gold-500">{copy.brandSub}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close navigation"
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                        <div>
                            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                                {copy.navGroupWorkspace}
                            </p>
                            <div className="space-y-1">{WORKSPACE_NAV.map(navButton)}</div>
                        </div>
                        <div>
                            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                                {copy.navGroupAccount}
                            </p>
                            <div className="space-y-1">{ACCOUNT_NAV.map(navButton)}</div>
                        </div>
                    </nav>

                    <div className="border-t border-border p-3">
                        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground">
                            <ArrowUpRight className={`h-4 w-4 ${isRTL ? 'rotate-90' : ''}`} /> {copy.backToSite}
                        </Link>
                        <button
                            type="button"
                            onClick={() => void handleSignOut()}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4" /> {copy.signOut}
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
                        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-6 xl:px-8">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open navigation"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 text-foreground lg:hidden"
                            >
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
                                    {searchResults.length > 0 ? (
                                        <div className="absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                                            {searchResults.map((tool) => {
                                                const Icon = tool.icon;
                                                return (
                                                    <Link
                                                        key={tool.href}
                                                        href={tool.href}
                                                        onClick={() => setSearchQuery('')}
                                                        className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 text-sm last:border-0 hover:bg-background/40"
                                                    >
                                                        <Icon className="h-4 w-4 text-gold-500" aria-hidden="true" />
                                                        <span className="min-w-0 flex-1 truncate text-foreground">
                                                            {language === 'ar' ? tool.titleAr : tool.titleEn}
                                                        </span>
                                                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setLanguage(language === 'ar' ? Language.EN : Language.AR)}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 text-xs font-black text-foreground transition hover:border-gold-500/40"
                                    aria-label={copy.language}
                                >
                                    <Languages className="h-4 w-4 text-gold-500" />
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
                                <button type="button" onClick={() => void loadDashboard()} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-bold">
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
                        <span>
                            {copy.brand} · {copy.brandSub}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" /> {copy.privateNote}
                        </span>
                    </footer>
                </div>
            </div>
        </div>
    );
}
