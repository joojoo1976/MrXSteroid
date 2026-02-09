import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ContentStrings } from '../../../types';

interface UseDailyIQChallengeOptions {
    content: ContentStrings;
    onWin: () => void;
}

export const useDailyIQChallenge = ({ content, onWin }: UseDailyIQChallengeOptions) => {
    const [answered, setAnswered] = useState(false);
    const [correct, setCorrect] = useState(false);

    // We only use the first question for now as per original component logic
    const question = content.dailyIQ.questions[0];

    const handleOption = useCallback((idx: number) => {
        setAnswered(true);
        if (idx === question.correctIndex) {
            setCorrect(true);
            toast.success(content.dailyIQ.toastCorrect);
            onWin();
        }
    }, [question.correctIndex, content.dailyIQ.toastCorrect, onWin]);

    const reset = useCallback(() => {
        setAnswered(false);
        setCorrect(false);
    }, []);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(content.dailyIQ.copySuccess);
    }, [content.dailyIQ.copySuccess]);

    return {
        answered,
        correct,
        question,
        handleOption,
        reset,
        copyToClipboard
    };
};
