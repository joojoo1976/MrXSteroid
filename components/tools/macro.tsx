'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import MacroCalculator from '@/features/calculator/MacroCalculator';

export default function MacroTool() {
  return (
    <LegacyPageShell>
      {({ content, navigateTo }) => <MacroCalculator content={content} navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}