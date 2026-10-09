'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export type UnitSystem = 'metric' | 'imperial';

const unitConversions = {
  weight: {
    metric: 'kg',
    imperial: 'lbs',
    factor: 2.20462, // kg to lbs
  },
  height: {
    metric: 'cm',
    imperial: 'in',
    factor: 0.393701, // cm to inches
  },
  volume: {
    metric: 'ml',
    imperial: 'fl oz',
    factor: 0.033814, // ml to fl oz
  },
};

export function useUnits() {
  const [units, setUnits] = useState<UnitSystem>('metric');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('default_units')
            .eq('user_id', user.id)
            .single();
          
          if (preferences?.default_units) {
            setUnits(preferences.default_units as UnitSystem);
          }
        } else {
          const savedUnits = localStorage.getItem('units') as UnitSystem | null;
          if (savedUnits) {
            setUnits(savedUnits);
          }
        }
      } catch (error) {
        console.error('Failed to load units:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, []);

  const changeUnits = useCallback(async (newUnits: UnitSystem) => {
    setUnits(newUnits);
    
    localStorage.setItem('units', newUnits);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            default_units: newUnits,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (error) {
      console.error('Failed to save units preference:', error);
    }
  }, []);

  const convert = useCallback((value: number, type: 'weight' | 'height' | 'volume'): number => {
    if (units === 'imperial') {
      return value * unitConversions[type].factor;
    }
    return value;
  }, [units]);

  const getUnit = useCallback((type: 'weight' | 'height' | 'volume'): string => {
    return unitConversions[type][units];
  }, [units]);

  return {
    units,
    loading,
    changeUnits,
    convert,
    getUnit,
  };
}