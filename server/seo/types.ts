/**
 * server/seo/types.ts
 * Core types for Global SEO Keyword Intelligence Platform v3.0.
 * Maintains full backward compatibility while expanding to multi-market provenance,
 * lifecycle management, human-in-the-loop review, and precision scoring.
 */

export type SeoLanguage = 'en' | 'ar';

export type SearchIntent =
    | 'informational'
    | 'commercial'
    | 'transactional'
    | 'navigational'
    | 'comparison'
    | 'question'
    | 'unknown'
    | 'product'
    | 'category'
    | 'brand'
    | 'longtail'
    | 'local'
    | 'trending'
    | 'rising'
    | 'seasonal'
    | 'competitor_gap'
    | 'tool'
    | 'review'
    | 'safety'
    | 'medical_information';

export type TrendStatus = 'new' | 'rising' | 'stable' | 'declining' | 'retired';

export type LifecycleStatus =
    | 'candidate'
    | 'experimental'
    | 'pending_review'
    | 'approved'
    | 'active'
    | 'retired'
    | 'blocked';

export type DataQualityType =
    | 'verified'
    | 'modeled'
    | 'internal'
    | 'editorial'
    | 'ai_suggested'
    | 'unknown';

export type KeywordSource =
    | 'baseline'
    | 'internal_search'
    | 'trend'
    | 'seasonal'
    | 'competitor'
    | 'admin'
    | 'google_search_console'
    | 'google_trends'
    | 'keyword_planner'
    | 'ahrefs'
    | 'semrush'
    | 'similarweb'
    | 'analytics'
    | 'competitor_page'
    | 'editorial'
    | 'ai_suggested';

export type DestinationType =
    | 'tool'
    | 'page'
    | 'category'
    | 'product'
    | 'article'
    | 'search'
    | 'opportunity'
    | 'faq'
    | 'landing_page';

export interface ScoreComponents {
    relevance: number;        // R: 0-100: how relevant to bodybuilding / AAS / metabolic science
    demand: number;           // D: 0-100: estimated search demand level
    trend: number;            // G: 0-100: recent momentum / search growth
    intent?: number;          // I: 0-100: intent alignment score
    commercial: number;       // C: 0-100: proximity to buying/booking a cycle/plan
    conversion?: number;      // V: 0-100: estimated conversion potential
    freshness: number;        // F: 0-100: recency decay score
    seasonal: number;         // S: 0-100: seasonal relevance for current month
    competitorGap?: number;   // A: 0-100: authority/competitor gap score
    organicPerformance?: number; // O: 0-100: organic ranking performance
    competitionPenalty: number; // K: 0-50: penalty for ultra-crowded generic terms
    duplicatePenalty: number;   // Pd: 0-50: penalty for near-duplicates
    repetitionPenalty?: number; // Pr: 0-50: penalty for repetitive term exposure
    cannibalizationPenalty?: number; // Pc: 0-50: penalty for keyword cannibalization
}

export interface SeoKeyword {
    id?: string;
    keyword?: string;
    language: SeoLanguage;
    locale: string;
    countryCode?: string;
    market?: string;
    region?: string;
    originalKeyword: string;
    normalizedKeyword: string;
    cluster: string;
    intent: SearchIntent;
    keywordType?: string;
    trendStatus: TrendStatus;
    lifecycleStatus?: LifecycleStatus;
    isPinned?: boolean;
    isBlocked?: boolean;
    destinationPath: string;
    destinationType?: DestinationType;
    destinationVerified?: boolean;
    targetUrl?: string;
    isYmyl?: boolean;
    medicalRiskLevel?: 'low' | 'medium' | 'high';
    requiresReview?: boolean;
    reviewStatus?: 'pending' | 'approved' | 'rejected' | 'needs_edit';
    score: number;
    rawScore?: number;
    finalScore?: number;
    scoreComponents: ScoreComponents;
    confidenceScore?: number;
    source: KeywordSource;
    dataQuality?: DataQualityType;
    searchVolume?: number;
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
        intentsDistribution: Record<string, number>;
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
    status: 'running' | 'completed' | 'failed' | 'partial' | 'cancelled';
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
    intentWeight?: number;
    conversionWeight?: number;
    organicPerformanceWeight?: number;
    authorityGapWeight?: number;
    repetitionPenaltyWeight?: number;
    cannibalizationPenaltyWeight?: number;
}
