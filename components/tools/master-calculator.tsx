'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import MasterCalculator from '@/features/calculator/MasterCalculator';

export default function MasterCalculatorTool() {
  return (
    <LegacyPageShell>
      {({ navigateTo }) => <MasterCalculator navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}