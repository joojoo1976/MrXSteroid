/**
 * server/seo/scoringEngine.ts
 * Configurable, Multi-Factor Scoring Engine & Freshness Decay (v3.0).
 * Every keyword gets an explainable 0-100 score and trend classification.
 * Supports both legacy signature (v1/v2) and comprehensive multi-factor v3 scoring formula.
 */

import { ScoreComponents, ScoringWeights, TrendStatus, KeywordSource } from './types';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
    relevanceWeight: 0.25,
    demandWeight: 0.15,
    trendWeight: 0.15,
    commercialWeight: 0.15,
    freshnessWeight: 0.10,
    seasonalWeight: 0.10,
    competitorGapWeight: 0.10,
    competitionPenaltyWeight: 0.05,
    duplicatePenaltyWeight: 0.05,
};

export const V3_SCORING_WEIGHTS = {
    relevance: 0.20,
    demand: 0.12,
    growth: 0.12,
    intent: 0.15,
    conversion: 0.12,
    commercial: 0.10,
    seasonal: 0.08,
    organicPerformance: 0.06,
    authorityGap: 0.05,

    // Penalties
    competitionPenalty: 0.08,
    repetitionPenalty: 0.05,
    duplicatePenalty: 0.05,
    cannibalizationPenalty: 0.05,
};

/**
 * Calculate the overall Keyword Score (0 to 100).
 * Preserves exact backward-compatible signature.
 */
export function calculateKeywordScore(
    components: ScoreComponents,
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): number {
    const rawScore =
        components.relevance * weights.relevanceWeight +
        components.demand * weights.demandWeight +
        components.trend * weights.trendWeight +
        components.commercial * weights.commercialWeight +
        components.freshness * weights.freshnessWeight +
        components.seasonal * weights.seasonalWeight +
        (components.competitorGap ?? 50) * weights.competitorGapWeight -
        components.competitionPenalty * weights.competitionPenaltyWeight -
        components.duplicatePenalty * weights.duplicatePenaltyWeight;

    // Constrain to [0, 100] and round to 2 decimal places
    const clamped = Math.max(0, Math.min(100, rawScore));
    return Math.round(clamped * 100) / 100;
}

/**
 * Global SEO Intelligence Platform v3.0 precision scoring formula:
 * Positive Score = 0.20R + 0.12D + 0.12G + 0.15I + 0.12V + 0.10C + 0.08S + 0.06O + 0.05A
 * Penalty Score = 0.08K + 0.05Pr + 0.05Pd + 0.05Pc
 * Raw Score = Positive Score - Penalty Score
 * Final Score = clamp(normalize(Raw Score), 0, 100)
 */
export function calculateKeywordScoreV3(components: ScoreComponents): {
    rawScore: number;
    finalScore: number;
    scoreVersion: string;
} {
    const r = components.relevance ?? 0;
    const d = components.demand ?? 0;
    const g = components.trend ?? 0;
    const i = components.intent ?? components.relevance ?? 0;
    const v = components.conversion ?? components.commercial ?? 0;
    const c = components.commercial ?? 0;
    const s = components.seasonal ?? 80;
    const o = components.organicPerformance ?? 70;
    const a = components.competitorGap ?? 50;

    const positiveScore =
        r * V3_SCORING_WEIGHTS.relevance +
        d * V3_SCORING_WEIGHTS.demand +
        g * V3_SCORING_WEIGHTS.growth +
        i * V3_SCORING_WEIGHTS.intent +
        v * V3_SCORING_WEIGHTS.conversion +
        c * V3_SCORING_WEIGHTS.commercial +
        s * V3_SCORING_WEIGHTS.seasonal +
        o * V3_SCORING_WEIGHTS.organicPerformance +
        a * V3_SCORING_WEIGHTS.authorityGap;

    const k = components.competitionPenalty ?? 0;
    const pr = components.repetitionPenalty ?? 0;
    const pd = components.duplicatePenalty ?? 0;
    const pc = components.cannibalizationPenalty ?? 0;

    const penaltyScore =
        k * V3_SCORING_WEIGHTS.competitionPenalty +
        pr * V3_SCORING_WEIGHTS.repetitionPenalty +
        pd * V3_SCORING_WEIGHTS.duplicatePenalty +
        pc * V3_SCORING_WEIGHTS.cannibalizationPenalty;

    const rawScore = positiveScore - penaltyScore;
    const clamped = Math.max(0, Math.min(100, rawScore));
    const finalScore = Math.round(clamped * 100) / 100;

    return {
        rawScore: Math.round(rawScore * 1000) / 1000,
        finalScore,
        scoreVersion: 'v3.0',
    };
}

/**
 * Calculate dynamic confidence score (0-100) based on source provenance and verification.
 */
export function calculateSourceConfidence(
    source: KeywordSource | string,
    hasPageSupporting: boolean = true,
    isTermsVerified: boolean = false
): number {
    let baseConfidence = 50;

    switch (source) {
        case 'google_search_console':
            baseConfidence = 95;
            break;
        case 'internal_search':
            baseConfidence = 85;
            break;
        case 'semrush':
        case 'ahrefs':
            baseConfidence = 85;
            break;
        case 'google_trends':
        case 'trend':
            baseConfidence = 75;
            break;
        case 'competitor':
        case 'competitor_page':
            baseConfidence = 65;
            break;
        case 'baseline':
        case 'editorial':
        case 'admin':
            baseConfidence = 55;
            break;
        case 'ai_suggested':
            baseConfidence = 30;
            break;
        default:
            baseConfidence = 20;
    }

    if (isTermsVerified) baseConfidence += 5;
    if (!hasPageSupporting) baseConfidence -= 15;

    return Math.max(5, Math.min(100, baseConfidence));
}

/**
 * Calculate freshness score based on days elapsed since last observed.
 * Fresh keywords start at 100 and decay over time.
 */
export function calculateFreshnessScore(daysSinceObserved: number): number {
    if (daysSinceObserved <= 0) return 100;
    // Linear decay: loses 1.5 points per day, floor at 10
    const decayed = 100 - daysSinceObserved * 1.5;
    return Math.max(10, Math.min(100, Math.round(decayed)));
}

/**
 * Calculate seasonal relevance score (0-100) based on cluster and calendar month.
 * Months are 1-12 (Jan - Dec).
 */
export function calculateSeasonalScore(cluster: string, month: number = new Date().getMonth() + 1): number {
    // Spring / Summer (March - August): Cutting, Fat loss, Single-digit body fat, Contest prep
    if (month >= 3 && month <= 8) {
        if (cluster === 'cutting-fatloss') return 95;
        if (cluster === 'smart-tools') return 90;
        if (cluster === 'bulking-mass') return 70;
    }

    // Fall / Winter / New Year (September - February): Bulking, Strength, PCT, Health recovery
    if (month >= 9 || month <= 2) {
        if (cluster === 'bulking-mass') return 95;
        if (cluster === 'pct-recovery') return 92;
        if (cluster === 'hormone-safety') return 90;
        if (cluster === 'cutting-fatloss') return 70;
    }

    // Baseline seasonal score
    return 80;
}

/**
 * Determine the TrendStatus of a keyword with Hysteresis rules to prevent flapping.
 */
export function determineTrendStatus(params: {
    daysSinceFirstSeen: number;
    daysSinceLastObserved: number;
    trendScore: number;
    overallScore: number;
    inactivityRefreshCycles?: number;
    consecutiveLowRuns?: number;
}): TrendStatus {
    const {
        daysSinceFirstSeen,
        daysSinceLastObserved,
        trendScore,
        overallScore,
        inactivityRefreshCycles = 0,
        consecutiveLowRuns = 0,
    } = params;

    // Hysteresis: only retire if inactive for > 60 days, or >= 3 consecutive low runs, or overallScore <= 40
    if (consecutiveLowRuns >= 3 || inactivityRefreshCycles >= 4 || daysSinceLastObserved > 60 || overallScore <= 40) {
        return 'retired';
    }

    if (daysSinceLastObserved > 30 || trendScore < 50) {
        return 'declining';
    }

    if (daysSinceFirstSeen <= 7) {
        return 'new';
    }

    if (trendScore >= 85 && daysSinceLastObserved <= 14) {
        return 'rising';
    }

    return 'stable';
}
