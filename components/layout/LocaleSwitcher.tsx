'use client';

import { useLocale } from '@/hooks/use-locale';
import { Locale, localeNames } from '@/lib/i18n/config';

export function LocaleSwitcher() {
  const { locale, changeLocale } = useLocale();

  const handleSwitch = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    changeLocale(newLocale);
  };

  return (
    <button
      onClick={handleSwitch}
      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/10 transition-all flex items-center gap-2"
    >
      <span className="text-lg">
        {locale === 'ar' ? '🇬🇧' : '🇸🇦'}
      </span>
      <span className="font-medium">
        {locale === 'ar' ? 'English' : 'العربية'}
      </span>
    </button>
  );
}