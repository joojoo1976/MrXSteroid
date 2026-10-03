/**
 * server/seo/sources/competitorPersistence.ts
 * ============================================================================
 * Persist real competitor-crawl observations into the EXISTING schema.
 * ============================================================================
 * WHY THIS FILE EXISTS
 * -------------------
 * `competitorCrawler.ts` was complete and tested but was never called by the
 * runtime: the refresh run reported `competitor_web` as BLOCKED with the reason
 * "no credential needed; requires a completed robots-compliant crawl". That is
 * a WIRING gap, not a credential gap — the crawler reads no environment
 * variables at all. `seo_competitor_observations` stayed empty.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * --------------------------------
 * It does not invent demand. A competitor page tells us WHAT a competitor
 * targets, never HOW MANY people search it. Every persisted observation writes
 * only what the crawl actually saw; no volume-like number is ever written.
 *
 * SCHEMA (read from Production 2026-10-01, not assumed)
 * ----------------------------------------------------
 *   seo_competitors              id, domain, name, competitor_type, is_active,
 *                                notes, created_at
 *   seo_competitor_observations  id, competitor_id (FK), keyword_id (nullable),
 *                                url, title, headings (jsonb), observed_at,
 *                                content_hash, signals (jsonb), created_at
 *
 * `content_hash` is the natural key for "did this page actually change", so a
 * re-run is idempotent: an unchanged page is not re-inserted.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
    crawlCompetitor,
    competitorObservationToRecord,
    COMPETITOR_CRAWLER_SOURCE,
    CURATED_COMPETITOR_SEEDS,
    type CompetitorObservation,
    type CompetitorSeed,
    type CrawlOptions,
} from './competitorCrawler';

export interface CompetitorPersistOutcome {
    seeds: number;
    domainsCrawled: number;
    urlsDiscovered: number;
    observationsGenerated: number;
    observationsPersisted: number;
    /** Rows skipped because the content hash was unchanged. */
    duplicates: number;
    failures: Array<{ domain: string; url: string; message: string }>;
    robotsDenied: number;
}

/**
 * Crawl each seed once and persist what came back.
 *
 * Called ONCE per weekly run. The crawler itself enforces robots, the page
 * cap, the per-host throttle, timeouts and retries, so this function adds no
 * second, competing rate limiter.
 */
export async function crawlAndPersistCompetitors(
    supabase: SupabaseClient,
    options: {
        seeds?: readonly CompetitorSeed[];
        crawl?: CrawlOptions;
        maxSeeds?: number;
    } = {}
): Promise<CompetitorPersistOutcome> {
    const seeds = options.seeds ?? CURATED_COMPETITOR_SEEDS;
    // A hard ceiling per run so one bad host cannot extend the weekly job.
    const limited = seeds.slice(0, options.maxSeeds ?? seeds.length);

    const out: CompetitorPersistOutcome = {
        seeds: limited.length,
        domainsCrawled: 0,
        urlsDiscovered: 0,
        observationsGenerated: 0,
        observationsPersisted: 0,
        duplicates: 0,
        failures: [],
        robotsDenied: 0,
    };

    for (const seed of limited) {
        const result = await crawlCompetitor(seed, options.crawl ?? {});

        out.domainsCrawled += 1;
        out.urlsDiscovered += result.observations.length;
        out.observationsGenerated += result.observations.length;
        out.robotsDenied += result.blockedUrls.length;
/** Resolve (or create) the competitor row. Idempotent on `domain`. */
async function upsertCompetitor(
    supabase: SupabaseClient,
    seed: CompetitorSeed
): Promise<string | null> {
    const { data, error } = await supabase
        .from('seo_competitors')
        .select('id')
        .eq('domain', seed.domain)
        .maybeSingle();
    if (error) return null;
    if (data?.id) return data.id as string;

    const ins = await supabase
        .from('seo_competitors')
        .insert({
            domain: seed.domain,
            name: seed.label,
            competitor_type: 'CONTENT',
            is_active: true,
            notes: `market=${seed.market} language=${seed.language} source=${COMPETITOR_CRAWLER_SOURCE}`,
        })
        .select('id')
        .single();
    if (ins.error) return null;
    return ins.data?.id as string;
}

/**
 * Insert one observation unless its content hash is already stored.
 *
 * Returns 'inserted' | 'duplicate' | an error message. The hash comparison is
 * what makes a re-run idempotent without adding a new unique constraint.
 */
async function insertObservation(
    supabase: SupabaseClient,
    competitorId: string,
    observation: CompetitorObservation
): Promise<'inserted' | 'duplicate' | string> {
    const existing = await supabase
        .from('seo_competitor_observations')
        .select('id')
        .eq('competitor_id', competitorId)
        .eq('url', observation.url)
        .eq('content_hash', observation.contentHash)
        .maybeSingle();
    if (existing.error) return existing.error.message;
    if (existing.data?.id) return 'duplicate';

    const record = competitorObservationToRecord(observation);
    const { error } = await supabase.from('seo_competitor_observations').insert({
        competitor_id: competitorId,
        // A competitor page is not one of OUR keywords, so keyword_id stays null.
        // Guessing a link here would fabricate an association.
        keyword_id: null,
        url: observation.url,
        title: observation.title,
        headings: {
            h1: observation.h1,
            h2: observation.h2,
            h3: observation.h3,
            canonical: observation.canonical,
            faq: observation.faqPatterns,
            article: observation.articlePatterns,
            product: observation.productPatterns,
            category: observation.categoryPatterns,
            themes: observation.themes,
        },
        observed_at: observation.observedAt,
        content_hash: observation.contentHash,
        // Everything else the crawl proved. No demand figures exist here, so
        // none are written.
        signals: {
            language: observation.language,
            market: observation.market,
            evidenceType: record.evidenceType,
            sourceReference: observation.sourceReference,
            lastmod: observation.lastmod,
            visibleTextSample: observation.visibleTextSample.slice(0, 600),
            dataKind: record.dataKind,
        },
    });

    return error ? error.message : 'inserted';
}
        for (const f of result.failures) {
            out.failures.push({ domain: seed.domain, url: f.url, message: f.message });
        }

        // A crawl that retrieved nothing over HTTP produced no evidence. It is
        // reported as a failure, never as an empty success.
        if (!result.madeRealRequests) continue;

        const competitorId = await upsertCompetitor(supabase, seed);
        if (!competitorId) {
            out.failures.push({
                domain: seed.domain,
                url: seed.startUrl,
                message: 'could not register the competitor row',
            });
            continue;
        }

        for (const observation of result.observations) {
            const r = await insertObservation(supabase, competitorId, observation);
            if (r === 'inserted') out.observationsPersisted += 1;
            else if (r === 'duplicate') out.duplicates += 1;
            else out.failures.push({ domain: seed.domain, url: observation.url, message: r });
        }
    }

    return out;
}