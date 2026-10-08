'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCompounds } from '@/lib/hooks/useToolState';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateAromatizationRisk, type EstrogenProlactinInput, type AromatizationScore } from '@/lib/tools/engines/tool-006-estrogen-prolactin';
import { Compound } from '@/lib/types/database';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-006-estrogen-prolactin.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool006EstrogenProlactin() {
  const i18nData = useToolI18n(i18nJson);
  const { data: dbCompounds, isLoading: compoundsLoading } = useCompounds();
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const availableCompounds = dbCompounds || [
    { id: 1, name_en: 'Testosterone', name_ar: 'تستوستيرون', family: 'testosterone', suppression_factor: 1.0, half_life_days: 4.5, is_lipophilic: false, bioavailability: 1.0, default_dose_mg: 50.0, description_text: 'Primary male sex hormone', aromatization_factor: 1.0 },
    { id: 2, name_en: 'Dianabol', name_ar: 'ديانabol', family: 'testosterone', suppression_factor: 1.5, half_life_days: 6.0, is_lipophilic: true, bioavailability: 0.8, default_dose_mg: 50.0, description_text: 'Oral steroid', aromatization_factor: 1.0 },
    { id: 3, name_en: 'Deca Durabolin', name_ar: 'ديدا', family: 'nandrolone', suppression_factor: 0.8, half_life_days: 14.0, is_lipophilic: true, bioavailability: 0.8, default_dose_mg: 200.0, description_text: 'Long-acting nandrolone', aromatization_factor: 0.2 },
  ];

  const [state, setState] = useState({
    e2Level: 40,
    prolactinLevel: 15,
    measurementSystem: 'metric' as 'metric' | 'imperial',
    currentAI: '',
    currentDA: '',
    compoundStack: [] as any[],
  });

  const [aromResult, setAromResult] = useState<AromatizationScore | null>(null);

  useEffect(() => {
    if (state.compoundStack.length > 0) {
      const input: EstrogenProlactinInput = {
        e2Level: state.e2Level,
        prolactinLevel: state.prolactinLevel,
        measurementSystem: state.measurementSystem,
        currentAI: state.currentAI,
        currentDA: state.currentDA,
        compoundStack: state.compoundStack,
      };

      const result = calculateAromatizationRisk(input);
      setAromResult(result);

      debouncedSave({
        ...savedState,
        last_calculated_at: new Date().toISOString(),
      });
    }
  }, [state.compoundStack]);

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
    </div>
  );
}