'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import InjectionMap from '@/features/calculator/InjectionMap';

export default function InjectionTool() {
  return (
    <LegacyPageShell>
      {({ content, navigateTo }) => <InjectionMap content={content} navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}