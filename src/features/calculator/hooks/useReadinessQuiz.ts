import { useState, useCallback } from 'react';
import { ContentStrings } from '../../../types';

interface UseReadinessQuizOptions {
    content: ContentStrings;
    onComplete: () => void;
}

export const useReadinessQuiz = ({ content, onComplete }: UseReadinessQuizOptions) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleAnswer = useCallback((points: number) => {
        setScore(s => s + points);
        if (currentQ < content.quiz.questions.length - 1) {
            setCurrentQ(q => q + 1);
        } else {
            setFinished(true);
        }
    }, [currentQ, content.quiz.questions.length]);

    const result = finished ? (score >= 3 ? content.quiz.results.enhanced : content.quiz.results.natural) : null;

    const reset = useCallback(() => {
        setCurrentQ(0);
        setScore(0);
        setFinished(false);
    }, []);

    return {
        currentQ,
        score,
        finished,
        handleAnswer,
        result,
        reset,
        onComplete
    };
};
