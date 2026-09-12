/**
 * server/seo/types.ts
 * Core types for Live SEO Keyword Intelligence System.
 */

export type SeoLanguage = 'en' | 'ar';

export type SearchIntent =
    | 'informational'
    | 'commercial'
    | 'transactional'
    | 'navigational'
    | 'comparison'
    | 'question'
    | 'unknown';

export type TrendStatus = 'new' | 'rising' | 'stable' | 'declining' | 'retired';

export type KeywordSource =
    | 'baseline'
    | 'internal_search'
    | 'trend'
    | 'seasonal'
    | 'competitor'
    | 'admin';

export type DestinationType =
    | 'tool'
    | 'page'
    | 'category'
    | 'product'
    | 'article'
    | 'search'
    | 'opportunity';

export interface ScoreComponents {
    relevance: number;        // 0-100: how relevant to bodybuilding / AAS / metabolic science
    demand: number;           // 0-100: estimated search demand level
    trend: number;            // 0-100: recent momentum / search growth
    commercial: number;       // 0-100: proximity to buying/booking a cycle/plan
    freshness: number;        // 0-100: recency decay score
    seasonal: number;         // 0-100: seasonal relevance for current month
    competitorGap?: number;   // 0-100: opportunity detected in competitor analysis
    competitionPenalty: number; // 0-50: penalty for ultra-crowded generic terms
    duplicatePenalty: number;   // 0-50: penalty for near-duplicates
}

export interface SeoKeyword {
    id?: string;
    keyword?: string;
    language: SeoLanguage;
    locale: string;
    originalKeyword: string;
    normalizedKeyword: string;
    cluster: string;
    intent: SearchIntent;
    trendStatus: TrendStatus;
    destinationPath: string;
    destinationType?: DestinationType;
    score: number;
    scoreComponents: ScoreComponents;
    source: KeywordSource;
    lastObservedAt: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SeoKeywordSnapshotData {
    language: SeoLanguage;
    year: number;
    weekNumber: number;
    generatedAt: string;
    totalKeywords: number;
    categories: {
        all: SeoKeyword[];
        trending: SeoKeyword[];
        rising: SeoKeyword[];
        guides: SeoKeyword[];
        tools: SeoKeyword[];
        plans: SeoKeyword[];
    };
    stats: {
        averageScore: number;
        intentsDistribution: Record<SearchIntent, number>;
        clustersDistribution: Record<string, number>;
    };
}

export interface SeoKeywordSnapshot {
    id: string;
    language: SeoLanguage;
    year: number;
    weekNumber: number;
    snapshotData: SeoKeywordSnapshotData;
    createdAt: string;
}

export interface SeoRefreshRun {
    id: string;
    startedAt: string;
    finishedAt?: string;
    status: 'running' | 'completed' | 'failed';
    keywordsScanned: number;
    newKeywords: number;
    updatedKeywords: number;
    retiredKeywords: number;
    duplicatesPrevented: number;
    errorLog?: string;
    snapshotId?: string;
    summary?: Record<string, unknown>;
}

export type KeywordFilterCategory =
    | 'all'
    | 'trending'
    | 'rising'
    | 'guides'
    | 'tools'
    | 'plans';

export interface ScoringWeights {
    relevanceWeight: number;
    demandWeight: number;
    trendWeight: number;
    commercialWeight: number;
    freshnessWeight: number;
    seasonalWeight: number;
    competitorGapWeight: number;
    competitionPenaltyWeight: number;
    duplicatePenaltyWeight: number;
}
