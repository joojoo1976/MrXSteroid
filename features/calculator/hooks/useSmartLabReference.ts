'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePreferences } from '../../../context/PreferencesContext';
import { LAB_CATEGORIES, LAB_TESTS, LAB_UI } from '@/data/labReference';
import { BilingualText, LabTestData, LabCategory } from '@/data/labReference';
import { LabCategoryId } from '@/data/labReference.types';
import {
  LabUnitSystem,
  convertLabValueSystem,
  evaluateLabValue,
  formatRange,
  getActiveRange,
  roundTo,
} from '@/shared/lib/lab';

export type LabCategoryFilter = LabCategoryId | 'all';

export interface LabAnalysisResult {
  status: 'low' | 'normal' | 'high';
  value: number;
  ratio: number;
  position: number;
  range: { min: number; max: number; unit: string; decimals: number };
}

export interface LabCategoryMeta extends LabCategory {
  count: number;
}

export interface UseSmartLabReferenceReturn {
  t: (text: BilingualText) => string;
  search: string;
  setSearch: (val: string) => void;
  activeCategory: LabCategoryFilter;
  setActiveCategory: (category: LabCategoryFilter) => void;
  categories: LabCategoryMeta[];
  filteredTests: LabTestData[];
  selectedId: string | null;
  selectedTest: LabTestData | null;
  openDetails: (id: string) => void;
  closeDetails: () => void;
  unitSystem: LabUnitSystem;
  setUnitSystem: (system: LabUnitSystem) => void;
  value: string;
  setValue: (val: string) => void;
  getAnalysis: () => LabAnalysisResult | null;
  formatRangeFor: (test: LabTestData, system: LabUnitSystem) => string;
}

export const useSmartLabReference = (): UseSmartLabReferenceReturn => {
  const { unitSystem: prefUnitSystem, isRTL } = usePreferences();

  const [search, setSearchState] = useState('');
  const [activeCategory, setActiveCategoryState] = useState<LabCategoryFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unitSystem, setUnitSystemState] = useState<LabUnitSystem>(
    prefUnitSystem === 'imperial' ? 'imperial' : 'metric'
  );
  const [value, setValueState] = useState('');

  const t = useCallback((text: BilingualText) => (isRTL ? text.ar : text.en), [isRTL]);

  const categories = useMemo<LabCategoryMeta[]>(
    () =>
      LAB_CATEGORIES.map(cat => ({
        ...cat,
        count: LAB_TESTS.filter(test => test.category === cat.id).length,
      })),
    []
  );

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LAB_TESTS.filter(test => {
      if (activeCategory !== 'all' && test.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [
        test.id,
        test.name.en,
        test.name.ar,
        test.description.en,
        test.description.ar,
        ...test.keywords,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, activeCategory]);

  const selectedTest = useMemo(
    () => LAB_TESTS.find(test => test.id === selectedId) ?? null,
    [selectedId]
  );

  const formatRangeFor = useCallback(
    (test: LabTestData, system: LabUnitSystem) => formatRange(test, system),
    []
  );

  const getAnalysis = useCallback((): LabAnalysisResult | null => {
    if (!selectedTest) return null;
    const val = parseFloat(value);
    if (Number.isNaN(val)) return null;
    const evalResult = evaluateLabValue(val, unitSystem, selectedTest.range);
    const active = getActiveRange(selectedTest, unitSystem);
    return { ...evalResult, value: val, range: active };
  }, [selectedTest, value, unitSystem]);

  const setUnitSystem = useCallback(
    (system: LabUnitSystem) => {
      if (system === unitSystem) return system;
      if (selectedTest) {
        const val = parseFloat(value);
        if (!Number.isNaN(val)) {
          const converted = convertLabValueSystem(val, unitSystem, system, selectedTest.range);
          setValueState(String(roundTo(converted, 6)));
        }
      }
      setUnitSystemState(system);
      return system;
    },
    [unitSystem, selectedTest, value]
  );

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
  }, []);

  const setActiveCategory = useCallback((category: LabCategoryFilter) => {
    setActiveCategoryState(category);
  }, []);

  const openDetails = useCallback((id: string) => {
    setSelectedId(id);
    setValueState('');
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedId(null);
    setValueState('');
  }, []);

  return {
    t,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filteredTests,
    selectedId,
    selectedTest,
    openDetails,
    closeDetails,
    unitSystem,
    setUnitSystem,
    value,
    setValue: setValueState,
    getAnalysis,
    formatRangeFor,
  };
};

export { LAB_UI };
