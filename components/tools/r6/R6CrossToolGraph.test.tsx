import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { R6CrossToolGraph } from '@/components/tools/r6/R6CrossToolGraph';
import { getPhase2Manifest } from '@/lib/tools/r6/phase2-manifest';
import type { R6ManifestEntry } from '@/lib/tools/r6/manifest';

const ENTRY: R6ManifestEntry = {
  slug: 'tool-019-cardio-monitor',
  href: '/smarttools/medical-monitoring/tool-019-cardio-monitor',
  index: 28,
  total: 268,
  titleEn: 'Cardio Monitor',
  titleAr: 'مراقبة القلب',
  descriptionEn: 'BP and lipid risk monitor',
  descriptionAr: 'مراقب',
  categorySlug: 'medical-monitoring',
  prevSlug: 'tool-018-hpta-recovery',
  nextSlug: 'tool-020-genetic-potential',
  prevTitleEn: 'HPTA Recovery Monitor',
  prevTitleAr: 'HPTA',
  nextTitleEn: 'Genetic Potential Calculator',
  nextTitleAr: 'Genetic',
  hasOwnBoxes: false,
};

describe('R6CrossToolGraph', () => {
  it('links prev/next tools with labels', () => {
    const m = getPhase2Manifest(ENTRY.slug, ENTRY.categorySlug);
    const { container } = render(<R6CrossToolGraph entry={ENTRY} manifest={m} locale="en" />);
    expect(container.querySelector('[data-crosstool]')).not.toBeNull();
    expect(container.textContent).toContain('HPTA Recovery Monitor');
    expect(container.textContent).toContain('Genetic Potential Calculator');
  });
});
