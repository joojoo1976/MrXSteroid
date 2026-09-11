/**
 * server/seo/scoringEngine.ts
 * Configurable, Multi-Factor Scoring Engine & Freshness Decay.
 * Every keyword gets an explainable 0-100 score and trend classification.
 */

import { ScoreComponents, ScoringWeights, TrendStatus } from './types';

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

/**
 * Calculate the overall Keyword Score (0 to 100).
 * Stores scoreComponents for transparent auditing.
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
 * Determine the TrendStatus of a keyword based on its scores and observation dates.
 *
 * Rules:
 * - NEW: First seen within the last 7 days.
 * - RISING: Trend score >= 85 and observed within last 14 days.
 * - STABLE: Overall score >= 60 and observed within last 30 days.
 * - DECLINING: Not observed for > 30 days or trend score < 50.
 * - RETIRED: Not observed for > 60 days or overall score < 40.
 */
export function determineTrendStatus(params: {
    daysSinceFirstSeen: number;
    daysSinceLastObserved: number;
    trendScore: number;
    overallScore: number;
    inactivityRefreshCycles?: number;
}): TrendStatus {
    const { daysSinceFirstSeen, daysSinceLastObserved, trendScore, overallScore, inactivityRefreshCycles = 0 } = params;

    if (inactivityRefreshCycles >= 4 || daysSinceLastObserved > 60 || overallScore < 40) {
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
