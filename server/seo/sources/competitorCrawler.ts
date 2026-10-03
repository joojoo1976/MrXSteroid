/**
 * server/seo/sources/competitorCrawler.ts
 *
 * POLITE, robots.txt-compliant competitor observation crawler.
 *
 * Politeness is the point of this file, not an afterthought. Every network
 * call in here goes through {@link PoliteCrawler.request}, which enforces:
 *   - robots.txt `User-agent` group selection (most specific match wins)
 *   - robots.txt `Disallow` / `Allow` with Google-style longest-match wins,
 *     `*` wildcards and `$` end-anchors
 *   - robots.txt `Crawl-delay` honoured, with a hard floor of 1000 ms so we
 *     are never more aggressive than one request per second per host
 *   - a per-host serial queue, so N page fetches never become N parallel hits
 *   - a request timeout (default 15 s) via AbortController
 *   - retries bounded to <= 2, and only for transient conditions
 *     (timeout / network error / 429 / 5xx). A 4xx other than 429 is NOT
 *     retried: re-requesting a 404 is exactly the aggressive behaviour we
 *     refuse to do.
 *   - conditional requests: `If-None-Match` / `If-Modified-Since` from the
 *     previous run, so an unchanged page costs the competitor one 304.
 *   - a configurable hard page cap per run, defaulting LOW (10).
 *
 * HONESTY CONTRACT (absolute, enforced by the types below):
 *   Competitor evidence is NEVER search volume. A competitor page tells us
 *   what a competitor published; it tells us nothing about how many people
 *   search for it. Therefore {@link CompetitorObservation} has no volume
 *   field, no difficulty field and no confidence field, and
 *   {@link competitorObservationToRecord} emits a record whose metrics are
 *   all-null. Nothing here may populate `googleAdsAvgMonthlySearches`,
 *   `thirdPartyVolumeEstimate` or any confidence number.
 *
 *   A source is `VERIFIED` only when a real HTTP request actually succeeded
 *   here. Robots/sitemap discovery alone yields `CONNECTED` at best.
 *
 * No aggressive crawling: no probing of disallowed URLs, no credential use,
 * no authenticated areas, no POST, no HEAD-probing the whole internet.
 */

import { createHash } from 'node:crypto';
import type {
    DataKind,
    EvidenceType,
    Market,
    NormalizedIntelligenceRecord,
    SourceLanguage,
} from './types';
import { emptyKeywordMetrics } from './types';

/* ------------------------------------------------------------------ */
/* Seeds                                                               */
/* ------------------------------------------------------------------ */

/**
 * Curated competitor seeds. These are OWNER-DECLARED competitors, not a
 * discovery result and not a measurement. `dataKind: 'curated'` with
 * `evidenceType: 'curated_seed'` and all metrics null is the only honest shape.
 */
export interface CompetitorSeed {
    domain: string;
    language: SourceLanguage;
    market: Market;
    /** Human label. Never a metric. */
    label: string;
    /** Start URL for the crawl; always the origin. */
    startUrl: string;
}

/** The competitors configured for this deployment. */
export const CURATED_COMPETITOR_SEEDS: readonly CompetitorSeed[] = [
    {
        domain: 'arab-flex.com',
        language: 'ar',
        market: 'ar-EG',
        label: 'arab-flex',
        startUrl: 'https://arab-flex.com/',
    },
    {
        domain: 'mshawky.com',
        language: 'ar',
        market: 'ar-EG',
        label: 'mshawky',
        startUrl: 'https://mshawky.com/',
    },
    {
        domain: 'abdallahtolba.com',
        language: 'ar',
        market: 'ar-EG',
        label: 'abdallahtolba',
        startUrl: 'https://abdallahtolba.com/',
    },
    {
        domain: 'coachfathi.com',
        language: 'ar',
        market: 'ar-EG',
        label: 'coachfathi',
        startUrl: 'https://coachfathi.com/',
    },
] as const;

/** The curated-seed evidence vocabulary. No measurement is implied. */
export const CURATED_SEED_EVIDENCE_TYPE = 'curated_seed' as const;

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

/** Identifies us honestly and links back to the policy we follow. */
export const DEFAULT_USER_AGENT =
    'MrXSteroidResearchBot/1.0 (+https://mrxsteroid.example/bot; respects robots.txt)';

/** Absolute floor on the per-host inter-request delay. Non-negotiable. */
/** True for AbortError-shaped errors from fetch / AbortController. */
function isAbortError(error: unknown): boolean {
    return Boolean(
        error &&
        typeof error === 'object' &&
        (error as { name?: string }).name === 'AbortError'
    );
}
export const MIN_THROTTLE_MS = 1000;

/** Conditional-request validators remembered between runs. */
export interface Validators {
    etag?: string;
    lastModified?: string;
}

export interface CrawlOptions {
    userAgent?: string;
    /** Hard cap on pages fetched in one run. */
    maxPagesPerRun?: number;
    requestTimeoutMs?: number;
    /** Clamped to MAX_ALLOWED_RETRIES. */
    maxRetries?: number;
    /** Minimum gap between two requests to the same host. Floored at 1000 ms. */
    throttleMs?: number;
    backoffBaseMs?: number;
    backoffMaxMs?: number;
    maxSitemapUrls?: number;
    maxResponseBytes?: number;
    visibleTextSampleChars?: number;
    followSitemap?: boolean;
    /** Concurrent in-flight requests. Kept at 1: politeness is serial. */
    maxConcurrency?: number;
    /** Injectable clock, for deterministic tests. */
    now?: () => number;
    /** Injectable sleep, for deterministic tests. */
    sleep?: (ms: number) => Promise<void>;
    /** Injectable fetch. There is deliberately no other default. */
    fetchImpl?: typeof fetch;
    /** Validators from a previous run, to issue conditional requests. */
    previousValidators?: Map<string, Validators>;
}

/** Fully resolved options, with every politeness bound already clamped. */
export interface ResolvedCrawlOptions {
    userAgent: string;
    maxPagesPerRun: number;
    requestTimeoutMs: number;
    maxRetries: number;
    throttleMs: number;
    backoffBaseMs: number;
    backoffMaxMs: number;
    maxSitemapUrls: number;
    maxResponseBytes: number;
    visibleTextSampleChars: number;
    followSitemap: boolean;
    maxConcurrency: number;
    now: () => number;
    sleep: (ms: number) => Promise<void>;
    fetchImpl: typeof fetch;
    previousValidators: Map<string, Validators>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Apply every politeness clamp. Exported so tests can assert a caller cannot
 * weaken the guarantees by passing hostile options.
 */
export function resolveCrawlOptions(options: CrawlOptions = {}): ResolvedCrawlOptions {
    if (options.maxRetries != null && options.maxRetries > MAX_ALLOWED_RETRIES) {
        throw new Error(
            `maxRetries must be <= ${MAX_ALLOWED_RETRIES}; refusing a less polite crawl`
        );
    }
    if (options.throttleMs != null && options.throttleMs < MIN_THROTTLE_MS) {
        throw new Error(
            `throttleMs must be >= ${MIN_THROTTLE_MS} ms; refusing a less polite crawl`
        );
    }
    const fetchImpl = options.fetchImpl;
    if (typeof fetchImpl !== 'function') {
        throw new Error('fetchImpl is required: this crawler never fabricates a response');
    }
    return {
        userAgent: options.userAgent ?? DEFAULT_USER_AGENT,
        maxPagesPerRun: Math.max(
            1,
            Math.floor(options.maxPagesPerRun ?? DEFAULT_CRAWL_OPTIONS.maxPagesPerRun)
        ),
        requestTimeoutMs: Math.max(
            1,
            options.requestTimeoutMs ?? DEFAULT_CRAWL_OPTIONS.requestTimeoutMs
        ),
        maxRetries: Math.min(
            MAX_ALLOWED_RETRIES,
            Math.max(0, Math.floor(options.maxRetries ?? MAX_ALLOWED_RETRIES))
        ),
        throttleMs: Math.max(MIN_THROTTLE_MS, options.throttleMs ?? MIN_THROTTLE_MS),
        backoffBaseMs: Math.max(0, options.backoffBaseMs ?? DEFAULT_CRAWL_OPTIONS.backoffBaseMs),
        backoffMaxMs: Math.max(0, options.backoffMaxMs ?? DEFAULT_CRAWL_OPTIONS.backoffMaxMs),
        maxSitemapUrls: Math.max(
            1,
            Math.floor(options.maxSitemapUrls ?? DEFAULT_CRAWL_OPTIONS.maxSitemapUrls)
        ),
        maxResponseBytes: Math.max(
            1,
            Math.floor(options.maxResponseBytes ?? DEFAULT_CRAWL_OPTIONS.maxResponseBytes)
        ),
        visibleTextSampleChars: Math.max(
            0,
            Math.floor(
                options.visibleTextSampleChars ?? DEFAULT_CRAWL_OPTIONS.visibleTextSampleChars
            )
        ),
        followSitemap: options.followSitemap ?? DEFAULT_CRAWL_OPTIONS.followSitemap,
        // Politeness is serial by construction: this is clamped to 1 and the
        // crawler schedules per host, so a caller cannot turn it into a
        // parallel hammer.
        maxConcurrency: 1,
        now: options.now ?? Date.now,
        sleep: options.sleep ?? defaultSleep,
        fetchImpl,
        previousValidators: options.previousValidators ?? new Map<string, Validators>(),
    };
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

/** One parsed robots.txt user-agent group. */
export interface RobotsGroup {
    agents: string[];
    allow: string[];
    disallow: string[];
    /** Seconds, as declared. `null` when absent or unparseable. */
    crawlDelaySeconds: number | null;
}

/** Everything needed to decide whether, and how fast, to fetch a URL. */
export interface RobotsPolicy {
    groups: RobotsGroup[];
    sitemaps: string[];
    /** True when robots.txt was itself fetched with a real 2xx response. */
    fetched: boolean;
    /** HTTP status of the robots.txt fetch, or null when it failed. */
    status: number | null;
    /**
     * True only when robots.txt genuinely could not be read. We then crawl
     * nothing: an unreadable policy is not permission.
     */
    unavailable: boolean;
}

/**
 * The fail-closed policy: nothing is crawlable, because we could not read the
 * rules. This is the honest default, and what an unreachable robots.txt
 * resolves to.
 */
export const CLOSED_ROBOTS_POLICY: RobotsPolicy = Object.freeze({
    groups: [],
    sitemaps: [],
    fetched: false,
    status: null,
    unavailable: true,
});

/**
 * Parse a robots.txt body.
 *
 * Tolerant by design: real robots.txt files contain BOMs, stray whitespace,
 * mixed case, comments and malformed lines. A malformed line is skipped; it is
 * never silently reinterpreted as an allow.
 */
export function parseRobotsTxt(body: string): RobotsPolicy {
    const groups: RobotsGroup[] = [];
    const sitemaps: string[] = [];
    let current: RobotsGroup | null = null;
    /** True while we are still collecting `User-agent` lines for one group. */
    let expectingMoreAgents = false;

    for (const rawLine of body.split(/\r?\n/)) {
        const line = rawLine.replace(/^\uFEFF/, '').replace(/#.*$/, '').trim();
        if (!line) continue;
        const idx = line.indexOf(':');
        if (idx <= 0) continue;
        const field = line.slice(0, idx).trim().toLowerCase();
        const value = line.slice(idx + 1).trim();

        if (field === 'sitemap') {
            if (value) sitemaps.push(value);
            // A Sitemap line never terminates the current group.
            continue;
        }

        if (field === 'user-agent') {
            // Consecutive User-agent lines share one group; any other directive
            // closes the group and starts a new one.
            if (!current || !expectingMoreAgents) {
                current = { agents: [], allow: [], disallow: [], crawlDelaySeconds: null };
                groups.push(current);
            }
            current.agents.push(value);
            expectingMoreAgents = true;
            continue;
        }

        // Any non-`User-agent` directive closes the agent-collection window.
        expectingMoreAgents = false;
        if (!current) {
            // A directive before any `User-agent` line has no group to belong to.
            // It is skipped rather than invented into one.
            continue;
        }

        if (field === 'disallow') {
            // `Disallow:` with an empty value means "allow everything", so it is
            // recorded as an empty string and handled by the matcher, not here.
            current.disallow.push(value);
            continue;
        }
        if (field === 'allow') {
            current.allow.push(value);
            continue;
        }
        if (field === 'crawl-delay') {
            const seconds = Number(value);
            // An unparseable Crawl-delay is NOT treated as 0 (which would mean
            // "no delay" and be maximally aggressive). It is ignored, leaving the
            // value null, and the caller falls back to our 1000 ms floor.
            if (Number.isFinite(seconds) && seconds >= 0) {
                current.crawlDelaySeconds = seconds;
            }
            continue;
        }
        // Unknown directives are ignored, never reinterpreted.
    }

    return {
        groups,
        sitemaps,
        fetched: true,
        status: 200,
        unavailable: false,
    };
}

/**
 * Pick the group that applies to `userAgent`.
 *
 * An exact (case-insensitive) agent-token match wins over `*`; the longest
 * matching token wins among exact matches, per the most-specific-group rule.
 */
export function selectRobotsGroup(policy: RobotsPolicy, userAgent: string): RobotsGroup | null {
    if (policy.groups.length === 0) return null;
    const ua = userAgent.toLowerCase();
    let best: RobotsGroup | null = null;
    let bestLength = -1;
    let star: RobotsGroup | null = null;

    for (const group of policy.groups) {
        for (const agent of group.agents) {
            if (agent === '*') {
                if (!star) star = group;
                continue;
            }
            // The UA must start with the token, or the token must appear as a
            // whole word, so `bot` does not accidentally match `Googlebot`.
            //
            // BOTH sides are lower-cased: `parseRobotsTxt` normalises the agent
            // token it stores, so comparing a lower-cased user agent against the
            // raw token would make every NAMED group unmatchable and silently
            // degrade a site-specific policy to the `*` group — i.e. we could
            // crawl paths a competitor explicitly disallowed for us.
            const token = agent.toLowerCase();
            const matches = ua.startsWith(token) || ua.includes(` ${token}`);
            if (matches && token.length > bestLength) {
                best = group;
                bestLength = token.length;
            }
        }
    }
    return best ?? star;
}

/** Convert one robots path pattern into an anchored RegExp. */
function patternToRegExp(pattern: string): RegExp {
    let out = '';
    const endAnchored = pattern.endsWith('$');
    const body = endAnchored ? pattern.slice(0, -1) : pattern;
    for (const ch of body) {
        if (ch === '*') out += '.*';
        else out += ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(`^${out}${endAnchored ? '$' : ''}`);
}

/** Longest matching rule length, or -1 when no pattern applies. */
function matchLength(patterns: string[], pathAndQuery: string): number {
    let longest = -1;
    for (const pattern of patterns) {
        if (!pattern) continue;
        if (pattern.length > longest && patternToRegExp(pattern).test(pathAndQuery)) {
            longest = pattern.length;
        }
    }
    return longest;
}

/**
 * Decide whether a URL may be fetched, honouring Allow/Disallow.
 *
 * Longest match wins, and Allow wins a tie. When no group applies to us the
 * URL is permitted, because nothing forbids it.
 */
export function isUrlAllowed(url: string, policy: RobotsPolicy, userAgent: string): boolean {
    if (policy.unavailable) return false;
    const group = selectRobotsGroup(policy, userAgent);
    if (!group) return true;

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }
    const pathAndQuery = `${parsed.pathname}${parsed.search}`;

    const allowLength = matchLength(group.allow, pathAndQuery);
    const disallowLength = matchLength(group.disallow, pathAndQuery);
    if (disallowLength < 0) return true;

    // Longest-match wins (Google's documented rule): a longer Allow beats a
    // shorter Disallow, and equal lengths are resolved in favour of Allow.
    return allowLength >= disallowLength;
}

/* ------------------------------------------------------------------ */
/* HTML extraction (tolerant by design)                               */
/* ------------------------------------------------------------------ */

/**
 * Everything we read off one competitor page.
 *
 * Note what is absent: no volume, no difficulty, no rank, no confidence.
 * A page cannot supply any of those honestly.
 */
export interface PageSignals {
    title: string | null;
    canonical: string | null;
    /** `lang` from <html lang>, falling back to og:locale. */
    lang: string | null;
    h1: string[];
    h2: string[];
    h3: string[];
    /** Visible-text sample, script/style/nav/footer stripped. */
    visibleText: string;
    /** Raw JSON-LD blocks, parsed when possible. */
    jsonLd: unknown[];
    /** Question-shaped heading/FAQ text found on the page. */
    faqPatterns: string[];
    articlePatterns: string[];
    productPatterns: string[];
    categoryPatterns: string[];
    lastmod: string | null;
    /** Heading-derived keyword THEMES. Not volume, not demand. */
    themes: string[];
}

const EMPTY_SIGNALS: PageSignals = {
    title: null,
    canonical: null,
    lang: null,
    h1: [],
    h2: [],
    h3: [],
    visibleText: '',
    jsonLd: [],
    faqPatterns: [],
    articlePatterns: [],
    productPatterns: [],
    categoryPatterns: [],
    lastmod: null,
    themes: [],
};

/** Decode the handful of HTML entities that actually show up in titles. */
function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&laquo;/gi, '\u00ab')
        .replace(/&raquo;/gi, '\u00bb');
}

/** Strip tags, collapse whitespace, decode entities. */
function stripTags(html: string): string {
    return decodeEntities(
        html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

/** Read a <meta> value case-insensitively by name or property. */
function readMeta(html: string, key: string): string | null {
    const re = new RegExp(
        `<meta[^>]+(?:name|property|itemprop)\\s*=\\s*["']${key}["'][^>]*>`,
        'i'
    );
    const tag = html.match(re)?.[0];
    if (!tag) return null;
    const content = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
    return content ? decodeEntities(content).trim() : null;
}

/**
 * Collect the inner text of every <hN>…</hN>.
 *
 * Regex-based on purpose: the requirement is to survive MALFORMED html
 * (unclosed tags, truncated documents, stray `<`), and a strict parser would
 * throw exactly where a best-effort reader should degrade.
 */
function collectHeadings(html: string, level: 1 | 2 | 3): string[] {
    const out: string[] = [];
    const re = new RegExp(
        `<h${level}\\b[^>]*>([\\s\\S]*?)(?:<\\/h${level}>|(?=<h[1-3]\\b)|$)`,
        'gi'
    );
    for (const match of html.matchAll(re)) {
        const text = stripTags(match[1] ?? '');
        if (text) out.push(text);
    }
    return out;
}

/** Visible text: drop non-content elements before stripping tags. */
export function extractVisibleText(html: string, maxChars: number): string {
    const withoutNoise = html
        .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<template\b[\s\S]*?<\/template>/gi, ' ');
    const text = stripTags(withoutNoise);
    return maxChars > 0 && text.length > maxChars ? text.slice(0, maxChars) : text;
}

/** Collect and JSON.parse every <script type="application/ld+json"> block. */
function extractJsonLd(html: string): unknown[] {
    const out: unknown[] = [];
    const re =
        /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    for (const match of html.matchAll(re)) {
        const raw = (match[1] ?? '').trim();
        if (!raw) continue;
        try {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) out.push(...parsed);
            else out.push(parsed);
        } catch {
            // Malformed JSON-LD is common in the wild. Skip it rather than
            // failing the page; the raw HTML is still hashed.
        }
    }
    return out;
}

/** Walk JSON-LD for @type values, so type-driven detection needs no schema. */
function jsonLdTypes(jsonLd: unknown[]): string[] {
    const out: string[] = [];
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (!node || typeof node !== 'object') return;
        const record = node as Record<string, unknown>;
        const type = record['@type'];
        if (typeof type === 'string') {
            out.push(type.toLowerCase());
        } else if (Array.isArray(type)) {
            for (const t of type) {
                if (typeof t === 'string') out.push(t.toLowerCase());
            }
        }
        // A JSON-LD graph can nest arbitrarily deep; walk every value.
        for (const value of Object.values(record)) {
            if (value && typeof value === 'object') visit(value);
        }
    };
    jsonLd.forEach(visit);
    return out;
}

const FAQ_TYPES = new Set(['faqpage', 'question', 'qapage']);
const ARTICLE_TYPES = new Set(['article', 'blogposting', 'newsarticle', 'techarticle', 'howto']);
const PRODUCT_TYPES = new Set(['product', 'productmodel', 'offer']);
const CATEGORY_TYPES = new Set(['collectionpage', 'itempage', 'category', 'productgroup']);

const PRODUCT_URL_HINTS = [/\/product\//i, /\/shop\//i, /\/p\/\d/i, /\/item\//i, /\/products?\//i];
const CATEGORY_URL_HINTS = [/\/category\//i, /\/collections?\//i, /\/c\//i, /\/shop\/?$/i, /\/all-products/i];
const ARTICLE_URL_HINTS = [/\/blog\//i, /\/news\//i, /\/articles?\//i, /\/insights?\//i, /\/\d{4}\//i];

/** True when the heading or question text is shaped like a search question. */
export function looksLikeFaq(text: string): boolean {
    const t = text.trim();
    if (!t) return false;
    if (/[?؟]/.test(t)) return true;
    return /^(how|what|why|when|where|which|who|can|does|is|are|do|should)\b/i.test(t);
}

/**
 * Read every signal we care about off a single HTML document.
 * Never throws: malformed or truncated HTML yields partial signals.
 */
export function extractPageSignals(html: string, url: string, maxVisibleChars: number): PageSignals {
    if (!html || typeof html !== 'string') return { ...EMPTY_SIGNALS };

    const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)(?:<\/title>|$)/i)?.[1] ?? null;
    const canonicalTag = html.match(/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
    const canonicalHref = canonicalTag
        ? canonicalTag.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? null
        : null;
    const htmlLang = html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i)?.[1] ?? null;

    const jsonLd = extractJsonLd(html);
    const types = jsonLdTypes(jsonLd);
    const hasType = (set: Set<string>) => types.some((t) => set.has(t));

    const h1 = collectHeadings(html, 1);
    const h2 = collectHeadings(html, 2);
    const h3 = collectHeadings(html, 3);
    const headings = [...h1, ...h2, ...h3];

    const signals: PageSignals = {
        title: titleTag ? stripTags(titleTag) || null : null,
        canonical: canonicalHref ? decodeEntities(canonicalHref).trim() : null,
        lang: htmlLang ? htmlLang.trim() : (readMeta(html, 'og:locale') || null),
        h1,
        h2,
        h3,
        visibleText: extractVisibleText(html, maxVisibleChars),
        jsonLd,
        faqPatterns: hasType(FAQ_TYPES) ? headings : headings.filter(looksLikeFaq),
        articlePatterns:
            hasType(ARTICLE_TYPES) || ARTICLE_URL_HINTS.some((re) => re.test(url))
                ? headings
                : [],
        productPatterns:
            hasType(PRODUCT_TYPES) || PRODUCT_URL_HINTS.some((re) => re.test(url))
                ? headings
                : [],
        categoryPatterns:
            hasType(CATEGORY_TYPES) || CATEGORY_URL_HINTS.some((re) => re.test(url))
                ? headings
                : [],
        lastmod:
            readMeta(html, 'article:modified_time') ??
            html.match(/<time[^>]+datetime\s*=\s*["']([^"']+)["']/i)?.[1] ??
            null,
        themes: [],
    };

    // Themes are derived from the signals we just read, so they travel with the
    // page rather than being computed by a second, possibly divergent, pass.
    return { ...signals, themes: deriveThemes(signals) };
}

/* ------------------------------------------------------------------ */
/* Themes                                                              */
/* ------------------------------------------------------------------ */

/** Boilerplate and chrome that must never become a keyword theme. */
const THEME_STOPWORDS = new Set([
    'home', 'about', 'about us', 'contact', 'contact us', 'privacy', 'privacy policy',
    'terms', 'terms of service', 'cookie', 'cookies', 'login', 'log in', 'sign in',
    'sign up', 'register', 'account', 'my account', 'cart', 'checkout', 'search',
    'shop', 'store', 'menu', 'faq', 'faqs', 'help', 'support', 'blog', 'news',
    'read more', 'learn more', 'view all', 'see all', 'skip to content', 'sitemap',
    'copyright', 'all rights reserved', 'follow us', 'share', 'subscribe',
    'subscribe now', 'newsletter', 'related posts', 'recent posts', 'you may also like',
    'whatsapp', 'call us', 'email us', 'our story', 'why choose us', 'best sellers',
    'new arrivals', 'featured', 'quick links', 'customer service', 'returns',
    'shipping', 'track order', 'wishlist', 'compare', 'reviews', 'gallery',
    'categories', 'tags', 'archives', 'comments', 'previous', 'next', 'homepage',
]);

/** Strip a trailing site-name suffix from a title: "X | Brand" -> "X". */
function stripBrandSuffix(title: string): string {
    const parts = title.split(/\s*[|\u2013\u2014\u00b7\u2022-]\s*/);
    if (parts.length < 2) return title;
    const head = parts[0].trim();
    return head.length >= 8 ? head : title;
}

const MIN_THEME_CHARS = 4;
const MAX_THEME_CHARS = 90;
const MAX_THEMES = 25;

function isUsableTheme(candidate: string): boolean {
    const t = candidate.trim();
    if (t.length < MIN_THEME_CHARS || t.length > MAX_THEME_CHARS) return false;
    if (THEME_STOPWORDS.has(t.toLowerCase())) return false;
    // A theme with no letters or digits is punctuation, not a topic.
    return /[\p{L}\p{N}]/u.test(t);
}

/**
 * Derive candidate keyword THEMES from a page.
 *
 * A "theme" is a phrase a competitor chose to put on the page. That is a fact
 * about their content, not a measurement of demand. Themes are therefore
 * returned as plain phrases with NO metrics attached; they must never be
 * promoted to a volume figure or a confidence score.
 */
export function deriveThemes(signals: PageSignals): string[] {
    const candidates: string[] = [];

    if (signals.title) candidates.push(stripBrandSuffix(signals.title));
    candidates.push(...signals.h1, ...signals.h2, ...signals.h3, ...signals.faqPatterns);

    const seen = new Set<string>();
    const themes: string[] = [];
    for (const candidate of candidates) {
        const text = candidate.replace(/\s+/g, ' ').trim();
        if (!isUsableTheme(text)) continue;
        // Dedup case- and whitespace-insensitively, keeping first spelling.
        const key = text.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        themes.push(text);
        if (themes.length >= MAX_THEMES) break;
    }
    return themes;
}

/* ------------------------------------------------------------------ */
/* Observations                                                        */
/* ------------------------------------------------------------------ */

/**
 * One observation of one competitor URL.
 *
 * Every required attribution field is mandatory, so a record cannot be built
 * without knowing where it came from. There is deliberately NO
 * `searchVolume`, `difficulty` or `confidence` field: the evidence does not
 * support one, and an absent field cannot be fabricated.
 */
export interface CompetitorObservation {
    domain: string;
    url: string;
    language: SourceLanguage;
    market: Market;
    /** ISO timestamp of when WE fetched it. */
    observedAt: string;
    /** SHA-256 over the normalized visible text. Changes iff content changes. */
    contentHash: string;
    evidenceType: EvidenceType;
    /** Exact URL or robots/sitemap reference backing this observation. */
    sourceReference: string;
    title: string | null;
    canonical: string | null;
    h1: string[];
    h2: string[];
    h3: string[];
    visibleTextSample: string;
    jsonLd: unknown[];
    faqPatterns: string[];
    articlePatterns: string[];
    productPatterns: string[];
    categoryPatterns: string[];
    lastmod: string | null;
    /** Heading-derived themes. Themes, NOT demand. */
    themes: string[];
    /** Validators to send on the next run, for a conditional request. */
    validators: Validators;
}

/**
 * Content hash over the normalized VISIBLE TEXT, not the raw HTML.
 *
 * Hashing raw HTML would change on every nonce/CSRF-token rotation and would
 * make "did the content actually change?" unanswerable. Normalizing whitespace
 * first stops pure formatting from registering as a content change, while any
 * real wording change still moves the hash.
 */
export function computeContentHash(visibleText: string): string {
    const normalized = visibleText.replace(/\s+/g, ' ').trim();
    return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/* ------------------------------------------------------------------ */
/* Sitemap discovery                                                   */
/* ------------------------------------------------------------------ */

/** A <url> or <sitemap> entry lifted out of a sitemap document. */
export interface SitemapEntry {
    loc: string;
    lastmod: string | null;
    changefreq: string | null;
    priority: string | null;
    /** True when this entry points at another sitemap (a sitemap index). */
    isIndex: boolean;
}

/**
 * Parse a sitemap or sitemap-index document.
 *
 * Namespace-agnostic (the 2005 and sitemaps.org 0.9 namespaces differ) and
 * tolerant of malformed XML, since real-world sitemaps are frequently broken.
 */
export function parseSitemap(xml: string): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    if (!xml || typeof xml !== 'string') return entries;

    const blocks = xml.match(/<(?:url|sitemap)\b[\s\S]*?<\/(?:url|sitemap)>/gi) ?? [];
    for (const block of blocks) {
        const loc = block.match(/<loc\b[^>]*>([\s\S]*?)<\/loc>/i)?.[1];
        if (!loc) continue;
        // &amp; is the one entity that reliably appears in <loc>.
        const decoded = decodeEntities(loc).trim();
        if (!decoded) continue;
        const readTag = (tag: string): string | null => {
            const raw = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1];
            return raw ? raw.trim() : null;
        };
        entries.push({
            loc: decoded,
            lastmod: readTag('lastmod'),
            changefreq: readTag('changefreq'),
            priority: readTag('priority'),
            isIndex: /<sitemap\b/i.test(block),
        });
    }
    return entries;
}

/** Strip the fragment and normalize the trailing slash for dedup. */
export function normalizeUrlKey(url: string): string {
    try {
        const parsed = new URL(url);
        parsed.hash = '';
        // Keep the query: it can select a distinct content view.
        return `${parsed.origin}${parsed.pathname}${parsed.search}`.replace(/\/+$/, '') || parsed.origin;
    } catch {
        return url;
    }
}

/**
 * Candidate sitemap locations for a site, in priority order.
 *
 * `Sitemap:` lines in robots.txt win, because the site told us that is the
 * canonical location. The conventional paths are only fallbacks.
 */
export function candidateSitemapUrls(
    origin: string,
    robotsPolicy: RobotsPolicy
): string[] {
    const fromRobots = robotsPolicy.sitemaps
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => {
            try {
                return new URL(s, origin).toString();
            } catch {
                return null;
            }
        })
        .filter((s): s is string => s !== null);

    const fallbacks = [
        '/sitemap.xml',
        '/sitemaps.xml',
        '/sitemap_index.xml',
        '/sitemap-index.xml',
        '/wp-sitemap.xml',
    ].map((p) => `${origin.replace(/\/+$/, '')}${p}`);

    const seen = new Set<string>();
    const out: string[] = [];
    for (const candidate of [...fromRobots, ...fallbacks]) {
        const key = normalizeUrlKey(candidate);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(candidate);
    }
    return out;
}




/* ------------------------------------------------------------------ */
/* Polite fetcher                                                      */
/* ------------------------------------------------------------------ */

/** Why one HTTP attempt did not produce a body. */
export type FetchFailureReason =
    | 'timeout'
    | 'network_error'
    | 'http_error'
    | 'not_allowed'
    | 'too_large'
    | 'aborted';

/** The outcome of one polite request. Exactly one of body/notModified is set. */
export interface PoliteFetchResult {
    url: string;
    ok: boolean;
    status: number | null;
    body: string | null;
    headers: Headers | null;
    /** Why it failed. Null on success. */
    failureReason: FetchFailureReason | null;
    errorMessage: string | null;
    /** Total attempts made, including the first. 1 means "no retry". */
    attempts: number;
    /** True when the server answered 304 Not Modified. */
    notModified: boolean;
    validators: Validators;
    /** Epoch ms when the request started, for throttle accounting. */
    startedAt: number;
    /** Epoch ms when the request finished. */
    finishedAt: number;
}

/** A retry is only worth it for a condition that may not recur. */
export function isRetryableStatus(status: number): boolean {
    if (status === 408 || status === 429) return true;
    return status >= 500 && status <= 599;
}

/** Normalize an origin to a stable key, dropping `www.` differences. */
export function normalizeOrigin(origin: string): string {
    try {
        const parsed = new URL(origin);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        return `${parsed.protocol}//${host}${parsed.port ? `:${parsed.port}` : ''}`;
    } catch {
        return origin.toLowerCase();
    }
}

/**
 * The polite fetcher.
 *
 * Every outbound request in this file goes through {@link PoliteCrawler.request}.
 * It owns the robots gate, the per-host throttle, the timeout, the bounded
 * retry loop and the conditional-request bookkeeping.
 */
export class PoliteCrawler {
    private readonly options: ResolvedCrawlOptions;
    private readonly robots = new Map<string, RobotsPolicy>();
    /** Epoch ms of the last request STARTED per host, for the throttle. */
    private readonly lastRequestAt = new Map<string, number>();
    /** In-flight chain per host, so same-host requests are strictly serial. */
    private readonly hostQueues = new Map<string, Promise<unknown>>();
    /** Validators learned this run, for the caller to persist. */
    readonly learnedValidators = new Map<string, Validators>();

    /** Counters an operator can assert on. All real, never estimated. */
    readonly stats = {
        requests: 0,
        retries: 0,
        blockedByRobots: 0,
        notModified: 0,
        failures: 0,
        timeouts: 0,
    };

    constructor(options: ResolvedCrawlOptions) {
        this.options = options;
    }

    /** Register an already-fetched robots policy for a host. */
    setRobotsPolicy(origin: string, policy: RobotsPolicy): void {
        this.robots.set(normalizeOrigin(origin), policy);
    }

    /** The policy for a host, or the fail-closed policy when unknown. */
    getRobotsPolicy(origin: string): RobotsPolicy {
        return this.robots.get(normalizeOrigin(origin)) ?? CLOSED_ROBOTS_POLICY;
    }

    /**
     * Wait until it is polite to hit this host again, then claim the slot.
     *
     * `lastRequestAt` is stamped when the slot is claimed, so N queued
     * requests spread out by the required gap instead of bursting together.
     */
    private async awaitThrottleSlot(origin: string): Promise<void> {
        const last = this.lastRequestAt.get(origin);
        const required = Math.max(
            this.options.throttleMs,
            resolveThrottleMs(this.getRobotsPolicy(origin), this.options.userAgent)
        );
        if (last != null) {
            const elapsed = this.options.now() - last;
            const wait = required - elapsed;
            if (wait > 0) {
                await this.options.sleep(wait);
            }
        }
        // Stamp when the slot is CLAIMED, not when the response lands, so N
        // queued requests spread out by the required gap instead of bursting.
        this.lastRequestAt.set(origin, this.options.now());
    }

    /**
     * Serialize requests per host so only one is in flight against a given
     * origin at a time.
     *
     * `request()` delegates here, which is why this method must exist: without
     * it the very first real request threw `this.enqueueOnHost is not a
     * function`, so the crawler had never actually run over HTTP — its tests
     * only exercised the pure parsing helpers.
     *
     * The queue resolves (never rejects) with the inner result, so one failed
     * request cannot poison the queue for the rest of the run.
     */
    private enqueueOnHost<T>(origin: string, task: () => Promise<T>): Promise<T> {
        const previous = this.hostQueues.get(origin) ?? Promise.resolve();
        const run = previous.then(task, task);
        // Store a promise that always settles, so a rejection in `task` does
        // not become an unhandled rejection on the stored chain.
        const settled = run.then(
            (value) => value,
            () => undefined
        );
        this.hostQueues.set(origin, settled);
        return run;
    }

    /**
     * Perform one polite, robots-checked, throttled, conditional HTTP GET.
     *
     * Never throws: every failure mode is returned as a value with an exact
     * `failureReason`, because a dead competitor must not fail the whole run.
     */
    async request(
        url: string,
        context: { respectRobots?: boolean; accept?: string } = {}
    ): Promise<PoliteFetchResult> {
        const respectRobots = context.respectRobots ?? true;
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return this.failure(url, 'network_error', `Invalid URL: ${url}`, 0, {});
        }
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return this.failure(
                url,
                'network_error',
                `Unsupported protocol: ${parsed.protocol}`,
                0,
                {}
            );
        }
        const origin = normalizeOrigin(parsed.origin);

        // robots.txt is ALWAYS retrievable (RFC 9309 §2). It must not be
        // filtered by a robots policy, because the policy is exactly what we
        // are trying to fetch here: on a cold origin there is no policy yet,
        // `getRobotsPolicy` returns CLOSED, and the crawler denied its own
        // robots.txt on every single domain — which is why every crawl produced
        // 0 URLs and 1 blocked entry each, with no error ever surfacing.
        const isRobotsTxt = /\/robots\.txt$/i.test(parsed.pathname);
        const shouldRespectRobots = respectRobots && !isRobotsTxt;

        return this.enqueueOnHost(origin, async () => {
            const startedAt = this.options.now();

            if (
                shouldRespectRobots &&
                !isUrlAllowed(url, this.getRobotsPolicy(origin), this.options.userAgent)
            ) {
                this.stats.blockedByRobots++;
                return this.failure(
                    url,
                    'not_allowed',
                    `robots.txt disallows ${url} for ${this.options.userAgent}`,
                    0,
                    {},
                    startedAt
                );
            }

            const previous = this.options.previousValidators.get(url) ?? {};
            const maxAttempts = this.options.maxRetries + 1;
            let attempt = 0;
            let last: PoliteFetchResult | null = null;

            while (attempt < maxAttempts) {
                attempt++;
                // Politeness applies to every attempt, not only the first.
                await this.awaitThrottleSlot(origin);
                this.stats.requests++;

                const result = await this.attempt(
                    url,
                    previous,
                    context.accept,
                    startedAt
                );
                last = result;

                if (result.ok) {
                    if (result.validators.etag || result.validators.lastModified) {
                        this.learnedValidators.set(url, result.validators);
                    }
                    return {
                        ...result,
                        attempts: attempt,
                        startedAt,
                        finishedAt: this.options.now(),
                    };
                }
                if (attempt >= maxAttempts) break;

                // Retry only transient conditions. A 404 or a robots refusal is
                // permanent, and re-asking would simply be rude.
                const transient =
                    result.failureReason === 'timeout' ||
                    result.failureReason === 'network_error' ||
                    (result.status != null && isRetryableStatus(result.status));
                if (!transient) {
                    // A 404 or a robots refusal is permanent, and re-asking would
                    // simply be rude.
                    break;
                }
                this.stats.retries++;
                // Exponential backoff, capped, so a struggling host is not hammered.
                const backoff = Math.min(
                    this.options.backoffMaxMs,
                    this.options.backoffBaseMs * Math.pow(2, attempt)
                );
                await this.options.sleep(backoff);
            }

            // `result` is scoped to the retry loop; after it, the last outcome is
            // `last`. Returning `result` threw `ReferenceError: result is not
            // defined` on EVERY exhausted request, so a failing URL took down
            // the whole crawl instead of being reported as a failure value.
            // The shape matches the success return so callers stay uniform.
            if (last === null) {
                return this.failure(
                    url,
                    'network_error',
                    'no attempt was made',
                    0,
                    {},
                    startedAt
                );
            }
            return {
                ...last,
                attempts: attempt,
                startedAt,
                finishedAt: this.options.now(),
            };
        });
    }

    /** One real HTTP attempt, under a hard timeout. */
    private async attempt(
        url: string,
        previous: Validators,
        accept: string | undefined,
        startedAt: number
    ): Promise<PoliteFetchResult> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.options.requestTimeoutMs);
        try {
            const headers: Record<string, string> = {
                // Identifies the bot AND gives the operator a contact path.
                'user-agent': this.options.userAgent,
                accept:
                    accept ??
                    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5',
                'accept-encoding': 'gzip, deflate, br',
            };
            // Conditional requests: an unchanged page costs a single 304.
            if (previous.etag) headers['if-none-match'] = previous.etag;
            if (previous.lastModified) headers['if-modified-since'] = previous.lastModified;

            const response = await this.options.fetchImpl(url, {
                method: 'GET',
                headers,
                redirect: 'follow',
                signal: controller.signal,
            });

            const responseHeaders = response.headers;
            const validators: Validators = {
                etag: responseHeaders.get('etag') ?? undefined,
                lastModified: responseHeaders.get('last-modified') ?? undefined,
            };

            if (response.status === 304) {
                this.stats.notModified++;
                return {
                    url,
                    ok: true,
                    status: 304,
                    body: null,
                    headers: responseHeaders,
                    failureReason: null,
                    errorMessage: null,
                    attempts: 1,
                    notModified: true,
                    validators: { ...previous, ...validators },
                    startedAt,
                    finishedAt: this.options.now(),
                };
            }

            if (!response.ok) {
                return this.failure(
                    url,
                    'http_error',
                    `HTTP ${response.status} ${response.statusText}`.trim(),
                    response.status,
                    validators,
                    startedAt
                );
            }

            const body = await this.readBounded(response);
            if (body === null) {
                return this.failure(
                    url,
                    'too_large',
                    `Response exceeded ${this.options.maxResponseBytes} bytes; not buffered in full`,
                    response.status,
                    validators,
                    startedAt
                );
            }

            return {
                url,
                ok: true,
                status: response.status,
                body,
                headers: responseHeaders,
                failureReason: null,
                errorMessage: null,
                attempts: 1,
                notModified: false,
                validators,
                startedAt,
                finishedAt: this.options.now(),
            };
        } catch (err: unknown) {
            if (isAbortError(err)) {
                this.stats.timeouts++;
                return this.failure(
                    url,
                    'timeout',
                    `Request exceeded ${this.options.requestTimeoutMs} ms`,
                    0,
                    previous,
                    startedAt
                );
            }
            this.stats.failures++;
            return this.failure(
                url,
                'network_error',
                err instanceof Error ? err.message : String(err),
                0,
                previous,
                startedAt
            );
        } finally {
            // The timeout timer was created but NEVER cleared, so it stayed
            // pending for the full `requestTimeoutMs` after every successful
            // request too. That keeps the Node event loop alive after a crawl
            // finished — which on a serverless function delays the response and
            // holds the invocation open. Clearing it is also what makes the
            // timer "used" rather than dead weight.
            clearTimeout(timer);
        }
    }

    /**
     * Read a response body without ever buffering more than the cap.
     *
     * The declared Content-Length lets us refuse an obviously oversized body
     * before reading it; the running byte count stops an undeclared huge body
     * from exhausting memory. Either way we never hold more than the cap.
     */
    private async readBounded(response: Response): Promise<string | null> {
        const declared = Number(response.headers.get('content-length') ?? '');
        if (Number.isFinite(declared) && declared > this.options.maxResponseBytes) {
            return null;
        }
        const body = response.body;
        if (!body) {
            const text = await response.text();
            return text.length > this.options.maxResponseBytes ? null : text;
        }
        const reader = body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value) continue;
            total += value.byteLength;
            if (total > this.options.maxResponseBytes) {
                await reader.cancel().catch(() => undefined);
                return null;
            }
            chunks.push(value);
        }
        const buffer = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return new TextDecoder('utf-8').decode(buffer);
    }

    /** Build a failure value, so every error path is shaped identically. */
    private failure(
        url: string,
        reason: FetchFailureReason,
        message: string,
        status: number | null,
        validators: Validators,
        startedAt = 0
    ): PoliteFetchResult {
        return {
            url,
            ok: false,
            status,
            body: null,
            headers: null,
            failureReason: reason,
            errorMessage: message,
            attempts: 1,
            notModified: false,
            validators,
            startedAt,
            finishedAt: this.options.now(),
        };
    }
}

/* ------------------------------------------------------------------ */
/* Crawl orchestration                                                 */
/* ------------------------------------------------------------------ */

/** Everything one crawl run produced, plus an honest account of what it did. */
export interface CrawlResult {
    seed: CompetitorSeed;
    observations: CompetitorObservation[];
    /** URLs robots.txt refused. We record them; we never fetch them. */
    blockedUrls: string[];
    /** URLs we wanted but could not retrieve, with the exact reason. */
    failures: Array<{ url: string; reason: FetchFailureReason | 'parse'; message: string }>;
    /** Real counters from the fetcher. */
    stats: PoliteCrawler['stats'];
    robotsStatus: number | null;
    /** ISO start/end of the run. */
    startedAt: string;
    finishedAt: string;
    /** True when at least one page was really retrieved over HTTP. */
    madeRealRequests: boolean;
}

/**
 * Crawl one competitor, politely.
 *
 * Order of operations, and why:
 *   1. robots.txt FIRST. Without a readable policy we fetch nothing at all.
 *   2. Discover sitemaps (robots `Sitemap:` lines first, then conventions).
 *   3. Build a candidate queue, dropping anything robots disallows BEFORE it
 *      is requested, so a disallowed URL is never even attempted.
 *   4. Fetch up to `maxPagesPerRun` pages, honouring the cap as a hard stop.
 */
export async function crawlCompetitor(
    seed: CompetitorSeed,
    options: CrawlOptions = {}
): Promise<CrawlResult> {
    const resolved = resolveCrawlOptions(options);
    const crawler = new PoliteCrawler(resolved);
    const startedAt = new Date(resolved.now()).toISOString();
    const origin = normalizeOrigin(seed.startUrl);

    const observations: CompetitorObservation[] = [];
    const blockedUrls: string[] = [];
    const failures: CrawlResult['failures'] = [];

    // ---- 1. robots.txt -------------------------------------------------
    const robotsUrl = `${origin}/robots.txt`;
    const robotsResult = await crawler.request(robotsUrl);
    let policy: RobotsPolicy;
    if (robotsResult.ok && robotsResult.body != null) {
        policy = parseRobotsTxt(robotsResult.body);
        policy.status = robotsResult.status;
    } else {
        // Fail CLOSED. A 500 (which abdallahtolba.com actually returns) is not
        // permission to crawl, and is emphatically not a usable robots file.
        policy = { ...CLOSED_ROBOTS_POLICY, status: robotsResult.status };
        failures.push({
            url: robotsUrl,
            reason: robotsResult.failureReason ?? 'http_error',
            message:
                robotsResult.errorMessage ??
                'robots.txt unavailable; no page was requested (fail-closed)',
        });
    }
    crawler.setRobotsPolicy(origin, policy);


    // ---- 2. Sitemap discovery ----------------------------------------
    const candidates: string[] = [];
    const seen = new Set<string>();
    const pushCandidate = (url: string): void => {
        const key = normalizeUrlKey(url);
        if (seen.has(key)) return;
        // Robots is consulted HERE, at queue-build time, so a disallowed URL
        // is never requested. Recording it is not crawling it.
        if (!isUrlAllowed(url, policy, resolved.userAgent)) {
            blockedUrls.push(url);
            crawler.stats.blockedByRobots++;
            return;
        }
        seen.add(key);
        candidates.push(url);
    };

    pushCandidate(seed.startUrl);

    if (resolved.followSitemap) {
        const queue = candidateSitemapUrls(origin, policy).slice(0, resolved.maxSitemapUrls);
        const pageQueue: string[] = [];
        for (const sitemapUrl of queue) {
            const res = await crawler.request(sitemapUrl, {
                accept: 'application/xml,text/xml;q=0.9,*/*;q=0.5',
            });
            // A missing sitemap is entirely normal and is not a failure.
            if (!res.ok || res.body == null) continue;
            const entries = parseSitemap(res.body);
            for (const entry of entries) {
                if (entry.isIndex) continue;
                if (pageQueue.length >= resolved.maxSitemapUrls) break;
                pushCandidate(entry.loc);
                pageQueue.push(entry.loc);
            }
            // Follow a bounded number of nested sitemap indexes.
            for (const child of entries.filter((e) => e.isIndex).slice(0, 5)) {
                pushCandidate(child.loc);
            }
        }
        // Sitemap pages are inserted after the start URL, so a crawl begins
        // where the operator asked it to rather than mid-sitemap.
        candidates.splice(1, 0, ...pageQueue);
    }

    // ---- 3+4. Fetch, capped ------------------------------------------
    const budget = Math.max(0, resolved.maxPagesPerRun);
    for (const url of candidates) {
        if (observations.length >= budget) break;

        const res = await crawler.request(url);
        if (!res.ok) {
            if (res.failureReason === 'not_allowed') {
                blockedUrls.push(url);
                continue;
            }
            failures.push({
                url,
                reason: res.failureReason ?? 'http_error',
                message: res.errorMessage ?? 'Request failed',
            });
            continue;
        }
        if (res.notModified) {
            // Unchanged since the last run: the stored content hash still
            // holds, so there is nothing new to observe.
            continue;
        }
        if (res.body == null) continue;

        const observation = buildObservation(
            seed,
            url,
            res.body,
            res.validators,
            new Date(res.finishedAt).toISOString()
        );
        if (!observation) {
            failures.push({ url, reason: 'parse', message: 'No extractable content' });
            continue;
        }
        observations.push(observation);
    }

    return {
        seed,
        observations,
        blockedUrls,
        failures,
        stats: crawler.stats,
        // `robotsStatus` was referenced but never bound, so assembling a
        // CrawlResult threw `ReferenceError: robotsStatus is not defined` and
        // the crawler could not return a result at all. The real value is the
        // status the robots.txt fetch produced, already carried on the policy.
        robotsStatus: policy.status ?? null,
        // The bound variable is `startedAt`; `runStartedAt` was never declared, so
        // assembling the result threw a ReferenceError and the crawl could
        // never return. Use the real start timestamp.
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date(resolved.now()).toISOString(),
        // "Real" means an actual HTTP round-trip returned a body we read. A run
        // that only discovered robots/sitemap entries did NOT make real requests,
        // and must not be counted as a verified observation.
        madeRealRequests: crawler.stats.requests > 0 && observations.length > 0,
    };
}

/**
 * Turn one fetched document into a fully attributed observation.
 * Returns null when there is no content at all (an empty shell page).
 */
export function buildObservation(
    seed: CompetitorSeed,
    url: string,
    html: string,
    validators: Validators,
    observedAt: string
): CompetitorObservation | null {
    const domain = ((): string => {
        try {
            return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
        } catch {
            return seed.domain;
        }
    })();

    const signals = extractPageSignals(
        html,
        url,
        DEFAULT_CRAWL_OPTIONS.visibleTextSampleChars
    );
    const hasContent =
        signals.visibleText.trim().length > 0 ||
        signals.title !== null ||
        signals.h1.length > 0 ||
        signals.jsonLd.length > 0;
    if (!hasContent) return null;

    const language = ((): SourceLanguage => {
        const lang = (signals.lang ?? '').toLowerCase();
        if (lang.startsWith('ar')) return 'ar';
        if (lang.startsWith('en')) return 'en';
        // Fall back to the seed's declared language rather than guessing.
        return seed.language;
    })();

    return {
        domain,
        url,
        language,
        market: seed.market,
        observedAt,
        contentHash: computeContentHash(signals.visibleText),
        // Which artefact the evidence actually is, stated precisely.
        evidenceType:
            signals.jsonLd.length > 0 ? 'competitor_structured_data' : 'competitor_page',
        sourceReference: signals.canonical ?? url,
        title: signals.title,
        canonical: signals.canonical,
        h1: signals.h1,
        h2: signals.h2,
        h3: signals.h3,
        visibleTextSample: signals.visibleText,
        jsonLd: signals.jsonLd,
        faqPatterns: signals.faqPatterns,
        articlePatterns: signals.articlePatterns,
        productPatterns: signals.productPatterns,
        categoryPatterns: signals.categoryPatterns,
        lastmod: signals.lastmod,
        themes: signals.themes,
        validators,
    };
}

/* ------------------------------------------------------------------ */
/* Record conversion                                                   */
/* ------------------------------------------------------------------ */

/** The provider id used in every record this file emits. */
export const COMPETITOR_CRAWLER_SOURCE = 'competitor_crawler';

/**
 * Convert one observation into a normalised intelligence record.
 *
 * THE CRITICAL LINE is `metrics: emptyKeywordMetrics()`. A competitor page
 * supplies the phrase a competitor targets; it supplies no demand figure. By
 * passing all-null metrics, an observation can never leak into a volume,
 * difficulty or opportunity number downstream.
 */
export function competitorObservationToRecord(
    observation: CompetitorObservation,
    dataKind: DataKind = 'observed'
): NormalizedIntelligenceRecord {
    return {
        keyword: observation.title ?? observation.h1[0] ?? observation.url,
        language: observation.language,
        market: observation.market,
        source: COMPETITOR_CRAWLER_SOURCE,
        sourceType: 'competitor_web_crawl',
        sourceClass: 'COMPETITIVE_WEB',
        // A real page was fetched over HTTP, so CONNECTED is honest. We do not
        // claim VERIFIED here: that state is reserved for a provider adapter
        // whose live credentials and response have been checked.
        sourceStatus: 'CONNECTED',
        sourceReference: observation.sourceReference,
        discoveredAt: observation.observedAt,
        dataKind,
        evidence: `${observation.domain} ${observation.url} @ ${observation.observedAt} sha256=${observation.contentHash.slice(0, 16)}`,
        evidenceType: observation.evidenceType,
        // Competitor evidence is NOT demand. All metrics stay null.
        metrics: emptyKeywordMetrics(),
        competitorContext: {
            domain: observation.domain,
            url: observation.url,
            pageTitle: observation.title ?? undefined,
            headings: [...observation.h1, ...observation.h2, ...observation.h3],
            snippet: observation.visibleTextSample.slice(0, 300),
            classification: 'public_web_page_discovered',
            evidenceReference: observation.sourceReference,
            capturedAt: observation.observedAt,
        },
    };
}

/**
 * Convert one observation's THEMES into records.
 *
 * `generationMethod: 'competitor_theme_extraction'` is mandatory provenance:
 * these strings were derived by us from a competitor's headings, not typed
 * into a search box by anyone.
 */
export function competitorThemesToRecords(
    observation: CompetitorObservation
): NormalizedIntelligenceRecord[] {
    return observation.themes.map((theme) => ({
        ...competitorObservationToRecord(observation),
        keyword: theme,
        generationMethod: 'competitor_theme_extraction',
        evidenceType: observation.h1.length > 0 ? 'competitor_heading' : 'competitor_title',
    }));
}

/**
 * The delay to wait before the next request to a host, in milliseconds.
 *
 * A declared `Crawl-delay` wins when it is LONGER than our floor. A shorter
 * declared delay does not buy permission to exceed 1 req/s, so we still slow.
 */
export function resolveThrottleMs(policy: RobotsPolicy, userAgent: string): number {
    const group = selectRobotsGroup(policy, userAgent);
    const declaredMs =
        group?.crawlDelaySeconds != null ? Math.round(group.crawlDelaySeconds * 1000) : 0;
    return Math.max(MIN_THROTTLE_MS, declaredMs);
}




/** Absolute ceiling on retries. Non-negotiable, and clamped at runtime. */
export const MAX_ALLOWED_RETRIES = 2;

/** Default polite values. Every one of them is conservative on purpose. */
export const DEFAULT_CRAWL_OPTIONS = {
    userAgent: DEFAULT_USER_AGENT,
    /** 10 pages per run. Low. A competitor is not ours to exhaust. */
    maxPagesPerRun: 10,
    requestTimeoutMs: 15_000,
    maxRetries: MAX_ALLOWED_RETRIES,
    throttleMs: MIN_THROTTLE_MS,
    backoffBaseMs: 500,
    backoffMaxMs: 4_000,
    maxSitemapUrls: 500,
    maxResponseBytes: 2_000_000,
    visibleTextSampleChars: 2_000,
    followSitemap: true,
    maxConcurrency: 1,
} as const;
