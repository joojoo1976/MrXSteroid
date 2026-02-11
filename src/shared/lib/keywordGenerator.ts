import {
    footerKeywordsPoolAr,
    footerKeywordsPoolEn,
    seoKeywordsArabic,
    seoKeywordsEnglish
} from '../i18n';
import { Language } from '../types';

/**
 * Calculates current week of the year (1-52)
 */
export const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + start.getDay() + 1) / 7);
};

/**
 * Deterministically shuffles an array based on a seed
 */
const seededShuffle = <T>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((seed / (i + 1)) * (i + 1)) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Gets at least 50 smart keywords for the current week and language
 */
export const getWeeklyKeywords = (lang: Language): string[] => {
    const week = getCurrentWeekNumber();
    const isAr = lang === Language.AR;

    // Choose pools
    const footerPool = isAr ? footerKeywordsPoolAr : footerKeywordsPoolEn;
    const seoPool = isAr ? seoKeywordsArabic : seoKeywordsEnglish;

    // Combine or select
    const combined = [...footerPool, ...seoPool];

    // Deterministic shuffle using week as seed
    const shuffled = seededShuffle(combined, week * 13); // Multiply to vary seed

    // Ensure at least 50 (take all if less than 50, but we have more)
    return shuffled.slice(0, Math.max(50, Math.min(combined.length, 60)));
};
