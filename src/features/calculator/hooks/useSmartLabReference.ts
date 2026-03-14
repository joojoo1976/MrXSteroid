import { useState, useMemo, useCallback } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface UseSmartLabReferenceOptions {
    content: ContentStrings;
}

export const useSmartLabReference = ({ content }: UseSmartLabReferenceOptions) => {
    const [search, setSearch] = useState('');
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [value, setValue] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredTests = useMemo(() => {
        return content.labReference.tests.filter(test => {
            const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase()) ||
                test.id.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory === 'all' || test.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [content.labReference.tests, search, activeCategory]);

    const getAnalysis = useCallback((test: { min: number, max: number }) => {
        const val = parseFloat(value);
        if (isNaN(val)) return null;
        if (val < test.min) return {
            text: content.labReference.status.low,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            shadow: 'shadow-blue-500/20',
            icon: AlertCircle
        };
        if (val > test.max) return {
            text: content.labReference.status.high,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            shadow: 'shadow-red-500/20',
            icon: AlertCircle
        };
        return {
            text: content.labReference.status.normal,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            shadow: 'shadow-green-500/20',
            icon: CheckCircle2
        };
    }, [value, content.labReference.status]);

    const handleSearchChange = useCallback((val: string) => {
        setSearch(val);
        setAnalyzingId(null);
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        setActiveCategory(category);
        setAnalyzingId(null);
    }, []);

    const startAnalysis = useCallback((id: string) => {
        setAnalyzingId(id);
        setValue('');
    }, []);

    const closeAnalysis = useCallback(() => {
        setAnalyzingId(null);
    }, []);

    return {
        search,
        setSearch: handleSearchChange,
        analyzingId,
        setAnalyzingId: startAnalysis,
        closeAnalysis,
        value,
        setValue,
        activeCategory,
        setActiveCategory: handleCategoryChange,
        filteredTests,
        getAnalysis
    };
};
