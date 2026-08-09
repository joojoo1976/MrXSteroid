'use client';

import { useState, useCallback, useMemo } from 'react';
import { ContentStrings } from '@/shared/types/types';

interface UseReadinessQuizOptions {
    content: ContentStrings;
    onComplete?: () => void;
}

/** Fisher-Yates shuffle — returns new shuffled array */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Generate a short Steroid-IQ discount code (uppercase alphanumeric) */
function generateDiscountCode(discount: '0.5' | '1'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const prefix = discount === '1' ? 'IQ1P' : 'IQ05';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${suffix}`;
}

/** Pick which discount tier (0.5% or 1%) – 50/50 random */
function pickDiscount(): '0.5' | '1' {
    return Math.random() < 0.5 ? '0.5' : '1';
}

const QUESTIONS_PER_SESSION = 5;

export const useReadinessQuiz = ({ content }: UseReadinessQuizOptions) => {
    const allQuestions = content.quiz.questions;

    /** Randomly select 5 questions each time the quiz starts / resets */
    const sessionQuestions = useMemo(
        () => shuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const [discountValue, setDiscountValue] = useState<'0.5' | '1' | null>(null);

    const handleAnswer = useCallback((points: number) => {
        const newScore = score + points;
        setScore(newScore);
        const isLast = currentQ >= sessionQuestions.length - 1;
        if (isLast) {
            setFinished(true);
            if (newScore >= 3) {
                const tier = pickDiscount();
                setDiscountValue(tier);
                setDiscountCode(generateDiscountCode(tier));
            }
        } else {
            setCurrentQ(q => q + 1);
        }
    }, [score, currentQ, sessionQuestions.length]);

    const result = finished
        ? (score >= 3 ? content.quiz.results.enhanced : content.quiz.results.natural)
        : null;

    const isReady = finished && score >= 3;

    const reset = useCallback(() => {
        setCurrentQ(0);
        setScore(0);
        setFinished(false);
        setDiscountCode(null);
        setDiscountValue(null);
        // Force new question shuffle on reset by reloading the page state
        window.location.reload();
    }, []);

    return {
        currentQ,
        score,
        finished,
        handleAnswer,
        result,
        isReady,
        discountCode,
        discountValue,
        reset,
        sessionQuestions,
        totalQuestions: sessionQuestions.length,
    };
};
