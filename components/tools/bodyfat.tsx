'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import BodyFatCalculator from '@/features/calculator/BodyFatCalculator';

export default function BodyFatTool() {
  return (
    <LegacyPageShell>
      {({ content, navigateTo }) => <BodyFatCalculator content={content} navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}