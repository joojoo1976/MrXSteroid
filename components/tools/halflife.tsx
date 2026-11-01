'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import HalfLifeVisualizer from '@/features/calculator/HalfLifeVisualizer';

export default function HalfLifeTool() {
  return (
    <LegacyPageShell>
      {({ content }) => <HalfLifeVisualizer content={content} />}
    </LegacyPageShell>
  );
}