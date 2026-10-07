import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-009-injection-site-rotator.json';

export default function Tool009InjectionSiteRotator() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [siteName, setSiteName] = useState<string>('');
  const [location, setLocation] = useState<'deltoid' | 'glute' | 'quad' | 'pectoral' | 'bicep' | 'other'>('deltoid');
  const [oilBased, setOilBased] = useState<boolean>(false);
  const [lastInjection, setLastInjection] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logEntries, setLogEntries] = useState<Array<{
    id: string;
    date: string;
    site: string;
    location: string;
    oil_based: boolean;
  }>>([]));

  useEffect(() => {
    if (savedState?.injection_sites?.logEntries) {
      setLogEntries(savedState.injection_sites.logEntries);
    }
  }, [savedState]);

  useEffect(() => {
    const site: InjectionSite = {
      id: crypto.randomUUID(),
      name_en: siteName || 'New Site',
      name_ar: siteName || 'موقع جديد',
      location,
      oil_based: oilBased,
      last_injection_date: lastInjection,
      next_safe_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      rotation_priority: 1,
    };
    setLogEntries(prev => [...prev, { id: site.id, date: lastInjection, site: siteName || 'Unknown', location, oil_based }]);
    
    setSiteName('');
    setLastInjection(new Date().toISOString().split('T')[0]);
    setOilBased(false);

    debouncedSave({
      ...savedState,
      injection_sites: {
        total_sites_rotated: (savedState?.injection_sites?.total_sites_rotated || 0) + 1,
        logEntries: [...logEntries, { id: site.id, date: lastInjection, site: siteName || 'Unknown', location, oil_based }],
      },
    });
  }, [siteName, location, oilBased, lastInjection]);

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Site Name:</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g., Deltoid Left, Glute Right"
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Location:</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
              className="w-full rounded border p-2"
            >
              <option value="deltoid">Deltoid</option>
              <option value="glute">Glute</option>
              <option value="quad">Quad</option>
              <option value="pectoral">Pectoral</option>
              <option value="bicep">Bicep</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Oil-Based Compound:</label>
          <select
            value={oilBased}
            onChange={(e) => setOilBased(e.target.value === 'true')}
            className="w-full rounded border p-2"
          >
            <option value="false">Water-Based</option>
            <option value="true">Oil-Based</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Last Injection Date:</label>
          <input
            type="date"
            value={lastInjection}
            onChange={(e) => setLastInjection(e.target.value)}
            className="w-full rounded border p-2"
            dir="ltr"
          /></div>
        <button
          onClick={() => {
            if (siteName.trim().length > 0) {
              // Entry handled in useEffect
            }
          }}
          className="mt-2 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          disabled={!siteName.trim().length}
        >
          Log Injection Site
        </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <h3 className="text-semibold mb-3">{i18nData.rotation_plan}</h3>
          <p className="text-zinc-600">Sites logged: {logEntries.length}</p>
        </div>
      </div>
    </div>
  );
}