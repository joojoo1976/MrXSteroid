/**
 * Simple keyword generator for footer SEO
 */
import { Language } from '@/shared/types/types';

export const getWeeklyKeywords = (lang: Language): string[] => {
  const baseKeywords = {
    [Language.AR]: ['لياقة', 'كمال أجسام', 'صحة', 'تمارين', 'تغذية'],
    [Language.EN]: ['fitness', 'bodybuilding', 'health', 'workout', 'nutrition']
  };
  
  return baseKeywords[lang] || baseKeywords[Language.EN];
};
