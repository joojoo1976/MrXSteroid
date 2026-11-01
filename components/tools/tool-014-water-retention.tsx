'use client';

import i18nJson from '@/i18n/tool-014-water-retention.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

export default function Tool014WaterRetention() {
  const i18nData = useToolI18n(i18nJson);
  const { isRtl } = useToolDisplayPreferences();

  return (
    <section className="pct-timing-tool p-6" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="tool-014-title">
      <h1 id="tool-014-title" className="mb-4 text-2xl font-bold">{i18nData.tool_name}</h1>
      <div role="status" className="rounded-lg border border-amber-500/50 bg-amber-950/20 p-4">
        <p className="font-semibold">{i18nData.not_available}</p>
        <p className="mt-2 text-sm">{i18nData.model_unavailable_reason}</p>
      </div>
    </section>
  );
}
