'use client';

import React from 'react';
import LegacyPageShell from '@/components/legacy/LegacyPageShell';
import SmartLabReference from '@/features/calculator/SmartLabReference';

export default function LabTool() {
  return (
    <LegacyPageShell>
      {({ content, navigateTo }) => <SmartLabReference content={content} navigateTo={navigateTo} />}
    </LegacyPageShell>
  );
}