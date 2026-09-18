'use client';
/**
 * features/admin/SeoIntelligenceDashboard.tsx
 * Admin SEO Intelligence Dashboard — Phase 5: Admin UI
 * Covers: Overview, Keywords, Review Queue, Blocks, Pins, Seasonal, Clusters, Cannibalization, Audit Log
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw, Search, Pin, ShieldOff, Calendar, Layers,
    AlertTriangle, FileText, TrendingUp, ChevronDown, ChevronUp,
    CheckCircle, XCircle, Clock, Loader2, Eye, Globe, Users, Database, Sparkles,
} from 'lucide-react';

type SeoTab =
    | 'overview'
    | 'keywords'
    | 'review_queue'
    | 'competitor_gaps'
    | 'sources'
    | 'blocks'
    | 'pins'
    | 'seasonal'
    | 'clusters'
    | 'cannibalization'
    | 'audit_log';

interface KeywordRow {
    id: string;
    original_keyword: string;
    language: string;
    lifecycle_status: string;
    is_ymyl: boolean;
    requires_review: boolean;
    review_status: string;
    final_score: number;
    score: number;
    confidence_score: number;
    intent: string;
    cluster: string;
    trend_status: string;
    source: string;
    destination_path: string;
    market?: string;
}

interface AuditEvent {
    id: string;
    action: string;
    keyword_id: string | null;
    old_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
    source: string;
    created_at: string;
}

interface BlockRow {
    id: string;
    normalized_keyword: string;
    language: string;
    reason: string;
    block_scope: string;
    created_at: string;
}

interface SeasonalRow {
    id: string;
    event_name: string;
    event_name_ar: string;
    event_name_en: string;
    start_date: string;
    end_date: string;
    boost_score: number;
    boost_clusters: string[];
    is_active: boolean;
}

interface CannibalizationRow {
    id: string;
    url_a: string;
    url_b: string;
    similarity_score: number;
    severity: string;
    status: string;
    keyword_id: string;
}

interface ClusterRow {
    id: string;
    name: string;
    name_ar: string;
    authority_status: string;
    description: string;
}

// ── shared styles ───────────────────────────────────────────────────────────
const tabCls = (active: boolean) =>
    `px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all border ${
        active
            ? 'bg-gold-500/10 text-gold-400 border-gold-500/30'
            : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-800/60'
    }`;

const badgeCls = (variant: 'green' | 'red' | 'yellow' | 'blue' | 'gray') => {
    const map = {
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        gray: 'bg-zinc-700/40 text-zinc-400 border-zinc-700',
    };
    return `inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${map[variant]}`;
};

const lifecycleBadge = (status: string) => {
    if (status === 'active' || status === 'approved') return badgeCls('green');
    if (status === 'blocked' || status === 'retired') return badgeCls('red');
    if (status === 'pending_review') return badgeCls('yellow');
    if (status === 'experimental' || status === 'candidate') return badgeCls('blue');
    return badgeCls('gray');
};

// ── Overview ─────────────────────────────────────────────────────────────────
const OverviewPanel: React.FC<{ onRefreshSeo: () => void; refreshing: boolean }> = ({
    onRefreshSeo,
    refreshing,
}) => {
    const [stats, setStats] = useState<{
        total: number; active: number; pending: number; ymyl: number; blocked: number;
    } | null>(null);

    useEffect(() => {
        fetch('/api/admin/seo/keywords?limit=1')
            .then(r => r.json())
            .then(d => {
                if (d.total !== undefined) {
                    setStats({
                        total: d.total || 0,
                        active: 0,
                        pending: 0,
                        ymyl: 0,
                        blocked: 0,
                    });
                }
            })
            .catch(() => {});
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">SEO Intelligence — Overview</h2>
                    <p className="text-xs text-zinc-500 mt-1">Global keyword intelligence platform status</p>
                </div>
                <button
                    onClick={onRefreshSeo}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold hover:bg-gold-500/20 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Run Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Keywords', value: stats?.total ?? '—', icon: Globe, color: 'text-sky-400' },
                    { label: 'Pending Review', value: stats?.pending ?? '—', icon: Clock, color: 'text-amber-400' },
                    { label: 'YMYL Flagged', value: stats?.ymyl ?? '—', icon: AlertTriangle, color: 'text-red-400' },
                    { label: 'Blocked', value: stats?.blocked ?? '—', icon: ShieldOff, color: 'text-rose-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold-400" /> Data Quality Framework
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    {[
                        ['google_search_console', '95', 'Verified'],
                        ['internal_search', '85', 'Internal'],
                        ['semrush / ahrefs', '85', 'Verified'],
                        ['google_trends', '75', 'Modeled'],
                        ['competitor_page', '65', 'Inferred'],
                        ['editorial / admin', '55', 'Editorial'],
                        ['ai_suggested', '30', 'AI Suggested'],
                        ['unknown', '10', 'Unknown'],
                    ].map(([src, conf, quality]) => (
                        <div key={src} className="flex items-center justify-between bg-zinc-950/60 rounded-lg px-3 py-2">
                            <span className="font-mono text-[10px] text-zinc-400">{src}</span>
                            <span className={`text-[10px] font-bold ${Number(conf) >= 80 ? 'text-emerald-400' : Number(conf) >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {conf}% · {quality}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Keywords Table ────────────────────────────────────────────────────────────
const KeywordsPanel: React.FC = () => {
    const [keywords, setKeywords] = useState<KeywordRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('');
    const [lifecycle, setLifecycle] = useState('');
    const [ymyl, setYmyl] = useState('');
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        if (lang) params.set('lang', lang);
        if (lifecycle) params.set('lifecycle', lifecycle);
        if (ymyl === 'true') params.set('ymyl', 'true');
        fetch(`/api/admin/seo/keywords?${params}`)
            .then(r => r.json())
            .then(d => {
                setKeywords(d.keywords || []);
                setTotal(d.total || 0);
            })
            .finally(() => setLoading(false));
    }, [lang, lifecycle, ymyl, offset]);

    useEffect(() => { load(); }, [load]);

    const handleApprove = async (id: string) => {
        await fetch(`/api/admin/seo/keywords/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lifecycle_status: 'approved', review_status: 'approved' }),
        });
        load();
    };

    const handleBlock = async (id: string) => {
        await fetch(`/api/admin/seo/keywords/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lifecycle_status: 'blocked', is_active: false }),
        });
        load();
    };

    const handlePin = async (id: string) => {
        await fetch(`/api/admin/seo/pins/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin_note: 'Pinned via Admin Dashboard' }),
        });
        load();
    };

    const selectCls = 'bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-gold-500 focus:outline-none';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
                <select value={lang} onChange={e => { setLang(e.target.value); setOffset(0); }} className={selectCls}>
                    <option value="">All Languages</option>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                </select>
                <select value={lifecycle} onChange={e => { setLifecycle(e.target.value); setOffset(0); }} className={selectCls}>
                    <option value="">All Lifecycle</option>
                    <option value="active">Active</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="blocked">Blocked</option>
                    <option value="retired">Retired</option>
                    <option value="candidate">Candidate</option>
                </select>
                <select value={ymyl} onChange={e => { setYmyl(e.target.value); setOffset(0); }} className={selectCls}>
                    <option value="">All Keywords</option>
                    <option value="true">YMYL Only</option>
                </select>
                <span className="text-xs text-zinc-500 ms-auto">
                    {total} keywords total
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-900/80 text-zinc-500 uppercase tracking-wide">
                            <tr>
                                {['Keyword', 'Lang', 'Intent', 'Score', 'Confidence', 'Lifecycle', 'Source', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 font-bold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                            {keywords.map(kw => (
                                <tr key={kw.id} className="hover:bg-zinc-900/40 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white max-w-[180px] truncate" title={kw.original_keyword}>
                                        {kw.is_ymyl && <AlertTriangle className="inline w-3 h-3 text-amber-400 me-1" />}
                                        {kw.original_keyword}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={badgeCls(kw.language === 'ar' ? 'blue' : 'gray')}>{kw.language}</span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{kw.intent}</td>
                                    <td className="px-4 py-3 font-mono text-gold-400">{Number(kw.final_score ?? kw.score).toFixed(1)}</td>
                                    <td className="px-4 py-3 font-mono text-zinc-400">{Number(kw.confidence_score ?? 0).toFixed(0)}%</td>
                                    <td className="px-4 py-3">
                                        <span className={lifecycleBadge(kw.lifecycle_status || 'active')}>{kw.lifecycle_status || 'active'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 max-w-[100px] truncate">{kw.source}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleApprove(kw.id)}
                                                title="Approve"
                                                className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handlePin(kw.id)}
                                                title="Pin"
                                                className="p-1 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                                            >
                                                <Pin className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleBlock(kw.id)}
                                                title="Block"
                                                className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white disabled:opacity-40 hover:bg-zinc-700 transition-all"
                >← Prev</button>
                <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white disabled:opacity-40 hover:bg-zinc-700 transition-all"
                >Next →</button>
            </div>
        </div>
    );
};

// ── Review Queue ──────────────────────────────────────────────────────────────
const ReviewQueuePanel: React.FC = () => {
    const [keywords, setKeywords] = useState<KeywordRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/seo/keywords?lifecycle=pending_review&limit=50')
            .then(r => r.json())
            .then(d => setKeywords(d.keywords || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const approve = async (id: string) => {
        await fetch(`/api/admin/seo/keywords/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lifecycle_status: 'approved', review_status: 'approved', requires_review: false }),
        });
        load();
    };

    const reject = async (id: string) => {
        await fetch(`/api/admin/seo/keywords/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lifecycle_status: 'blocked', review_status: 'rejected', is_active: false }),
        });
        load();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
        </div>
    );

    if (keywords.length === 0) return (
        <div className="text-center py-12 text-zinc-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold">Review queue is clear — no pending keywords.</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <p className="text-xs text-zinc-500">{keywords.length} keywords awaiting review</p>
            {keywords.map(kw => (
                <div key={kw.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {kw.is_ymyl && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            <span className="text-sm font-bold text-white">{kw.original_keyword}</span>
                            <span className={badgeCls(kw.language === 'ar' ? 'blue' : 'gray')}>{kw.language}</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Source: <span className="text-zinc-300">{kw.source}</span> · Score: <span className="text-gold-400">{Number(kw.final_score ?? kw.score).toFixed(1)}</span> · Cluster: <span className="text-zinc-300">{kw.cluster}</span>
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => approve(kw.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all">
                            <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => reject(kw.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                            <XCircle className="w-3 h-3" /> Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ── Competitor Gaps Panel ─────────────────────────────────────────────────────
const CompetitorGapsPanel: React.FC = () => {
    const [competitors, setCompetitors] = useState<{ name: string; domain: string; market: string; language: string; competitorType: string }[]>([]);
    const [opportunities, setOpportunities] = useState<{ keyword: string; language: string; opportunityScore: number; competitorPresence: string; competitorDomain?: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/seo/competitors')
            .then(r => r.json())
            .then(d => {
                setCompetitors(d.competitors || []);
                setOpportunities(d.opportunities || []);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-400" /> Monitored Competitors ({competitors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {competitors.map(c => (
                        <div key={c.domain} className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white">{c.name}</span>
                                <span className={badgeCls(c.language === 'ar' ? 'blue' : 'gray')}>{c.language}</span>
                            </div>
                            <p className="text-[11px] font-mono text-zinc-500 mt-1">{c.domain}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{c.market}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Identified Keyword Gaps & Opportunities</h3>
                {opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{opp.keyword}</span>
                                <span className={badgeCls(opp.language === 'ar' ? 'blue' : 'gray')}>{opp.language}</span>
                                <span className={badgeCls(opp.status === 'covered' ? 'green' : 'yellow')}>{opp.status}</span>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Domain: <span className="text-zinc-200 font-mono">{opp.competitorDomain || 'Competitor'}</span> · {opp.competitorPresence}
                            </p>
                        </div>
                        <div className="text-end shrink-0">
                            <span className="text-xs text-zinc-500 block">Opportunity</span>
                            <span className="text-lg font-black font-mono text-gold-400">{opp.opportunityScore}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Sources Registry Panel ────────────────────────────────────────────────────
const SourcesPanel: React.FC = () => {
    const [sources, setSources] = useState<{ id: string; source_name: string; source_type: string; reliability_score?: number; terms_verified: boolean; retrieved_at: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/admin/seo/sources')
            .then(r => r.json())
            .then(d => setSources(d.sources || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-gold-500" /></div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" /> Registered Data Sources & Provenance
            </h3>
            {sources.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-xs">
                    No custom external sources added yet. Baseline and telemetry sources are operating normally.
                </div>
            ) : (
                <div className="space-y-2">
                    {sources.map(s => (
                        <div key={s.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                                <span className="font-bold text-sm text-white">{s.source_name}</span>
                                <span className="ms-2 font-mono text-xs text-zinc-400">[{s.source_type}]</span>
                            </div>
                            <span className="text-xs text-zinc-500">
                                Reliability: <span className="text-gold-400 font-bold">{s.reliability_score ?? 70}%</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Blocks ────────────────────────────────────────────────────────────────────
const BlocksPanel: React.FC = () => {
    const [blocks, setBlocks] = useState<BlockRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [kw, setKw] = useState('');
    const [lang, setLang] = useState('ar');
    const [reason, setReason] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/seo/blocks')
            .then(r => r.json())
            .then(d => setBlocks(d.blocks || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const addBlock = async () => {
        if (!kw.trim()) return;
        await fetch('/api/admin/seo/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: kw.trim(), language: lang, reason }),
        });
        setKw(''); setReason('');
        load();
    };

    const inputCls = 'bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-gold-500 focus:outline-none flex-1';
    const selectCls = 'bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-gold-500 focus:outline-none';

    return (
        <div className="space-y-5">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Block a Keyword</h3>
                <div className="flex gap-2 flex-wrap">
                    <input placeholder="Keyword to block..." value={kw} onChange={e => setKw(e.target.value)} className={inputCls} />
                    <select value={lang} onChange={e => setLang(e.target.value)} className={selectCls}>
                        <option value="ar">Arabic</option>
                        <option value="en">English</option>
                    </select>
                    <input placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} className={inputCls} />
                    <button onClick={addBlock} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all whitespace-nowrap">
                        Add Block
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                </div>
            ) : (
                <div className="space-y-2">
                    {blocks.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No keyword blocks configured.</p>}
                    {blocks.map(b => (
                        <div key={b.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                                <span className="font-mono text-sm text-red-400 font-bold">{b.normalized_keyword}</span>
                                <span className={`ms-2 ${badgeCls('gray')}`}>{b.language}</span>
                                {b.reason && <p className="text-[10px] text-zinc-500 mt-0.5">{b.reason}</p>}
                            </div>
                            <span className="text-[10px] text-zinc-600">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Seasonal Calendar ─────────────────────────────────────────────────────────
const SeasonalPanel: React.FC = () => {
    const [events, setEvents] = useState<SeasonalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', name_ar: '', start_date: '', end_date: '', boost_score: 15 });

    const load = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/seo/seasonal')
            .then(r => r.json())
            .then(d => setEvents(d.events || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const addEvent = async () => {
        if (!form.name.trim()) return;
        await fetch('/api/admin/seo/seasonal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_name: form.name, event_name_ar: form.name_ar, start_date: form.start_date, end_date: form.end_date, boost_score: form.boost_score }),
        });
        setForm({ name: '', name_ar: '', start_date: '', end_date: '', boost_score: 15 });
        load();
    };

    const toggleActive = async (id: string, current: boolean) => {
        await fetch(`/api/admin/seo/seasonal/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !current }),
        });
        load();
    };

    const inputCls = 'bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-gold-500 focus:outline-none';

    return (
        <div className="space-y-5">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold-400" /> Add Seasonal Event
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Event name (EN)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                    <input placeholder="اسم الحدث (AR)" value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} className={inputCls} dir="rtl" />
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputCls} />
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400">Boost Score:</label>
                    <input type="number" min="1" max="50" value={form.boost_score} onChange={e => setForm(f => ({ ...f, boost_score: Number(e.target.value) }))} className={`${inputCls} w-20`} />
                    <button onClick={addEvent} className="ms-auto px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold hover:bg-gold-500/20 transition-all">
                        Add Event
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center h-20 items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                </div>
            ) : (
                <div className="space-y-2">
                    {events.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No seasonal events configured.</p>}
                    {events.map(ev => (
                        <div key={ev.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{ev.event_name}</span>
                                    {ev.event_name_ar && <span className="text-xs text-zinc-400 font-medium" dir="rtl">{ev.event_name_ar}</span>}
                                    <span className={badgeCls(ev.is_active ? 'green' : 'gray')}>{ev.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                    {ev.start_date} → {ev.end_date} · Boost: +{ev.boost_score}
                                </p>
                            </div>
                            <button onClick={() => toggleActive(ev.id, ev.is_active)} className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800">
                                {ev.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Clusters ──────────────────────────────────────────────────────────────────
const ClustersPanel: React.FC = () => {
    const [clusters, setClusters] = useState<ClusterRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/seo/clusters')
            .then(r => r.json())
            .then(d => setClusters(d.clusters || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center h-20 items-center"><Loader2 className="w-5 h-5 animate-spin text-gold-500" /></div>;

    return (
        <div className="space-y-3">
            {clusters.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No topic clusters defined yet.</p>}
            {clusters.map(cl => (
                <div key={cl.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-bold text-sm text-white">{cl.name}</span>
                            {cl.name_ar && <span className="text-xs text-zinc-400" dir="rtl">{cl.name_ar}</span>}
                        </div>
                        {cl.description && <p className="text-[10px] text-zinc-500 mt-0.5">{cl.description}</p>}
                    </div>
                    <span className={badgeCls(cl.authority_status === 'established' ? 'green' : cl.authority_status === 'building' ? 'yellow' : 'gray')}>
                        {cl.authority_status}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ── Cannibalization ───────────────────────────────────────────────────────────
const CannibalizationPanel: React.FC = () => {
    const [alerts, setAlerts] = useState<CannibalizationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('open');

    const load = useCallback(() => {
        setLoading(true);
        fetch(`/api/admin/seo/cannibalization?status=${filter}`)
            .then(r => r.json())
            .then(d => setAlerts(d.alerts || []))
            .finally(() => setLoading(false));
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const updateStatus = async (id: string, status: string) => {
        await fetch(`/api/admin/seo/cannibalization/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        load();
    };

    const selectCls = 'bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-gold-500 focus:outline-none';

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <select value={filter} onChange={e => setFilter(e.target.value)} className={selectCls}>
                    <option value="open">Open</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                </select>
                <span className="text-xs text-zinc-500">{alerts.length} alerts</span>
            </div>

            {loading ? (
                <div className="flex justify-center h-20 items-center"><Loader2 className="w-5 h-5 animate-spin text-gold-500" /></div>
            ) : (
                <div className="space-y-2">
                    {alerts.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No cannibalization alerts with current filter.</p>}
                    {alerts.map(a => (
                        <div key={a.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={badgeCls(a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'yellow' : 'gray')}>{a.severity}</span>
                                        <span className="text-xs font-mono text-zinc-300">Similarity: {a.similarity_score?.toFixed(0)}%</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 mt-1">URL A: {a.url_a}</p>
                                    <p className="text-[11px] text-zinc-400">URL B: {a.url_b}</p>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => updateStatus(a.id, 'resolved')} className="px-2 py-1 text-[10px] rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold">Resolve</button>
                                    <button onClick={() => updateStatus(a.id, 'ignored')} className="px-2 py-1 text-[10px] rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all font-bold">Ignore</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Audit Log ─────────────────────────────────────────────────────────────────
const AuditLogPanel: React.FC = () => {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const limit = 25;

    const load = useCallback(() => {
        setLoading(true);
        fetch(`/api/admin/seo/audit-log?limit=${limit}&offset=${offset}`)
            .then(r => r.json())
            .then(d => { setEvents(d.events || []); setTotal(d.total || 0); })
            .finally(() => setLoading(false));
    }, [offset]);

    useEffect(() => { load(); }, [load]);

    const actionColor = (action: string) => {
        if (['approved', 'pinned', 'restored'].includes(action)) return 'text-emerald-400';
        if (['blocked', 'rejected', 'retired'].includes(action)) return 'text-red-400';
        if (['scored', 'updated'].includes(action)) return 'text-sky-400';
        return 'text-zinc-400';
    };

    if (loading) return <div className="flex justify-center h-20 items-center"><Loader2 className="w-5 h-5 animate-spin text-gold-500" /></div>;

    return (
        <div className="space-y-4">
            <p className="text-xs text-zinc-500">{total} audit events</p>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-900/80 text-zinc-500 uppercase tracking-wide">
                        <tr>
                            {['Action', 'Keyword ID', 'Source', 'Changed', 'When'].map(h => (
                                <th key={h} className="px-4 py-3 font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                        {events.map(ev => (
                            <tr key={ev.id} className="hover:bg-zinc-900/40 transition-colors">
                                <td className={`px-4 py-3 font-bold uppercase ${actionColor(ev.action)}`}>{ev.action}</td>
                                <td className="px-4 py-3 font-mono text-zinc-500 max-w-[120px] truncate" title={ev.keyword_id || ''}>{ev.keyword_id?.slice(0, 8) || '—'}…</td>
                                <td className="px-4 py-3 text-zinc-500">{ev.source}</td>
                                <td className="px-4 py-3 text-zinc-400 max-w-[180px] truncate">{ev.new_value ? JSON.stringify(ev.new_value).slice(0, 60) : '—'}</td>
                                <td className="px-4 py-3 text-zinc-500">{new Date(ev.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white disabled:opacity-40 hover:bg-zinc-700 transition-all">← Prev</button>
                <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white disabled:opacity-40 hover:bg-zinc-700 transition-all">Next →</button>
            </div>
        </div>
    );
};

// ── Main Dashboard Shell ──────────────────────────────────────────────────────
const SEO_TABS: { key: SeoTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview',        label: 'Overview',        icon: Globe },
    { key: 'keywords',        label: 'Keywords',        icon: Search },
    { key: 'review_queue',    label: 'Review Queue',    icon: Eye },
    { key: 'competitor_gaps', label: 'Competitor Gaps', icon: Users },
    { key: 'sources',         label: 'Sources Registry',icon: Database },
    { key: 'blocks',          label: 'Blocks',          icon: ShieldOff },
    { key: 'pins',            label: 'Pins',            icon: Pin },
    { key: 'seasonal',        label: 'Seasonal',        icon: Calendar },
    { key: 'clusters',        label: 'Clusters',        icon: Layers },
    { key: 'cannibalization', label: 'Cannibalization', icon: AlertTriangle },
    { key: 'audit_log',       label: 'Audit Log',       icon: FileText },
];

export const SeoIntelligenceDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SeoTab>('overview');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefreshSeo = async () => {
        setRefreshing(true);
        try {
            await fetch('/api/seo/refresh', { method: 'POST' });
        } catch {
            // ignore
        } finally {
            setRefreshing(false);
        }
    };

    const renderPanel = () => {
        switch (activeTab) {
            case 'overview':        return <OverviewPanel onRefreshSeo={handleRefreshSeo} refreshing={refreshing} />;
            case 'keywords':        return <KeywordsPanel />;
            case 'review_queue':    return <ReviewQueuePanel />;
            case 'competitor_gaps': return <CompetitorGapsPanel />;
            case 'sources':         return <SourcesPanel />;
            case 'blocks':          return <BlocksPanel />;
            case 'pins':            return <p className="text-xs text-zinc-500 py-8 text-center">Pinned keywords are managed from the Keywords tab via the 📌 pin action.</p>;
            case 'seasonal':        return <SeasonalPanel />;
            case 'clusters':        return <ClustersPanel />;
            case 'cannibalization': return <CannibalizationPanel />;
            case 'audit_log':       return <AuditLogPanel />;
            default:                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation — responsive wrapping */}
            <div className="flex flex-wrap gap-1.5 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-2">
                {SEO_TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={tabCls(activeTab === key)}
                    >
                        <span className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3" />
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Panel */}
            <div className="min-h-[400px]">
                {renderPanel()}
            </div>
        </div>
    );
};

export default SeoIntelligenceDashboard;
