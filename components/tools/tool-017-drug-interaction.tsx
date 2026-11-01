'use client';

import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import i18nJson from '@/i18n/tool-017-drug-interaction.json';
import { checkDrugInteractions } from '@/lib/tools/engines/tool-017-drug-interaction';

export default function Tool017DrugInteraction() {
  const t = useToolI18n(i18nJson);
  const { isRtl } = useToolDisplayPreferences();
  const result = checkDrugInteractions();

  return (
    <section className="pct-timing-tool space-y-4 p-6" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="tool-017-title">
      <h1 id="tool-017-title" className="text-2xl font-bold">{t.tool_name}</h1>
      <div role="status" className="rounded-lg border border-amber-500/50 bg-amber-950/20 p-4 text-amber-100">
        <p className="font-bold">{result.status}</p>
        <p className="mt-2 text-sm">{t.unavailable_reason}</p>
        <p className="mt-2 text-sm">{t.no_safety_claim}</p>
      </div>
      <div className="space-y-2 text-sm text-zinc-300">
        <p>{t.next_step}</p>
        <ul className="list-disc space-y-1 ps-5">
          <li><a className="underline" href="https://dailymed.nlm.nih.gov/dailymed/" target="_blank" rel="noreferrer">{t.dailymed_label}</a></li>
          <li><a className="underline" href="https://www.fda.gov/drugs/resources-drugs/drug-interactions-what-you-should-know" target="_blank" rel="noreferrer">{t.fda_guidance}</a></li>
        </ul>
      </div>
    </section>
  );
}
