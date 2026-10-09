'use client';

import { useUnits } from '@/hooks/use-units';

export function UnitSwitcher() {
  const { units, changeUnits } = useUnits();

  const handleSwitch = () => {
    changeUnits(units === 'metric' ? 'imperial' : 'metric');
  };

  return (
    <button
      onClick={handleSwitch}
      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/10 transition-all font-medium"
    >
      {units === 'metric' ? 'Imperial' : 'Metric'}
    </button>
  );
}