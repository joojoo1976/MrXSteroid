'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import GeneticPotentialCalculator from '@/features/calculator/GeneticPotentialCalculator';

export default function GeneticTool() {
  return (
    <LegacyPageShell>
      {({ content, navigateTo }) => <GeneticPotentialCalculator content={content} navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}