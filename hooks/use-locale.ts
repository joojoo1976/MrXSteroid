'use client';

import { useState, useEffect, useCallback } from 'react';
import { Locale, locales, defaultLocale, getLocaleDirection } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { supabase } from '@/lib/supabase/client';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('ltr');
  const [dictionary, setDictionary] = useState(getDictionary(defaultLocale));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user preference from Supabase or localStorage
    const loadLocale = async () => {
      try {
        // Try to get from Supabase first
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('default_language')
            .eq('user_id', user.id)
            .single();
          
          if (preferences?.default_language && locales.includes(preferences.default_language as Locale)) {
            setLocale(preferences.default_language as Locale);
          }
        } else {
          // Fallback to localStorage
          const savedLocale = localStorage.getItem('locale') as Locale | null;
          if (savedLocale && locales.includes(savedLocale)) {
            setLocale(savedLocale);
          }
        }
      } catch (error) {
        console.error('Failed to load locale:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocale();
  }, []);

  useEffect(() => {
    // Update direction and dictionary when locale changes
    setDirection(getLocaleDirection(locale));
    setDictionary(getDictionary(locale));
    
    // Save to localStorage
    localStorage.setItem('locale', locale);
    
    // Update HTML dir attribute
    document.documentElement.dir = getLocaleDirection(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = useCallback(async (newLocale: Locale) => {
    setLocale(newLocale);
    
    // Save to Supabase if user is logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            default_language: newLocale,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (error) {
      console.error('Failed to save locale preference:', error);
    }
  }, []);

  return {
    locale,
    direction,
    dictionary,
    loading,
    changeLocale,
  };
}